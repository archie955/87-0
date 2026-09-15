import { describe, it, expect, beforeEach } from "vitest";
import {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import api from "@/services/api";

type Handler = (config: InternalAxiosRequestConfig) => AxiosResponse;

let handler: Handler;

const makeResponse = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = {},
): AxiosResponse => ({
  data,
  status,
  statusText: status >= 200 && status < 300 ? "OK" : "Error",
  headers: {},
  config,
});

beforeEach(() => {
  handler = (config) => makeResponse(config, 200);

  api.defaults.adapter = async (config) => {
    const internal = config as InternalAxiosRequestConfig;
    const res = handler(internal);

    if (res.status < 200 || res.status >= 300) {
      throw new AxiosError(
        `Request failed with status code ${res.status}`,
        "ERR_BAD_REQUEST",
        internal,
        undefined,
        res,
      );
    }

    return res;
  };
});

describe("api response interceptor", () => {
  it("passes through successful responses untouched", async () => {
    handler = (config) => makeResponse(config, 200, { hello: "world" });

    const res = await api.get("/anything");

    expect(res.data).toEqual({ hello: "world" });
  });

  it("retries a 401 by refreshing the token and re-issuing the original request", async () => {
    const calls: string[] = [];

    handler = (config) => {
      const url = config.url ?? "";
      calls.push(url);

      if (url === "/auth/refresh") return makeResponse(config, 200);
      if (calls.filter((c) => c === "/protected").length === 1) {
        return makeResponse(config, 401);
      }
      return makeResponse(config, 200, { ok: true });
    };

    const res = await api.get("/protected");

    expect(res.data).toEqual({ ok: true });
    expect(calls).toEqual(["/protected", "/auth/refresh", "/protected"]);
  });

  it("rejects with an AxiosError when the refresh call itself fails", async () => {
    handler = (config) => makeResponse(config, 401);

    await expect(api.get("/protected")).rejects.toBeInstanceOf(AxiosError);
  });

  it("does not loop when the retried request 401s again", async () => {
    let refreshCount = 0;

    handler = (config) => {
      if (config.url === "/auth/refresh") {
        refreshCount += 1;
        return makeResponse(config, 200);
      }
      return makeResponse(config, 401);
    };

    await expect(api.get("/protected")).rejects.toBeInstanceOf(AxiosError);

    expect(refreshCount).toBe(1);
  });

  it("shares a single refresh promise across concurrent 401s", async () => {
    let refreshCount = 0;
    const perUrl: Record<string, number> = {};

    handler = (config) => {
      const url = config.url ?? "";
      if (url === "/auth/refresh") {
        refreshCount += 1;
        return makeResponse(config, 200);
      }
      perUrl[url] = (perUrl[url] ?? 0) + 1;
      if (perUrl[url] === 1) return makeResponse(config, 401);
      return makeResponse(config, 200);
    };

    const [a, b, c] = await Promise.all([
      api.get("/a"),
      api.get("/b"),
      api.get("/c"),
    ]);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(c.status).toBe(200);
    expect(refreshCount).toBe(1);
  });

  it("never retries a 401 that came back from /auth/refresh", async () => {
    let refreshCount = 0;

    handler = (config) => {
      if (config.url === "/auth/refresh") {
        refreshCount += 1;
        return makeResponse(config, 401);
      }
      return makeResponse(config, 200);
    };

    await expect(api.post("/auth/refresh")).rejects.toBeInstanceOf(AxiosError);

    expect(refreshCount).toBe(1);
  });
});

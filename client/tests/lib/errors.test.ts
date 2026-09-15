import { describe, it, expect } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { getErrorMessage } from "@/lib/errors";

const axiosError = (opts: {
  status?: number;
  detail?: unknown;
  message?: string;
}) => {
  const error = new AxiosError(
    opts.message ?? "Request failed",
    undefined,
    undefined,
    undefined,
    opts.status
      ? {
          status: opts.status,
          statusText: "Error",
          headers: {},
          config: { headers: new AxiosHeaders() },
          data: opts.detail === undefined ? {} : { detail: opts.detail },
        }
      : undefined,
  );
  return error;
};

describe("getErrorMessage", () => {
  it("returns the backend detail string when present", () => {
    expect(
      getErrorMessage(
        axiosError({ status: 400, detail: "Bad lineup" }),
        "fallback",
      ),
    ).toBe("Bad lineup");
  });

  it("ignores empty detail strings and falls back to the axios message", () => {
    expect(
      getErrorMessage(
        axiosError({ status: 400, detail: "", message: "Request failed" }),
        "fallback",
      ),
    ).toBe("Request failed");
  });

  it("ignores non-string detail values", () => {
    expect(
      getErrorMessage(
        axiosError({
          status: 422,
          detail: { reason: "x" },
          message: "Request failed",
        }),
        "fallback",
      ),
    ).toBe("Request failed");
  });

  it("falls back to the fallback when axios has no response and no message", () => {
    const err = axiosError({ message: "" });
    expect(getErrorMessage(err, "fallback")).toBe("fallback");
  });

  it("returns the message from a plain Error", () => {
    expect(getErrorMessage(new Error("boom"), "fallback")).toBe("boom");
  });

  it("ignores empty Error messages", () => {
    expect(getErrorMessage(new Error(""), "fallback")).toBe("fallback");
  });

  it("returns the fallback for non-Error values", () => {
    expect(getErrorMessage("nope", "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});

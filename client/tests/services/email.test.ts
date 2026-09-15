import { describe, it, expect, beforeEach, vi } from "vitest";

vi.unmock("@/services/email");

import api from "@/services/api";
import emailService from "@/services/email";
import type { Credentials, RegisterUser } from "@/types/userTypes";
import { axiosRes } from "../helpers/axios";

const postSpy = vi.spyOn(api, "post");

beforeEach(() => {
  postSpy.mockReset();
});

describe("emailService.createAccount", () => {
  it("POSTs the registration payload to /email", async () => {
    const credentials: RegisterUser = {
      username: "s1mple",
      email: "s1mple@example.com",
      password: "pwd",
    };
    postSpy.mockResolvedValue(axiosRes(undefined));

    await emailService.createAccount(credentials);

    expect(postSpy).toHaveBeenCalledWith("/email", credentials);
  });
});

describe("emailService.login", () => {
  it("POSTs url-encoded credentials to /email/login", async () => {
    const credentials: Credentials = {
      username: "s1mple@example.com",
      password: "pwd",
    };
    postSpy.mockResolvedValue(axiosRes(undefined));

    await emailService.login(credentials);

    expect(postSpy).toHaveBeenCalledOnce();

    const [url, body, config] = postSpy.mock.calls[0];

    expect(url).toBe("/email/login");
    expect(body).toBeInstanceOf(URLSearchParams);
    expect((body as URLSearchParams).get("username")).toBe(
      credentials.username,
    );
    expect((body as URLSearchParams).get("password")).toBe(
      credentials.password,
    );
    expect(config).toMatchObject({
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  });
});

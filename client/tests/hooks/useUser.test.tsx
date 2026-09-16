import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import useUser from "@/hooks/useUser";
import userService from "@/services/user";
import emailService from "@/services/email";
import authService from "@/services/auth";
import type { UserReturned } from "@/types/userTypes";
import { createQueryWrapper } from "../helpers/wrappers";

const user: UserReturned = {
  id: 1,
  username: "s1mple",
  best_score: null,
  email_login: null,
  steam_login: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.mocked(userService.getUser).mockReset();
  vi.mocked(userService.updateUser).mockReset();
  vi.mocked(userService.deleteUser).mockReset();
  vi.mocked(emailService.createAccount).mockReset();
  vi.mocked(emailService.login).mockReset();
  vi.mocked(authService.logout).mockReset();
});

describe("useUser", () => {
  it("exposes the fetched user when the session is valid", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isPending).toBe(false));

    expect(hook.current.user).toEqual(user);
    expect(hook.current.isError).toBe(false);
  });

  it("reports no session as an error, not a pending state", async () => {
    vi.mocked(userService.getUser).mockRejectedValue(new Error("no session"));

    const { Wrapper } = createQueryWrapper();
    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.isError).toBe(true));
    expect(hook.current.user).toBeNull();
  });

  it("create_email calls emailService.createAccount and invalidates the user query", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);
    vi.mocked(emailService.createAccount).mockResolvedValue();

    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.current.isPending).toBe(false));

    await hook.current.create_email({
      username: "new",
      email: "new@example.com",
      password: "pwd",
    });

    expect(emailService.createAccount).toHaveBeenCalledWith({
      username: "new",
      email: "new@example.com",
      password: "pwd",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
  });

  it("login_email calls emailService.login and invalidates the user query", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);
    vi.mocked(emailService.login).mockResolvedValue();

    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.current.isPending).toBe(false));

    await hook.current.login_email({
      username: "s1mple@example.com",
      password: "pwd",
    });

    expect(emailService.login).toHaveBeenCalledWith({
      username: "s1mple@example.com",
      password: "pwd",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
  });

  it("update_user calls userService.updateUser and invalidates the user query", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);
    vi.mocked(userService.updateUser).mockResolvedValue(user);

    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.current.isPending).toBe(false));

    await hook.current.update_user({
      updated_username: "renamed",
    });

    expect(userService.updateUser).toHaveBeenCalledWith({
      updated_username: "renamed",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
  });

  it("delete_user calls userService.deleteUser and invalidates the user query", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);
    vi.mocked(userService.deleteUser).mockResolvedValue();

    const { Wrapper, queryClient } = createQueryWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });
    await waitFor(() => expect(hook.current.isPending).toBe(false));

    await hook.current.delete_user();

    expect(userService.deleteUser).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["user"] });
  });

  it("logout calls authService.logout and clears the cached user", async () => {
    vi.mocked(userService.getUser).mockResolvedValue(user);
    vi.mocked(authService.logout).mockResolvedValue();

    const { Wrapper, queryClient } = createQueryWrapper();
    const { result: hook } = renderHook(() => useUser(), { wrapper: Wrapper });

    await waitFor(() => expect(hook.current.user).toEqual(user));

    act(() => hook.current.logout());

    await waitFor(() => expect(queryClient.getQueryData(["user"])).toBeNull());
    expect(authService.logout).toHaveBeenCalled();
  });
});

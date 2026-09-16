import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "../test-utils";
import Account from "@/pages/Account";
import useUser from "@/hooks/useUser";
import { useNotificationStore } from "@/stores/notificationStore";
import type { UserReturned } from "@/types/userTypes";

vi.mock("@/hooks/useUser");

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

const baseUser: UserReturned = {
  id: 1,
  username: "s1mple",
  best_score: 5.5,
  email_login: null,
  steam_login: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const baseHook = (): ReturnType<typeof useUser> => ({
  user: baseUser,
  isPending: false,
  isError: false,
  create_email: vi.fn(),
  login_email: vi.fn(),
  delete_user: vi.fn().mockResolvedValue(undefined),
  update_user: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn(),
});

beforeEach(() => {
  vi.mocked(useUser).mockReset();
  navigateSpy.mockReset();
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
});

describe("Account — rendering", () => {
  it("shows a loading state while the session is pending", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      user: null,
      isPending: true,
    });

    render(<Account />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders the profile card with username and best score", () => {
    vi.mocked(useUser).mockReturnValue(baseHook());

    render(<Account />);

    expect(screen.getAllByText("s1mple")[0]).toBeInTheDocument();
    expect(screen.getByText("5.50")).toBeInTheDocument();
  });

  it("renders the empty-score state when best_score is null", () => {
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      user: { ...baseUser, best_score: null },
    });

    render(<Account />);

    expect(screen.getByText(/No score on record/i)).toBeInTheDocument();
  });
});

describe("Account — profile edit", () => {
  it("calls update_user and shows a success notification on save", async () => {
    const user = userEvent.setup();
    const updateUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      update_user: updateUser,
    });

    render(<Account />);

    await user.clear(screen.getByLabelText("New username"));
    await user.type(screen.getByLabelText("New username"), "renamed");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        updated_username: "renamed",
      }),
    );

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toBe(
        "Account updated",
      ),
    );
    expect(useNotificationStore.getState().severity).toBe("success");
  });

  it("shows an error notification when update_user fails", async () => {
    const user = userEvent.setup();
    const updateUser = vi.fn().mockRejectedValue(new Error("bad"));
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      update_user: updateUser,
    });

    render(<Account />);

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() =>
      expect(useNotificationStore.getState().severity).toBe("error"),
    );
    expect(useNotificationStore.getState().notification).toMatch(
      /couldn't save changes/i,
    );
  });
});

describe("Account — sign out", () => {
  it("calls logout and navigates home", async () => {
    const user = userEvent.setup();
    const logout = vi.fn();
    vi.mocked(useUser).mockReturnValue({ ...baseHook(), logout });

    render(<Account />);

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(logout).toHaveBeenCalledOnce();
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });
});

describe("Account — delete flow", () => {
  it("opens the confirmation dialog when Delete account is clicked", async () => {
    const user = userEvent.setup();
    vi.mocked(useUser).mockReturnValue(baseHook());

    render(<Account />);

    await user.click(screen.getByRole("button", { name: /^delete account$/i }));

    expect(
      await screen.findByText(/permanently deletes your account/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls delete_user, notifies, and navigates when confirmed", async () => {
    const user = userEvent.setup();
    const deleteUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      delete_user: deleteUser,
    });

    render(<Account />);

    await user.click(screen.getByRole("button", { name: /^delete account$/i }));

    const buttons = screen.getAllByRole("button", {
      name: /^delete account$/i,
    });
    await user.click(buttons[buttons.length - 1]);

    await waitFor(() => expect(deleteUser).toHaveBeenCalledOnce());
    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/"));
    expect(useNotificationStore.getState().notification).toMatch(
      /your account has been deleted/i,
    );
  });

  it("does nothing when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const deleteUser = vi.fn();
    vi.mocked(useUser).mockReturnValue({
      ...baseHook(),
      delete_user: deleteUser,
    });

    render(<Account />);

    await user.click(screen.getByRole("button", { name: /^delete account$/i }));
    await user.click(await screen.findByRole("button", { name: /cancel/i }));

    expect(deleteUser).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});

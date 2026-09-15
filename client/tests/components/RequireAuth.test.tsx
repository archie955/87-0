import { describe, it, expect, vi, beforeEach } from "vitest";
import { Route, Routes } from "react-router-dom";
import { render, screen } from "../test-utils";
import RequireAuth from "@/layout/RequireAuth";
import useUser from "@/hooks/useUser";
import type { UserReturned } from "@/types/userTypes";

vi.mock("@/hooks/useUser");

const sampleUser: UserReturned = {
  id: 1,
  username: "s1mple",
  best_score: null,
  email_login: null,
  steam_login: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockUseUser = (overrides: Partial<ReturnType<typeof useUser>>) => {
  vi.mocked(useUser).mockReturnValue({
    user: null,
    isPending: false,
    isError: false,
    create_email: vi.fn(),
    login_email: vi.fn(),
    delete_user: vi.fn(),
    update_user: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  });
};

const renderProtected = () =>
  render(
    <Routes>
      <Route path="/login" element={<p>Login page</p>} />
      <Route
        path="/protected"
        element={
          <RequireAuth>
            <p>Secret content</p>
          </RequireAuth>
        }
      />
    </Routes>,
    { route: "/protected" },
  );

beforeEach(() => {
  vi.mocked(useUser).mockReset();
});

describe("RequireAuth", () => {
  it("shows a loading state while the session is being checked", () => {
    mockUseUser({ user: null, isPending: true });

    renderProtected();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });

  it("redirects to /login when there is no user", () => {
    mockUseUser({ user: null, isPending: false });

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects to /login when the session check errored, even if stale user data is present", () => {
    mockUseUser({ user: sampleUser, isPending: false, isError: true });

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the protected content once a user is confirmed", () => {
    mockUseUser({ user: sampleUser, isPending: false, isError: false });

    renderProtected();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});

import { Route, Routes } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test-utils";
import RequireAuth from "@/layout/RequireAuth";
import useUser from "@/hooks/useUser";

vi.mock("@/hooks/useUser");

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

describe("RequireAuth", () => {
  it("shows a loading state while the session is being checked", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isPending: true,
      isError: false,
      create_email: vi.fn(),
      login_email: vi.fn(),
      delete_user: vi.fn(),
      update_user: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects to /login when there is no user", () => {
    vi.mocked(useUser).mockReturnValue({
      user: null,
      isPending: false,
      isError: false,
      create_email: vi.fn(),
      login_email: vi.fn(),
      delete_user: vi.fn(),
      update_user: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects to /login when the session check errored, even if user data is stale-present", () => {
    vi.mocked(useUser).mockReturnValue({
      user: {
        id: 1,
        username: "s1mple",
        best_score: null,
        email_login: null,
        steam_login: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      isPending: false,
      isError: true,
      create_email: vi.fn(),
      login_email: vi.fn(),
      delete_user: vi.fn(),
      update_user: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected content once a user is confirmed", () => {
    vi.mocked(useUser).mockReturnValue({
      user: {
        id: 1,
        username: "s1mple",
        best_score: null,
        email_login: null,
        steam_login: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      isPending: false,
      isError: false,
      create_email: vi.fn(),
      login_email: vi.fn(),
      delete_user: vi.fn(),
      update_user: vi.fn(),
      logout: vi.fn(),
    });

    renderProtected();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
  });
});

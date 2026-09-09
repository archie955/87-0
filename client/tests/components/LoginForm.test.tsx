import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "../test-utils";
import LoginForm from "@/components/LoginForm";
import emailService from "@/services/email";
import { useLoginStore } from "@/stores/loginStore";

const navigateSpy = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

const fillLoginForm = async (
  user: ReturnType<typeof userEvent.setup>,
  { email = "player@example.com", password = "playerexamplepassword" } = {},
) => {
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
};

describe("LoginForm", () => {
  it("renders the email/password fields and the Steam entry point", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const steamForm = screen
      .getByRole("button", {
        name: /login with steam/i,
      })
      .closest("form");
    expect(steamForm).toHaveAttribute("action", "/api/steam/login");
    expect(steamForm).toHaveAttribute("method", "GET");
  });

  it("logs in, notifies success, and navigates home", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.login).mockResolvedValue();
    render(<LoginForm />);

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(emailService.login).toHaveBeenCalledWith({
        username: "player@example.com",
        password: "playerexamplepassword",
      });
    });

    expect(
      await screen.findByText("Successfully logged in"),
    ).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("shows an error and does not navigate when the credentials are rejected", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.login).mockRejectedValue(
      new Error("invalid credentials"),
    );
    render(<LoginForm />);

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText("Login Failed")).toBeInTheDocument();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("does not attempt to log in while the required fields are empty", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.login).mockResolvedValue();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(emailService.login).not.toHaveBeenCalled();
  });

  it("warns that password reset is unavailable instead of navigating anywhere", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(
      screen.getByRole("button", { name: /forgot your password/i }),
    );

    expect(
      await screen.findByText("This service is not currently available"),
    ).toBeInTheDocument();
  });

  it("switches to the registration form via the shared login store", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(useLoginStore.getState().login).toBe(true);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(useLoginStore.getState().login).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "../test-utils";
import LoginForm from "@/components/LoginForm";
import emailService from "@/services/email";
import { useNotificationStore } from "@/stores/notificationStore";
import { useLoginStore } from "@/stores/loginStore";

const navigateSpy = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  { email = "player@example.com", password = "playerexamplepassword" } = {},
) => {
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /^login$/i }));
};

beforeEach(() => {
  navigateSpy.mockReset();
  vi.mocked(emailService.login).mockReset();
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
});

describe("LoginForm", () => {
  it("renders the email/password fields and the Steam entry point, with forgotten password message", async () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const steamForm = screen
      .getByRole("button", { name: /login with steam/i })
      .closest("form");

    expect(steamForm).toHaveAttribute("action", "/api/steam/login");
    expect(steamForm).toHaveAttribute("method", "GET");

    expect(
      await screen.findByText(
        "Forgot your password? Login with steam instead (recommended)",
        undefined,
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });

  it("logs in, sets a success notification, and navigates home", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.login).mockResolvedValue();

    render(<LoginForm />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(emailService.login).toHaveBeenCalledWith({
        username: "player@example.com",
        password: "playerexamplepassword",
      }),
    );

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/"));

    const state = useNotificationStore.getState();
    expect(state.notification).toBe("Successfully logged in");
    expect(state.severity).toBe("success");
    expect(state.open).toBe(true);
  });

  it("shows an error and does not navigate when the credentials are rejected", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.login).mockRejectedValue(
      new Error("invalid credentials"),
    );

    render(<LoginForm />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toBe("Login Failed"),
    );

    expect(useNotificationStore.getState().severity).toBe("error");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("does not attempt to log in while the required fields are empty", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(emailService.login).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("switches to the registration form via the shared login store", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    expect(useLoginStore.getState().login).toBe(true);

    await user.click(screen.getByRole("button", { name: /register/i }));

    expect(useLoginStore.getState().login).toBe(false);
  });
});

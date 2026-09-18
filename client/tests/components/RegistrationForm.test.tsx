import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "../test-utils";
import RegistrationForm from "@/components/RegistrationForm";
import emailService from "@/services/email";
import { useNotificationStore } from "@/stores/notificationStore";
import { useLoginStore } from "@/stores/loginStore";
import Login from "@/pages/Login";

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
  {
    username = "playerusername",
    email = "player@example.com",
    password = "playerexamplepassword",
  } = {},
) => {
  await user.type(screen.getByLabelText("Username"), username);
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);
  await user.click(screen.getByRole("button", { name: /^register$/i }));
};

beforeEach(() => {
  navigateSpy.mockReset();
  vi.mocked(emailService.createAccount).mockReset();
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
});

describe("RegistrationForm", () => {
  it("renders the username/email/password fields and the Steam entry point", () => {
    render(<RegistrationForm />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const steamForm = screen
      .getByRole("button", { name: /register with steam/i })
      .closest("form");

    expect(steamForm).toHaveAttribute("action", "/api/steam");
    expect(steamForm).toHaveAttribute("method", "POST");
  });

  it("registers the user, sets a success notification, and navigates home", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.createAccount).mockResolvedValue();

    render(<RegistrationForm />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(emailService.createAccount).toHaveBeenCalledWith({
        username: "playerusername",
        email: "player@example.com",
        password: "playerexamplepassword",
      }),
    );

    await waitFor(() => expect(navigateSpy).toHaveBeenCalledWith("/"));

    const state = useNotificationStore.getState();
    expect(state.notification).toBe("Successfully registered user");
    expect(state.severity).toBe("success");
  });

  it("shows an error and does not navigate when registration is rejected", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.createAccount).mockRejectedValue(
      new Error("duplicate"),
    );

    render(<RegistrationForm />);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toBe(
        "Registration Failed",
      ),
    );

    expect(useNotificationStore.getState().severity).toBe("error");
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  describe("client-side validation", () => {
    it("rejects a malformed email before contacting the service", async () => {
      const user = userEvent.setup();

      render(<RegistrationForm />);

      await fillAndSubmit(user, { email: "not-an-email" });

      expect(emailService.createAccount).not.toHaveBeenCalled();
      expect(useNotificationStore.getState().notification).toBe(
        "Please enter a valid email address.",
      );
      expect(useNotificationStore.getState().severity).toBe("error");
    });

    it("rejects a password shorter than 6 characters", async () => {
      const user = userEvent.setup();

      render(<RegistrationForm />);

      await fillAndSubmit(user, { password: "short" });

      expect(emailService.createAccount).not.toHaveBeenCalled();
      expect(useNotificationStore.getState().notification).toBe(
        "Password must be at least 6 characters long.",
      );
    }, 20000);

    it("does not attempt to submit while the required fields are empty", async () => {
      const user = userEvent.setup();

      render(<RegistrationForm />);

      await user.click(screen.getByRole("button", { name: /^register$/i }));

      expect(emailService.createAccount).not.toHaveBeenCalled();
    });
  });

  describe("integration with the Login page", () => {
    it("swaps between LoginForm and RegistrationForm via the shared store", async () => {
      const user = userEvent.setup();
      render(<Login />);

      expect(
        await screen.findByText(
          "Logging into an account allows us to track your best game. It is advised " +
            "to use Steam to login rather than email.",
          undefined,
          { timeout: 3000 },
        ),
      ).toBeInTheDocument();
      expect(useLoginStore.getState().login).toBe(true);

      await user.click(screen.getByRole("button", { name: /register/i }));
      expect(useLoginStore.getState().login).toBe(false);
      expect(
        await screen.findByText(
          "Creating an account allows us to track your best game. It is advised " +
            "to use Steam to create your account.",
          undefined,
          { timeout: 3000 },
        ),
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /login/i }));
      expect(useLoginStore.getState().login).toBe(true);
      expect(
        await screen.findByText(
          "Logging into an account allows us to track your best game. It is advised " +
            "to use Steam to login rather than email.",
          undefined,
          { timeout: 3000 },
        ),
      ).toBeInTheDocument();
    });
  });
});

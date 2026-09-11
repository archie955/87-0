import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen, waitFor } from "../test-utils";
import RegistrationForm from "@/components/RegistrationForm";
import emailService from "@/services/email";
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

const fillLoginForm = async (
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
};

describe("RegistrationForm", () => {
  it("renders the username/email/password fields and the Steam entry point", () => {
    render(<RegistrationForm />);

    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    const steamForm = screen
      .getByRole("button", {
        name: /register with steam/i,
      })
      .closest("form");
    expect(steamForm).toHaveAttribute("action", "/api/steam");
    expect(steamForm).toHaveAttribute("method", "POST");
  });

  it("registers user, notifies success, and navigates home", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.createAccount).mockResolvedValue();
    render(<RegistrationForm />);

    await fillLoginForm(user);
    await user.click(screen.getByRole("button", { name: /^register$/i }));

    await waitFor(() => {
      expect(emailService.createAccount).toHaveBeenCalledWith({
        username: "playerusername",
        email: "player@example.com",
        password: "playerexamplepassword",
      });
    });

    expect(
      await screen.findByText("Successfully registered user"),
    ).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("does not attempt to register while the required fields are empty", async () => {
    const user = userEvent.setup();
    vi.mocked(emailService.createAccount).mockResolvedValue();
    render(<RegistrationForm />);

    await user.click(screen.getByRole("button", { name: /^register$/i }));

    expect(emailService.createAccount).not.toHaveBeenCalled();
  });

  it("switches to and from the login form via the shared login store", async () => {
    const user = userEvent.setup();
    render(<Login />);

    expect(
      await screen.findByText(
        "Logging into an account allows us to track your best game.",
      ),
    ).toBeInTheDocument();
    expect(useLoginStore.getState().login).toBe(true);

    await user.click(screen.getByRole("button", { name: /register/i }));
    expect(useLoginStore.getState().login).toBe(false);
    expect(
      await screen.findByText(
        "Creating an account allows us to track your best game.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(
      await screen.findByText(
        "Logging into an account allows us to track your best game.",
      ),
    ).toBeInTheDocument();
    expect(useLoginStore.getState().login).toBe(true);
  });
});

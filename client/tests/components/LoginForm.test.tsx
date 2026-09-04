import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import LoginForm from "@/components/LoginForm";
import { mockEmailService } from "../utils";

describe("LoginForm", () => {
  it("renders email and password inputs", async () => {
    await mockEmailService.mockEmailCreate();
    await mockEmailService.mockEmailLogin();
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    await mockEmailService.mockEmailCreate();
    await mockEmailService.mockEmailLogin();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /email_login/i }));

    expect(screen.getByText("Login Failed")).toBeInTheDocument();
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { act, render, screen } from "../test-utils";
import { useNotificationStore } from "@/stores/notificationStore";

const Placeholder = () => <div data-testid="placeholder" />;

beforeEach(() => {
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
});

describe("Notification", () => {
  it("renders nothing when there is no message", () => {
    render(<Placeholder />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    const outputs = document.querySelectorAll("output");
    expect(outputs).toHaveLength(0);
  });

  it("renders the message when a notification is set", () => {
    act(() => {
      useNotificationStore
        .getState()
        .actions.setNotification("Saved successfully", "success");
    });

    render(<Placeholder />);

    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
  });

  it("dismisses the toast when the close button is clicked", async () => {
    const user = userEvent.setup();

    act(() => {
      useNotificationStore.getState().actions.setNotification("Bye", "info");
    });

    render(<Placeholder />);

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(useNotificationStore.getState().open).toBe(false);
    expect(useNotificationStore.getState().notification).toBeNull();
    expect(screen.queryByText("Bye")).not.toBeInTheDocument();
  }, 20000);

  it("renders an error toast with the destructive treatment", () => {
    act(() => {
      useNotificationStore
        .getState()
        .actions.setNotification("Login Failed", "error");
    });

    render(<Placeholder />);

    expect(screen.getByText("Login Failed")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /dismiss/i }),
    ).toBeInTheDocument();
  }, 20000);
});

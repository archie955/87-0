import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";
import { render, screen } from "../test-utils";
import GameResultDialog from "@/components/GameResultDialog";
import type { Result } from "@/types/resultTypes";

const navigateSpy = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactRouterDom>();
  return {
    ...actual,
    useNavigate: () => navigateSpy,
  };
});

beforeEach(() => {
  navigateSpy.mockReset();
});

const result: Result = { score: 4.26, cat: "cat_3", best: false };

describe("GameResultDialog", () => {
  it("shows nothing meaningful while there is no result", () => {
    render(<GameResultDialog result={null} onRestart={() => {}} />);

    expect(screen.queryByText("Lineup complete")).not.toBeInTheDocument();
    expect(screen.queryByText("New personal best!")).not.toBeInTheDocument();
  });

  it("shows the score and the category description", () => {
    render(<GameResultDialog result={result} onRestart={() => {}} />);

    expect(screen.getByText("4.26")).toBeInTheDocument();
    expect(screen.getByText("Lineup complete")).toBeInTheDocument();
    expect(screen.getByText(/winning is expected/i)).toBeInTheDocument();
  });

  it("uses the personal-best title when best is true", () => {
    render(
      <GameResultDialog
        result={{ ...result, best: true }}
        onRestart={() => {}}
      />,
    );

    expect(screen.getByText("New personal best!")).toBeInTheDocument();
  });

  it("calls onRestart when Start new game is clicked", async () => {
    const user = userEvent.setup();
    const onRestart = vi.fn();

    render(<GameResultDialog result={result} onRestart={onRestart} />);

    await user.click(screen.getByRole("button", { name: /start new game/i }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it("navigates to the dashboard when Go to Dashboard is clicked", async () => {
    const user = userEvent.setup();

    render(<GameResultDialog result={result} onRestart={() => {}} />);

    await user.click(screen.getByRole("button", { name: /go to dashboard/i }));
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("disables both action buttons while restarting", () => {
    render(
      <GameResultDialog result={result} onRestart={() => {}} isRestarting />,
    );

    expect(
      screen.getByRole("button", { name: /start new game/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /go to dashboard/i }),
    ).toBeDisabled();
  });
});

import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../test-utils";
import GameStage from "@/components/GameStage";
import { Roles } from "@/services/enum";
import type { Player } from "@/types/playerTypes";
import type { Team } from "@/types/teamTypes";

vi.mock("@/components/TeamRoll", async () => {
  const React = await import("react");
  const TeamRollMock = ({ onComplete }: { onComplete: () => void }) => {
    React.useEffect(() => {
      onComplete();
    }, [onComplete]);
    return React.createElement("div", { "data-testid": "team-roll" });
  };
  return { default: TeamRollMock };
});

const makePlayer = (
  id: number,
  name: string,
  role: Player["role"],
): Player => ({
  id,
  team_id: 1,
  name,
  role,
  hltv: 1.0,
  igl_score: 1.1,
});

const team: Team = {
  id: 1,
  name: "Falcons",
  players: [
    makePlayer(1, "Falcons-1", Roles.OPENER),
    makePlayer(2, "Falcons-2", Roles.OPENER),
  ],
};

const defaultProps = {
  team: null,
  slides: [],
  rollId: 0,
  winnerIndex: 0,
  pickNumber: 1,
  maxPickNumber: 5,
  canReroll: false,
  canPick: () => true,
  onRoll: () => {},
  onRollComplete: () => {},
  onPick: () => {},
  onReroll: () => {},
};

describe("GameStage", () => {
  it("idle: shows the Ready to roll copy and dispatches onRoll", async () => {
    const user = userEvent.setup();
    const onRoll = vi.fn();

    render(<GameStage {...defaultProps} status="idle" onRoll={onRoll} />);

    expect(screen.getByText(/ready to roll/i)).toBeInTheDocument();
    expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /roll a team/i }));
    expect(onRoll).toHaveBeenCalledOnce();
  });

  it("rolling: renders the TeamRoll (mocked) and fires onRollComplete", async () => {
    const onRollComplete = vi.fn();

    render(
      <GameStage
        {...defaultProps}
        status="rolling"
        slides={[team, team]}
        onRollComplete={onRollComplete}
      />,
    );

    expect(screen.getByText(/searching the pool/i)).toBeInTheDocument();
    expect(await screen.findByTestId("team-roll")).toBeInTheDocument();
    expect(onRollComplete).toHaveBeenCalled();
  });

  it("picking: shows the team, PlayerCards, and Reroll, and dispatches callbacks", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    const onReroll = vi.fn();

    render(
      <GameStage
        {...defaultProps}
        status="picking"
        team={team}
        canReroll
        onPick={onPick}
        onReroll={onReroll}
      />,
    );

    expect(screen.getByText("Falcons")).toBeInTheDocument();
    expect(screen.getByText("Falcons-1")).toBeInTheDocument();
    expect(screen.getByText("Falcons-2")).toBeInTheDocument();

    await user.click(screen.getByText("Falcons-1"));
    expect(onPick).toHaveBeenCalledWith(team.players[0]);

    await user.click(screen.getByRole("button", { name: /reroll/i }));
    expect(onReroll).toHaveBeenCalledOnce();
  });

  it("picking: hides the Reroll button when canReroll is false", () => {
    render(
      <GameStage
        {...defaultProps}
        status="picking"
        team={team}
        canReroll={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /reroll/i }),
    ).not.toBeInTheDocument();
  });

  it("picking: passes canPick through to the PlayerCard", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();

    render(
      <GameStage
        {...defaultProps}
        status="picking"
        team={team}
        canPick={(p) => p.name !== "Falcons-2"}
        onPick={onPick}
      />,
    );

    const disabledCard = screen.getByText("Falcons-2").closest("button");
    expect(disabledCard).toBeDisabled();

    await user.click(screen.getByText("Falcons-1"));
    expect(onPick).toHaveBeenCalledWith(team.players[0]);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "../test-utils";
import Game from "@/pages/Game";
import gameService from "@/services/game";
import teamService from "@/services/teams";
import { useNotificationStore } from "@/stores/notificationStore";
import { Roles } from "@/services/enum";
import type { Game as GameT } from "@/types/gameTypes";
import type { Teams } from "@/types/teamTypes";
import type { Player } from "@/types/playerTypes";

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

// ---- Fixtures ----------------------------------------------------------

const makePlayer = (
  id: number,
  teamId: number,
  name: string,
  role: Player["role"],
): Player => ({
  id,
  team_id: teamId,
  name,
  role,
  hltv: 1.0,
  igl_score: 1.1,
});

const makeTeam = (id: number, name: string, role: Player["role"]) => ({
  id,
  name,
  players: Array.from({ length: 5 }, (_, i) =>
    makePlayer(id * 100 + i, id, `${name}-${i + 1}`, role),
  ),
});

const teams: Teams = {
  1: makeTeam(1, "Falcons", Roles.OPENER),
  2: makeTeam(2, "Vitality", Roles.CLOSER),
  3: makeTeam(3, "Spirit", Roles.AWPER),
  4: makeTeam(4, "MOUZ", Roles.SUPPORT),
  5: makeTeam(5, "G2", Roles.OPENER),
  6: makeTeam(6, "Astralis", Roles.OPENER),
};

const game: GameT = {
  id: "game-abc",
  team_1_id: 1,
  team_2_id: 2,
  team_3_id: 3,
  team_4_id: 4,
  team_5_id: 5,
  team_6_id: 6,
};

// ---- Helpers -----------------------------------------------------------

beforeEach(() => {
  vi.mocked(gameService.getGame).mockReset();
  vi.mocked(gameService.submitGame).mockReset();
  vi.mocked(teamService.getTeams).mockReset();
  useNotificationStore.setState({
    notification: null,
    open: false,
    severity: "success",
  });
});

const renderGame = () => {
  vi.mocked(gameService.getGame).mockResolvedValue(game);
  vi.mocked(teamService.getTeams).mockResolvedValue(teams);
  return render(<Game />);
};

const rollAndPick = async (
  user: ReturnType<typeof userEvent.setup>,
  playerName: string,
) => {
  await user.click(await screen.findByRole("button", { name: /roll a team/i }));
  await user.click(await screen.findByText(playerName));
};

const draftAllFive = async (user: ReturnType<typeof userEvent.setup>) => {
  const picks = ["Falcons-1", "Vitality-1", "Spirit-1", "MOUZ-1", "G2-1"];
  for (const pick of picks) {
    await rollAndPick(user, pick);
  }
};

// ---- Tests -------------------------------------------------------------

describe("Game — load & error states", () => {
  it("shows a loading state while the game and teams are in flight", () => {
    vi.mocked(gameService.getGame).mockReturnValue(new Promise(() => {}));
    vi.mocked(teamService.getTeams).mockReturnValue(new Promise(() => {}));

    render(<Game />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows the draft lobby once the game data loads", async () => {
    renderGame();

    expect(
      await screen.findByRole("button", { name: /roll a team/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/build your/i)).toBeInTheDocument();
  });

  it("shows the error card when the game query fails", async () => {
    vi.mocked(gameService.getGame).mockRejectedValue(new Error("boom"));
    vi.mocked(teamService.getTeams).mockResolvedValue(teams);

    render(<Game />);

    expect(
      await screen.findByText(/unable to load your draft/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("shows the error card when the teams query fails", async () => {
    vi.mocked(gameService.getGame).mockResolvedValue(game);
    vi.mocked(teamService.getTeams).mockRejectedValue(new Error("boom"));

    render(<Game />);

    expect(
      await screen.findByText(/unable to load your draft/i),
    ).toBeInTheDocument();
  });
});

describe("Game — draft loop", () => {
  it("rolls a team and reveals its PlayerCards", async () => {
    const user = userEvent.setup();
    renderGame();

    await user.click(
      await screen.findByRole("button", { name: /roll a team/i }),
    );

    expect(await screen.findByText("Falcons")).toBeInTheDocument();
    expect(await screen.findByText("Falcons-1")).toBeInTheDocument();
    expect(await screen.findByText("Falcons-5")).toBeInTheDocument();
  });

  it("records a pick into the lineup and restores the Roll button", async () => {
    const user = userEvent.setup();
    renderGame();

    await rollAndPick(user, "Falcons-1");

    expect(
      await screen.findByRole("button", { name: /roll a team/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Falcons-1")).toBeInTheDocument();
  }, 20000);

  it("shows the IGL selector once five players have been drafted", async () => {
    const user = userEvent.setup();
    renderGame();

    await draftAllFive(user);

    expect(await screen.findByText(/who leads the team/i)).toBeInTheDocument();
  }, 20000);

  it("reveals the submit button only after an IGL has been chosen", async () => {
    const user = userEvent.setup();
    renderGame();

    await draftAllFive(user);

    expect(
      screen.queryByRole("button", { name: /evaluate lineup/i }),
    ).not.toBeInTheDocument();

    await user.click(await screen.findByRole("button", { name: /falcons-1/i }));

    expect(
      await screen.findByRole("button", { name: /evaluate lineup/i }),
    ).toBeInTheDocument();
  }, 20000);
});

describe("Game — submission", () => {
  const selectIgl = async (user: ReturnType<typeof userEvent.setup>) => {
    await draftAllFive(user);
    await user.click(
      await screen.findByRole("button", { name: /vitality-1/i }),
    );
  };

  it("submits the lineup and opens the result dialog on success", async () => {
    const user = userEvent.setup();
    renderGame();
    vi.mocked(gameService.submitGame).mockResolvedValue({
      score: 5.25,
      cat: "cat_2",
      best: true,
    });

    await selectIgl(user);
    await user.click(
      await screen.findByRole("button", { name: /evaluate lineup/i }),
    );

    expect(await screen.findByText(/new personal best/i)).toBeInTheDocument();
    expect(await screen.findByText("5.25")).toBeInTheDocument();

    expect(gameService.submitGame).toHaveBeenCalledOnce();

    const [lineup] = vi.mocked(gameService.submitGame).mock.calls[0];
    expect(lineup.game_id).toBe("game-abc");
    expect(lineup.player_1.name).toBe("Falcons-1");
    expect(lineup.player_2.name).toBe("Vitality-1");
    expect(lineup.igl).toBe(200); // Vitality-1's id
  }, 20000);

  it("shows an error notification when the submission fails", async () => {
    const user = userEvent.setup();
    renderGame();
    vi.mocked(gameService.submitGame).mockRejectedValue(
      new Error("Bad lineup"),
    );

    await selectIgl(user);
    await user.click(
      await screen.findByRole("button", { name: /evaluate lineup/i }),
    );

    await waitFor(() =>
      expect(useNotificationStore.getState().notification).toBe("Bad lineup"),
    );
    expect(useNotificationStore.getState().severity).toBe("error");
  }, 20000);
});

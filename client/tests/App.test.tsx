import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "./test-utils";
import App from "@/App";
import gameService from "@/services/game";
import teamService from "@/services/teams";
import { Roles } from "@/services/enum";
import type { Game } from "@/types/gameTypes";
import type { Teams } from "@/types/teamTypes";
import type { Player } from "@/types/playerTypes";

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

const game: Game = {
  id: "game-1",
  team_1_id: 1,
  team_2_id: 2,
  team_3_id: 3,
  team_4_id: 4,
  team_5_id: 5,
  team_6_id: 6,
};

const teams: Teams = Object.fromEntries(
  [1, 2, 3, 4, 5, 6].map((id) => [
    id,
    {
      id,
      name: `Team-${id}`,
      players: [makePlayer(id, id, `Team-${id}-player`, Roles.OPENER)],
    },
  ]),
);

beforeEach(() => {
  vi.mocked(gameService.getGame).mockResolvedValue(game);
  vi.mocked(teamService.getTeams).mockResolvedValue(teams);
});

describe("App routing", () => {
  it("renders Home at /", async () => {
    render(<App />, { route: "/" });

    expect(await screen.findByText(/lineup builder game/i)).toBeInTheDocument();
  });

  it("renders Rules at /about", async () => {
    render(<App />, { route: "/about" });

    expect(
      await screen.findByText(/build the best lineup you can/i),
    ).toBeInTheDocument();
  });

  it("renders the Login form at /login", async () => {
    render(<App />, { route: "/login" });

    expect(
      await screen.findByText(/logging into an account/i),
    ).toBeInTheDocument();
  });

  it("renders the draft lobby at /game", async () => {
    render(<App />, { route: "/game" });

    expect(await screen.findByText(/ready to roll/i)).toBeInTheDocument();
  });

  it("redirects /account to /login when there is no session", async () => {
    render(<App />, { route: "/account" });

    expect(
      await screen.findByText(/logging into an account/i),
    ).toBeInTheDocument();
  });

  it("renders the 404 dialog for unknown routes", async () => {
    render(<App />, { route: "/definitely-not-a-route" });

    expect(
      await screen.findByText(/404 - Page not found/i),
    ).toBeInTheDocument();
  });
});

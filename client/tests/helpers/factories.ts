import { Roles, type Role } from "../../src/services/enum";
import type { Player } from "../../src/types/playerTypes";
import type { Team } from "../../src/types/teamTypes";

export const makePlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 1,
  team_id: 1,
  name: "testPlayer",
  role: Roles.OPENER,
  hltv: 1.0,
  igl_score: 1.0,
  ...overrides,
});

export const makePlayerOfRole = (role: Role, overrides: Partial<Player> = {}) =>
  makePlayer({ role, ...overrides });

export const makeTeam = (overrides: Partial<Team> = {}): Team => ({
  id: 1,
  name: "testTeam",
  players: [],
  ...overrides,
});

import emailService from "@/services/email";
import gameService from "@/services/game";
import teamService from "@/services/teams";
import userService from "@/services/user";
import type { Game } from "@/types/gameTypes";
import type { Result } from "@/types/resultTypes";
import type { Teams } from "@/types/teamTypes";
import type { UserReturned } from "@/types/userTypes";
import { vi } from "vitest";

const mockEmailCreate = async () => {
  vi.mocked(emailService.createAccount).mockResolvedValue();
};

const mockEmailLogin = async () => {
  vi.mocked(emailService.login).mockResolvedValue();
};

export const mockEmailService = {
  mockEmailCreate,
  mockEmailLogin,
};

const mockGetGame = async (game: Game) => {
  return vi.mocked(gameService.getGame).mockResolvedValue(game);
};

const mockSubmitGame = async (result: Result) => {
  return vi.mocked(gameService.submitGame).mockResolvedValue(result);
};

export const mockGameService = {
  mockGetGame,
  mockSubmitGame,
};

const mockGetTeams = async (teams: Teams) => {
  return vi.mocked(teamService.getTeams).mockResolvedValue(teams);
};

export const mockTeamService = {
  mockGetTeams,
};

const mockDeleteUser = async () => {
  vi.mocked(userService.deleteUser).mockResolvedValue();
};

const mockUpdateUser = async (user: UserReturned) => {
  return vi.mocked(userService.updateUser).mockResolvedValue(user);
};

const mockGetUser = async (user: UserReturned) => {
  return vi.mocked(userService.getUser).mockResolvedValue(user);
};

export const mockUserService = {
  mockDeleteUser,
  mockUpdateUser,
  mockGetUser,
};

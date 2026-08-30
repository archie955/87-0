import type { Player } from "@/types/playerTypes";

export interface Game {
  id: number;
  team_1_id: number;
  team_2_id: number;
  team_3_id: number;
  team_4_id: number;
  team_5_id: number;
  team_6_id: number;
}

export interface Lineup {
  game_id: number;
  player_1: Player;
  player_2: Player;
  player_3: Player;
  player_4: Player;
  player_5: Player;
  igl: number;
}

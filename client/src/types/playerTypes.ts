import type { Role } from "@/services/enum";

export interface Player {
  id: number;
  team_id: number;
  name: string;
  role: Role;
  hltv: number;
  igl_bonus: number;
}

export interface PlayerSelection {
  id: number;
  team_id: number;
  name: string;
  role: Role;
  hltv: number;
  igl_bonus: number;
  igl: boolean;
}

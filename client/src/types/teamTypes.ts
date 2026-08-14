import { Player } from "./playerTypes";

export interface Team {
  id: number;
  name: string;
  players: Player[];
}

export interface Teams {
  [key: number]: Team;
}

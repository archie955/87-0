export const Roles = {
  OPENER: "Opener",
  CLOSER: "Closer",
  AWPER: "AWPer",
  SUPPORT: "Support",
} as const;

export const lineupRoles = {
  opener: "opener",
  closer: "closer",
  awper: "awper",
  support: "support",
  flex: "flex",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
export type LineupRole = (typeof lineupRoles)[keyof typeof lineupRoles];

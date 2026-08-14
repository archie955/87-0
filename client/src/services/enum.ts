export const Roles = {
  OPENER: "Opener",
  CLOSER: "Closer",
  AWPER: "AWPer",
  SUPPORT: "Support",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

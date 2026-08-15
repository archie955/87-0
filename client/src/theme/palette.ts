import { PaletteMode } from "@mui/material";

export const getPalette = (mode: PaletteMode) => ({
  mode,

  primary: {
    main: "#00338d",
    light: "#2f5eb7",
    dark: "#00205b",
  },

  secondary: {
    main: "#a71930",
    light: "#d1475f",
    dark: "#7b1123",
  },

  ...(mode === "light"
    ? {
        background: {
          default: "#f5f7fa",
          paper: "#ffffff",
        },

        text: {
          primary: "#111827",
          secondary: "#6b7280",
        },
      }
    : {
        background: {
          default: "#0f172a",
          paper: "#1e293b",
        },

        text: {
          primary: "#f8fafc",
          secondary: "#94a3b8",
        },
      }),
});

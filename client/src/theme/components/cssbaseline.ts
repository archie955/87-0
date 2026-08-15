import { Components, Theme } from "@mui/material/styles";

export const cssbaseline: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        transition: "background-color 0.2s ease, color 0.2s ease",
      },
    },
  },
};

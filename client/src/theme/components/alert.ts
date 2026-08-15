import { Components, Theme } from "@mui/material/styles";

export const alert: Components<Theme> = {
  MuiAlert: {
    defaultProps: {
      variant: "filled",
    },
    styleOverrides: {},
  },
};

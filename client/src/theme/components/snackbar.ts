import { Components, Theme } from "@mui/material/styles";

export const snackbar: Components<Theme> = {
  MuiSnackbar: {
    defaultProps: {
      autoHideDuration: 5000,
    },
    styleOverrides: {
      root: {
        width: "100%",
      },
    },
  },
};

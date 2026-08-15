import { Components, Theme } from "@mui/material/styles";

export const button: Components<Theme> = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      variant: "contained",
      size: "large",
      loadingPosition: "end",
      fullWidth: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: "none",
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: "none",
        paddingLeft: 24,
        paddingRight: 24,
      }),
    },
  },
};

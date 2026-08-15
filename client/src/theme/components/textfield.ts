import { Components, Theme } from "@mui/material/styles";

export const textfield: Components<Theme> = {
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
      fullWidth: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: (theme.vars || theme).palette.grey[500],
        ...theme.applyStyles("dark", {
          color: (theme.vars || theme).palette.grey[400],
        }),
      }),
    },
  },
};

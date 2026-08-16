import { Components, Theme, alpha } from "@mui/material/styles";

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
        boxSizing: "border-box",
        transition: "all 100ms ease-in",
        "&:focus-visible": {
          outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
          outlineOffset: "2px",
        },
        borderRadius: (theme.vars || theme).shape.borderRadius,
        textTransform: "none",
        variants: [
          {
            props: {
              size: "small",
            },
            style: {
              height: "2.25rem",
              padding: "8px 12px",
            },
          },
          {
            props: {
              size: "medium",
            },
            style: {
              height: "2.5rem",
            },
          },
        ],
      }),
    },
  },
};

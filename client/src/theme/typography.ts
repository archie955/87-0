import { createTheme } from "@mui/material/styles";

const defaultTheme = createTheme();

export const typography = {
  fontFamily: "IBM Plex Mono",

  h1: {
    fontSize: defaultTheme.typography.pxToRem(48),
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: defaultTheme.typography.pxToRem(36),
    fontWeight: 600,
    lineHeight: 1.2,
  },

  h3: {
    fontSize: defaultTheme.typography.pxToRem(30),
    lineHeight: 1.2,
  },

  h4: {
    fontSize: defaultTheme.typography.pxToRem(24),
    fontWeight: 600,
    lineHeight: 1.5,
  },

  h5: {
    fontSize: defaultTheme.typography.pxToRem(20),
    fontWeight: 600,
  },

  h6: {
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },

  button: {
    textTransform: "none",
    fontSize: defaultTheme.typography.pxToRem(18),
    fontWeight: 600,
  },
};

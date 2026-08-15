import { PaletteMode } from "@mui/material";
import { alpha } from "@mui/material";

export const blue = {
  50: "hsl(235, 100%, 97.5%)",
  100: "hsl(235, 100%, 90%)",
  200: "hsl(235, 100%, 84%)",
  300: "hsl(235, 100%, 77%)",
  400: "hsl(235, 100%, 70%)",
  500: "hsl(235, 100%, 60%)",
  600: "hsl(235, 100%, 50%)",
  700: "hsl(235, 100%, 40%)",
  800: "hsl(235, 100%, 28%)",
  900: "hsl(235, 100%, 15%)",
};

export const red = {
  50: "hsl(0, 82%, 97.5%)",
  100: "hsl(0, 82%, 90%)",
  200: "hsl(0, 82%, 84%)",
  300: "hsl(0, 82%, 77%)",
  400: "hsl(0, 82%, 70%)",
  500: "hsl(0, 82%, 60%)",
  600: "hsl(0, 82%, 50%)",
  700: "hsl(0, 82%, 40%)",
  800: "hsl(0, 82%, 28%)",
  900: "hsl(0, 82%, 15%)",
};

export const grey = {
  50: "hsl(220, 35%, 97%)",
  100: "hsl(220, 30%, 94%)",
  200: "hsl(220, 20%, 88%)",
  300: "hsl(220, 20%, 80%)",
  400: "hsl(220, 20%, 65%)",
  500: "hsl(220, 20%, 42%)",
  600: "hsl(220, 20%, 35%)",
  700: "hsl(220, 20%, 25%)",
  800: "hsl(220, 30%, 6%)",
  900: "hsl(220, 35%, 3%)",
};

export const getPalette = (mode: PaletteMode) => ({
  mode,

  primary: {
    light: blue[300],
    main: blue[500],
    dark: blue[800],
    contrastText: blue[50],
  },

  secondary: {
    light: red[300],
    main: red[500],
    dark: red[800],
    contrastText: red[50],
  },

  grey: {
    ...grey,
  },
  divider: mode === "dark" ? alpha(grey[700], 0.6) : alpha(grey[300], 0.4),

  background: {
    default: "hsl(0, 0%, 99%)",
    paper: "hsl(220, 35%, 97%)",
    ...(mode === "dark" && { default: grey[900], paper: "hsl(220, 30%, 7%)" }),
  },
  text: {
    primary: grey[800],
    secondary: grey[600],
    warning: red[400],
    ...(mode === "dark" && {
      primary: "hsl(0, 0%, 100%)",
      secondary: grey[400],
    }),
  },
  action: {
    hover: alpha(grey[200], 0.2),
    selected: `${alpha(grey[200], 0.3)}`,
    ...(mode === "dark" && {
      hover: alpha(grey[600], 0.2),
      selected: alpha(grey[600], 0.3),
    }),
  },
});

import { createTheme, alpha, Shadows, PaletteMode } from "@mui/material/styles";

const defaultTheme = createTheme();

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

export const orange = {
  50: "hsl(45, 100%, 97%)",
  100: "hsl(45, 92%, 90%)",
  200: "hsl(45, 94%, 80%)",
  300: "hsl(45, 90%, 65%)",
  400: "hsl(45, 90%, 40%)",
  500: "hsl(45, 90%, 35%)",
  600: "hsl(45, 91%, 25%)",
  700: "hsl(45, 94%, 20%)",
  800: "hsl(45, 95%, 16%)",
  900: "hsl(45, 93%, 12%)",
};

export const green = {
  50: "hsl(120, 80%, 98%)",
  100: "hsl(120, 75%, 94%)",
  200: "hsl(120, 75%, 87%)",
  300: "hsl(120, 61%, 77%)",
  400: "hsl(120, 44%, 53%)",
  500: "hsl(120, 59%, 30%)",
  600: "hsl(120, 70%, 25%)",
  700: "hsl(120, 75%, 16%)",
  800: "hsl(120, 84%, 10%)",
  900: "hsl(120, 87%, 6%)",
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

export const shape = {
  borderRadius: 8,
};

// @ts-expect-error defaultTheme.shadows.slice(2) is 23 elements
const defaultShadows: Shadows = [
  "none",
  "var(--template-palette-baseShadow)",
  ...defaultTheme.shadows.slice(2),
];
export const shadows = defaultShadows;

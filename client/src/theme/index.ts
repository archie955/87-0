import { createTheme, PaletteMode } from "@mui/material/styles";
import { components } from "./components/index";
import { getPalette, typography, shape, shadows } from "./themePrimitives";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    cssVariables: {
      colorSchemeSelector: "data-mui-color-scheme",
      cssVarPrefix: "template",
    },
    palette: getPalette(mode),
    typography,
    shape,
    components,
    shadows,
  });

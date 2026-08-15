import { createTheme, PaletteMode } from "@mui/material/styles";
import { components } from "./components/index";
import { getPalette } from "./palette";
import { typography } from "./typography";
import { shape } from "./shape";

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: getPalette(mode),
    typography,
    shape,
    components,
  });

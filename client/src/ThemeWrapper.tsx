import { ThemeProvider, CssBaseline } from "@mui/material";
import { MantineProvider, createTheme } from "@mantine/core";
import { useThemeMode } from "./stores/themeStore";
import { getTheme } from "./theme/index";
import { useMemo } from "react";
import App from "./App";

const ThemeWrapper = () => {
  const mode = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);
  const mtheme = createTheme({});

  return (
    <MantineProvider theme={mtheme}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </MantineProvider>
  );
};

export default ThemeWrapper;

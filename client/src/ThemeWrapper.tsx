import { ThemeProvider, CssBaseline } from "@mui/material";
import { useThemeMode } from "./stores/themeStore";
import { getTheme } from "./theme/index";
import { useMemo } from "react";
import App from "./App";

const ThemeWrapper = () => {
  const mode = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

export default ThemeWrapper;

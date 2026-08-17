import { ThemeProvider, CssBaseline } from "@mui/material";
import { useThemeMode } from "./stores/themeStore";
import { getTheme } from "./theme/index";
import { useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App";

const ThemeWrapper = () => {
  const mode = useThemeMode();
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default ThemeWrapper;

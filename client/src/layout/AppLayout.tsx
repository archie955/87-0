import { Box } from "@mui/material";
import ColourModeDropdown from "../theme/ColourModeDropdown";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ColourModeDropdown />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;

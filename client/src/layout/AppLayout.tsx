import { Box } from "@mui/material";
import ColourModeDropdown from "../theme/ColourModeDropdown";
import { ReactNode } from "react";
import { ApplicationShell1 } from "@/components/application-shell1";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <ApplicationShell1 />

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

import { AppShell } from "@/components/AppShell";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

export default AppLayout;

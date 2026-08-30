import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return <AppShell>{children}</AppShell>;
};

export default AppLayout;

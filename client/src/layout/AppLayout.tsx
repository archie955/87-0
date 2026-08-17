import { ReactNode } from "react";
import { ApplicationShell1 } from "@/components/application-shell1";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return <ApplicationShell1>{children}</ApplicationShell1>;
};

export default AppLayout;

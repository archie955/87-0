import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useToken } from "@/stores/userStore";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const token = useToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;

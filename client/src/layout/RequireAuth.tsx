import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthenticated } from "@/stores/authenticatedStore";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const authenticated = useAuthenticated();
  const location = useLocation();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;

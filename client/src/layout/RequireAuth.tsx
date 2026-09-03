import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useUser from "@/hooks/useUser";
import Loading from "@/components/Loading";

interface Props {
  children: ReactNode;
}

const RequireAuth = ({ children }: Props) => {
  const { user, isPending, isError } = useUser();
  const location = useLocation();

  if (isPending) {
    return <Loading />;
  }

  if (isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;

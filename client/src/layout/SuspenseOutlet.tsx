import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loading from "@/components/Loading";

const SuspenseOutlet = () => {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default SuspenseOutlet;

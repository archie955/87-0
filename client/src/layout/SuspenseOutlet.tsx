import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Loading from "@/components/Loading";

const SuspenseOutlet = () => {
    return (
        <Suspense fallback={<Loading />}>
            <Outlet />
        </Suspense>
    )
}

export default SuspenseOutlet;
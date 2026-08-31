import { useEffect } from "react";
import { useUserActions } from "@/stores/userStore";
import ErrorBoundary from "@/ErrorBoundary";
import RequireAuth from "@/layout/RequireAuth";
import "@/index.css";
import Notification from "@/components/Notification";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import { lazy, Suspense } from "react";
import SuspenseOutlet from "@/layout/SuspenseOutlet";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  const Login = lazy(() => import("@/pages/Login"))
  const Home = lazy(() => import("@/pages/Home"))
  const Rules = lazy(() => import("@/pages/Rules"))
  const Account = lazy(() => import("@/pages/Account"))
  const Game = lazy(() => import("@/pages/Game"))

  return (
    <div>
      <ErrorBoundary>
        <Notification />
      </ErrorBoundary>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppLayout />}>
            <Route element={<SuspenseOutlet />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<Rules />} />
              <Route path="/login" element={<Login />} />
              <Route path="/game" element={<Game />} />
              <Route
                path="/account"
                element={
                  <RequireAuth>
                    <Account />
                  </RequireAuth>
                }
              />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;

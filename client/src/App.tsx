import { useEffect } from "react";
import { useUserActions } from "@/stores/userStore";
import ErrorBoundary from "@/ErrorBoundary";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Rules from "@/pages/Rules";
import Account from "@/pages/Account";
import RequireAuth from "@/layout/RequireAuth";
import "@/index.css";
import Notification from "@/components/Notification";
import { Route, Routes } from "react-router-dom";
import Game from "./pages/Game";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <ErrorBoundary>
        <Notification />
      </ErrorBoundary>
      <ErrorBoundary>
        <Routes>
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
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;

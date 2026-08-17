import { useEffect } from "react";
import { useUserActions } from "./stores/userStore";
import ErrorBoundary from "./ErrorBoundary";
import Login from "./pages/Login";
import Home from "./pages/Home";
import "@/index.css";
import Notification from "@/components/Notification";
import { Route, Routes } from "react-router-dom";

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
          <Route path="/" element={<Login />} />
          <Route path="/about" element={<Home />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;

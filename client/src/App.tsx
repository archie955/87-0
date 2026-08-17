import { useEffect } from "react";
import { useUserActions } from "./stores/userStore";
import ErrorBoundary from "./ErrorBoundary";
import Login from "./pages/Login";
import "@/index.css";
import Notification from "@/components/Notification";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <ErrorBoundary>
        <Notification />
        <Login />
      </ErrorBoundary>
    </div>
  );
};

export default App;

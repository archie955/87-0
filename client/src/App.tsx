import { useEffect } from "react";
import { useUserActions } from "./stores/userStore";
import ErrorBoundary from "./ErrorBoundary";
import Login from "./pages/Login";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <ErrorBoundary>
        <h1>Test</h1>
        <Login />
      </ErrorBoundary>
    </div>
  );
};

export default App;

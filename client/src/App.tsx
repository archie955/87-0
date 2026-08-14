import { useEffect } from "react";
import { useUserActions } from "./stores/userStore";
import ErrorBoundary from "./ErrorBoundary";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <ErrorBoundary>
        <h1>Test</h1>
      </ErrorBoundary>
    </div>
  );
};

export default App;

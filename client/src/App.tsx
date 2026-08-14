import { useEffect } from "react";
import { useUserActions } from "./stores/userStore";

const App = () => {
  const { init } = useUserActions();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div>
      <h1>Test</h1>
    </div>
  );
};

export default App;

import { TooltipProvider } from "@/components/ui/tooltip";
import App from "@/App";

const ToolTipWrapper = () => {
  return (
    <TooltipProvider>
      <App />
    </TooltipProvider>
  );
};

export default ToolTipWrapper;

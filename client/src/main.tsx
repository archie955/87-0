import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ToolTipWrapper from "@/ToolTipWrapper";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ToolTipWrapper />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);

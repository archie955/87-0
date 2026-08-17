import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ThemeWrapper from "@/ThemeWrapper";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeWrapper />
    </BrowserRouter>
  </StrictMode>,
);

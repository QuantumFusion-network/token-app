// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { WalletProvider } from "./contexts/WalletContext";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </WalletProvider>
  </StrictMode>
);

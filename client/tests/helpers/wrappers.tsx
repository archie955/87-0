import type { ReactNode } from "react";
import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createTestQueryClient } from "../test-utils";

export const createQueryWrapper = (
  queryClient: QueryClient = createTestQueryClient(),
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, Wrapper };
};

export const createRouterQueryWrapper = (
  route = "/",
  queryClient: QueryClient = createTestQueryClient(),
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );

  return { queryClient, Wrapper };
};

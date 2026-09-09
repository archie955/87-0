import type { ReactElement, ReactNode } from "react";
import {
  render as rtlRender,
  type RenderOptions,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Notification from "@/components/Notification";

export * from "@testing-library/react";

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  queryClient?: QueryClient;
}

export const render = (
  ui: ReactElement,
  {
    route = "/",
    queryClient = createTestQueryClient(),
    ...options
  }: RenderWithProvidersOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {children}
        <Notification />
      </MemoryRouter>
    </QueryClientProvider>
  );

  return {
    queryClient,
    ...rtlRender(ui, { wrapper: Wrapper, ...options }),
  };
};

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../helpers/useAuth";
import { ThemeModeProvider } from "../helpers/themeMode";
import { I18nProvider } from "../helpers/i18n";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeModeProvider>
          <I18nProvider>
            <ScrollToHashElement />
            <TooltipProvider>
              {children}
              <SonnerToaster />
            </TooltipProvider>
          </I18nProvider>
        </ThemeModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
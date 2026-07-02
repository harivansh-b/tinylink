import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { apolloClient, setClerkTokenGetter } from "@/api/apollo";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/hooks/useToast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AppRoutes } from "@/routes";

function ClerkApolloSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setClerkTokenGetter(() => getToken());
  }, [getToken]);
  return null;
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <ClerkApolloSync />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}

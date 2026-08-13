import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { apolloClient, setClerkTokenGetter, setClerkUserInfo } from "@/api/apollo";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/hooks/useToast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PremiumCursor } from "@/components/ui/Cursor";
import { AppRoutes } from "@/routes";

/**
 * Registers the Clerk token getter and user info DURING RENDER (not inside useEffect)
 * so it is always available before any Apollo query fires.
 */
function ClerkApolloSync() {
  const { getToken } = useAuth();
  const { user } = useUser();

  // Set tokens/user headers synchronously on every render — no useEffect, no race.
  setClerkTokenGetter(() => getToken());

  if (user) {
    const email = user.primaryEmailAddress?.emailAddress || null;
    const displayName = user.fullName || null;
    setClerkUserInfo(email, displayName);
  } else {
    setClerkUserInfo(null, null);
  }
  return null;
}

function BackendWakeup() {
  useEffect(() => {
    const url = import.meta.env.VITE_API_URL;
    if (url) {
      fetch(`${url}/health`).catch(() => {/* silently ignore – just a wake-up ping */ });
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <BackendWakeup />
            <PremiumCursor />
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

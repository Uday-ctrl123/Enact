import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import { SkipLink } from "./components/ui/skip-link";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Results = lazy(() => import("./pages/Results"));
const Chat = lazy(() => import("./pages/Chat"));
const Auth = lazy(() => import("./pages/Auth"));
const CaseTracking = lazy(() => import("./pages/CaseTracking"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Retry on network errors and 5xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          // Don't retry on 4xx errors
          if (status >= 400 && status < 500) return false;
          // Retry on 5xx errors
          if (status >= 500) return failureCount < 2;
        }
        // Retry on network errors
        return failureCount < 2;
      },
    },
  },
});

const LoadingFallback = () => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AsyncErrorFallback = () => (
  <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
    <p className="text-lg text-destructive">Failed to load page</p>
    <button
      onClick={() => window.location.reload()}
      className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
    >
      Reload Page
    </button>
  </div>
);

const App = () => {
  const { i18n } = useTranslation();

  // Update document language attribute when language changes
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AccessibilityProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <div className="flex min-h-screen flex-col">
                  <SkipLink href="#main-content">Skip to main content</SkipLink>
                  <SkipLink href="#navigation">Skip to navigation</SkipLink>
                  <Header />
                  <main id="main-content" className="flex-1" role="main">
                    <ErrorBoundary fallback={<AsyncErrorFallback />}>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/results" element={<Results />} />
                          <Route path="/chat" element={<Chat />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/case-tracking" element={<CaseTracking />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </main>
                  <Footer />
                </div>
              </AuthProvider>
            </BrowserRouter>
          </AccessibilityProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;

import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ConfigProvider, Spin } from "antd";
import AppContent from "./components/AppContent";
import "./App.css";

// CREATE A CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache persists for 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spin size="large" />
    </div>
  );
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-lg font-semibold text-red-500 mb-4">
        Something went wrong:
      </h2>
      <pre className="text-sm text-gray-600 mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}

// Wrapper component to use theme context
function ThemeConfigWrapper({ children }) {
  const { themeConfig } = useTheme();
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <ThemeConfigWrapper>
              <Router>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </Router>
            </ThemeConfigWrapper>
          </Suspense>
        </ErrorBoundary>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ConfigProvider } from "antd";
import AppContent from "./components/AppContent";
import "./App.css";

// Wrapper component to use theme context
function ThemeConfigWrapper({ children }) {
  const { themeConfig } = useTheme();
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
}

function App() {
  return (
    <ThemeProvider>
      <ThemeConfigWrapper>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ThemeConfigWrapper>
    </ThemeProvider>
  );
}

export default App;

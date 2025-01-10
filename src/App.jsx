import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MobileNavigation from "./components/MobileNavigation";
import DesktopSidebar from "./components/DesktopSidebar";
import DesktopHeader from "./components/DesktopHeader";
import DesktopFooter from "./components/DesktopFooter";
import TodoList from "./components/TodoList";
import Statistics from "./components/Statistics";
import CompletedTasks from "./components/CompletedTasks";
import TaskGroups from "./components/TaskGroups";
import Settings from "./components/Settings";
import Profile from "./components/Profile";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Handle PWA actions
      const params = new URLSearchParams(location.search);
      if (params.has("action") && params.get("action") === "new") {
        // Open new task modal
        document.dispatchEvent(new CustomEvent("open-new-task"));
      }
    }
  }, [location, user]);

  // If user is not authenticated, show auth pages
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout className="min-h-[100dvh] bg-gray-50">
      <Layout hasSider className="hidden md:flex">
        <DesktopSidebar />
        <Layout>
          <DesktopHeader />
          <Layout.Content className="p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<TodoList />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/groups" element={<TaskGroups />} />
              <Route path="/groups" element={<TaskGroups />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout.Content>
          <DesktopFooter />
        </Layout>
      </Layout>
      <Layout className="md:hidden">
        <Layout.Content className="p-4 pb-20">
          <Routes>
            <Route path="/" element={<TodoList />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/groups" element={<TaskGroups />} />
            <Route path="/completed" element={<CompletedTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout.Content>
        <MobileNavigation />
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
export default App;

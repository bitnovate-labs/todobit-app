import { useEffect } from "react";
import { Layout } from "antd";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TodoList from "./TodoList";
import CompletedTasks from "./CompletedTasks";
import Statistics from "./Statistics";
import Settings from "./Settings";
import Welcome from "../pages/Welcome";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DesktopSidebar from "./DesktopSidebar";
import DesktopHeader from "./DesktopHeader";
import DesktopFooter from "./DesktopFooter";
import TaskGroups from "./TaskGroups";
import Profile from "./Profile";
import MobileNavigation from "./MobileNavigation";
import { useTheme } from "../context/ThemeContext";
import ResetPassword from "../pages/ResetPassword";

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode } = useTheme(); // Access theme context

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
      <Layout style={{ minHeight: "100vh" }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
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
              <Route path="/completed" element={<CompletedTasks />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout.Content>
          <DesktopFooter />
        </Layout>
      </Layout>
      {/* MOBILE LAYOUT */}
      <Layout className="md:hidden mb-12">
        <Layout.Content className="p-4 pb-20">
          <Routes>
            <Route path="/" element={<TodoList />} />
            <Route path="/stats" element={<Statistics />} />
            <Route path="/groups" element={<TaskGroups />} />
            <Route path="/completed" element={<CompletedTasks />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout.Content>
        <MobileNavigation />
      </Layout>
    </Layout>
  );
}

export default AppContent;

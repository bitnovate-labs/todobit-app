import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Layout } from "antd";
import MobileNavigation from "./components/MobileNavigation";
import DesktopSidebar from "./components/DesktopSidebar";
import DesktopHeader from "./components/DesktopHeader";
import DesktopFooter from "./components/DesktopFooter";
import TodoList from "./components/TodoList";
import Statistics from "./components/Statistics";
import CompletedTasks from "./components/CompletedTasks";
import TaskGroups from "./components/TaskGroups";
import Settings from "./components/Settings";
import "./App.css";
import { useEffect } from "react";

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // Handle PWA actions
    const params = new URLSearchParams(location.search);
    if (params.has("action") && params.get("action") === "new") {
      // Open new task modal
      document.dispatchEvent(new CustomEvent("open-new-task"));
    }
  }, [location]);

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
      <AppContent />
    </Router>
  );
}
export default App;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import MobileNavigation from "./components/MobileNavigation";
import DesktopSidebar from "./components/DesktopSidebar";
import DesktopHeader from "./components/DesktopHeader";
import DesktopFooter from "./components/DesktopFooter";
import TodoList from "./components/TodoList";
import Statistics from "./components/Statistics";
import Settings from "./components/Settings";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout className="min-h-[100dvh] bg-gray-50">
        <Layout hasSider className="hidden md:flex">
          <DesktopSidebar />
          <Layout>
            <DesktopHeader />
            <Layout.Content className="p-6 overflow-auto">
              <Routes>
                <Route path="/" element={<TodoList />} />
                <Route path="/stats" element={<Statistics />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout.Content>
            <DesktopFooter />
          </Layout>
        </Layout>
        <Layout className="md:hidden">
          <Layout.Content className="pb-20">
            <Routes>
              <Route path="/" element={<TodoList />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout.Content>
          <MobileNavigation />
        </Layout>
      </Layout>
    </Router>
  );
}
export default App;

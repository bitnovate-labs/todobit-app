import { Layout } from "antd";

function DesktopFooter() {
  return (
    <Layout.Footer className="text-center text-gray-500 bg-white border-t border-gray-200">
      TodoTracker ©{new Date().getFullYear()} Created with Ant Design
    </Layout.Footer>
  );
}

export default DesktopFooter;

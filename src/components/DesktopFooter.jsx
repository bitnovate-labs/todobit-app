import { Layout } from "antd";

function DesktopFooter() {
  return (
    <Layout.Footer className="text-center text-gray-500 bg-white border-t border-gray-200">
      Dobit ©{new Date().getFullYear()} Created by Bitnovate Labs
    </Layout.Footer>
  );
}

export default DesktopFooter;

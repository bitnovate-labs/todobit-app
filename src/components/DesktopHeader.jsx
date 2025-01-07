import { Layout, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

function DesktopHeader() {
  return (
    <Layout.Header className="bg-white border-b border-gray-200 px-6 flex items-center">
      <Input
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Search tasks..."
        className="max-w-md"
      />
    </Layout.Header>
  );
}

export default DesktopHeader;

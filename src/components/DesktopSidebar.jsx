import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  BarChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

function DesktopSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Tasks",
    },
    {
      key: "/stats",
      icon: <BarChartOutlined />,
      label: "Statistics",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  return (
    <Layout.Sider
      theme="light"
      width={240}
      className="border-r border-gray-200 overflow-auto"
    >
      <div className="p-4">
        <h1 className="text-xl font-bold">TodoTracker</h1>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => navigate(key)}
      />
    </Layout.Sider>
  );
}

export default DesktopSidebar;

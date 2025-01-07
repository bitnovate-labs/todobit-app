import { Button, Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

function MobileHeader({ title }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "groups",
      label: "Task Groups",
      onClick: () => navigate("/groups"),
    },
    {
      key: "completed",
      label: "Completed Tasks",
      onClick: () => navigate("/completed"),
    },
    {
      key: "settings",
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div className="h-14 flex items-center justify-between px-4 md:hidden">
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomLeft"
        trigger={["click"]}
      >
        <Button
          icon={<MenuOutlined />}
          type="text"
          className="hover:bg-gray-100"
        />
      </Dropdown>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="w-8" /> {/* Spacer for alignment */}
    </div>
  );
}

export default MobileHeader;

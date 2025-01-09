import { Button, Dropdown } from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

function MobileHeader({ title }) {
  const navigate = useNavigate();

  const menuItems = [
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
    <div className="h-14 flex items-center justify-between px-8 pt-10 pb-8 md:hidden fixed top-0 left-0 right-0 bg-white z-20 border-b border-gray-200">
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomLeft"
        trigger={["click"]}
      >
        <Button
          icon={<FontAwesomeIcon icon={faBars} style={{ fontSize: "20px" }} />}
          type="text"
          className="hover:bg-gray-100"
          style={{
            paddingRight: "24px",
          }}
        />
      </Dropdown>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="w-8" /> {/* Spacer for alignment */}
    </div>
  );
}

export default MobileHeader;

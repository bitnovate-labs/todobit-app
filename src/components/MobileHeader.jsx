import { Button, Dropdown, Modal } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faChevronLeft,
  faCircleCheck,
  faEllipsisVertical,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";

function MobileHeader({ title, onDeleteAll }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsPage = location.pathname === "/settings";
  const { user } = useAuth();
  const { isDarkMode } = useTheme(); // Access theme context

  // LEFT MENU ITEMS (HAMBURGER ICON)
  const menuItems = [
    {
      key: "completed",
      label: "Completed Tasks",
      icon: (
        <FontAwesomeIcon
          icon={faCircleCheck}
          style={{ fontSize: "18px" }}
          className="text-green-500"
        />
      ),
      onClick: () => navigate("/completed"),
    },
  ];

  // RIGHT MENU ITEMS (ELLIPSIS ICON - FOR COMPLETED TASK)
  const deleteMenu = [
    {
      key: "delete-all",
      icon: <FontAwesomeIcon icon={faTrashCan} />,
      label: "Delete All",
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: "Delete All Completed Tasks",
          content:
            "Are you sure you want to delete all completed tasks? This action cannot be undone.",
          okText: "Delete",
          okType: "danger",
          cancelText: "Cancel",
          onOk: handleDeleteAll,
        });
      },
    },
  ];

  // HANDLE DELETE ALL
  const handleDeleteAll = async () => {
    try {
      await supabase
        .from("todos")
        .update({ is_visible: false }) // Instead of deleting, just hide them
        .eq("is_completed", true)
        .eq("user_id", user.id);

      // Call the callback to update the UI
      if (onDeleteAll) {
        onDeleteAll();
      }
    } catch (error) {
      console.error("Error deleting all tasks:", error);
    }
  };

  return (
    <div
      className={`h-14 flex items-center justify-between px-4 md:hidden fixed top-0 left-0 right-0 z-20 ${
        isDarkMode
          ? "bg-gray border-none"
          : "bg-white border-b border-gray-300 shadow-md"
      }`}
    >
      {/* LEFT HAMBURGER MENU */}
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomLeft"
        trigger={["click"]}
      >
        {isSettingsPage ? (
          <Button
            type="text"
            icon={
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ fontSize: "20px" }}
              />
            }
            onClick={() => navigate(-1)}
            className="text-gray-600"
          />
        ) : (
          <Button
            type="text"
            icon={
              <FontAwesomeIcon icon={faBars} style={{ fontSize: "20px" }} />
            }
            className="text-gray-600"
          />
        )}
      </Dropdown>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="w-8" /> {/* Spacer for alignment */}
      {/* RIGHT ELLIPSIS MENU (FOR COMPLETED TASKS) */}
      <div className="fixed right-0 z-10 bg-transparent md:hidden">
        <div className="flex items-center px-2 h-14">
          {title === "Completed Tasks" && (
            <Dropdown
              menu={{ items: deleteMenu }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={
                  <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    style={{ fontSize: "20px" }}
                  />
                }
                className="bg-none text-gray-500"
              />
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileHeader;

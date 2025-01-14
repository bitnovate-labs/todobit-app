import { Button, Dropdown, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCircleCheck,
  faEllipsisVertical,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function MobileHeader({ title, onDeleteAll }) {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    <div className="h-14 flex items-center justify-between px-8 pt-10 pb-8 md:hidden fixed top-0 left-0 right-0 bg-white z-20 border-b border-gray-200">
      {/* LEFT HAMBURGER MENU */}
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
      {/* RIGHT ELLIPSIS MENU (FOR COMPLETED TASKS) */}
      <div className="fixed top-2 right-0 z-10 bg-white md:hidden">
        <div className="flex items-center px-2 h-16">
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
                className="bg-transparent text-gray-500"
              />
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileHeader;

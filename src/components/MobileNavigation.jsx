import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Input, AutoComplete, Button, Divider, Typography } from "antd";
import {
  PlusOutlined,
  HomeOutlined,
  BarChartOutlined,
  FolderOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { todoApi, supabase } from "../lib/supabase";

const { Text } = Typography;

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("");
  const [defaultCategories] = useState([
    { value: "work", label: "#work", description: "Work-related tasks" },
    {
      value: "personal",
      label: "#personal",
      description: "Personal tasks and errands",
    },
    {
      value: "health",
      label: "#health",
      description: "Health and wellness activities",
    },
  ]);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);

  useEffect(() => {
    const handleOpenNewTask = () => setIsModalVisible(true);
    document.addEventListener("open-new-task", handleOpenNewTask);
    return () =>
      document.removeEventListener("open-new-task", handleOpenNewTask);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase
          .from("todos")
          .select("hashtag")
          .not("hashtag", "is", null)
          .order("created_at", { ascending: false });

        const uniqueHashtags = [...new Set(data.map((todo) => todo.hashtag))];
        const recentCategories = uniqueHashtags.map((tag) => ({
          value: tag,
          label: `#${tag}`,
          description: "Recently used category",
        }));

        setCategoryOptions([
          ...defaultCategories,
          ...recentCategories.filter(
            (cat) => !defaultCategories.some((def) => def.value === cat.value)
          ),
        ]);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [isModalVisible]);

  // HANDLE ADD TASK
  const handleAddTask = async () => {
    try {
      const hashtag = category.startsWith("#") ? category.slice(1) : category;
      await todoApi.create(newTask, hashtag);

      // Reset form
      setNewTask("");
      setCategory("");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-28 md:hidden z-50 px-4">
        <div className="relative max-w-md mx-auto h-full">
          <div className="absolute inset-x-0 h-full grid grid-cols-5 items-center">
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/" ? "text-blue-500" : "text-gray-500"
                } focus:outline-none`}
                icon={<HomeOutlined style={{ fontSize: "24px" }} />}
                onClick={() => navigate("/")}
              />
              <span
                className={`text-xs mt-1 ${
                  location.pathname === "/" ? "text-blue-500" : "text-gray-500"
                }`}
              >
                Home
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/groups"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={<FolderOutlined style={{ fontSize: "24px" }} />}
                onClick={() => navigate("/groups")}
              />
              <span
                className={`text-xs mt-1 ${
                  location.pathname === "/groups"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                Groups
              </span>
            </div>
            {/* ADD TASK BUTTON */}
            <div className="flex justify-center items-center">
              <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined style={{ fontSize: "24px" }} />}
                onClick={() => setIsModalVisible(true)}
                size="large"
                className="flex items-center justify-center focus:outline-none shadow-lg"
                style={{
                  padding: "30px",
                }}
              />
            </div>
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/stats"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={<BarChartOutlined style={{ fontSize: "24px" }} />}
                onClick={() => navigate("/stats")}
              />
              <span
                className={`text-xs mt-1 ${
                  location.pathname === "/stats"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                Stats
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/settings"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={<SettingOutlined style={{ fontSize: "24px" }} />}
                onClick={() => navigate("/settings")}
              />
              <span
                className={`text-xs mt-1 ${
                  location.pathname === "/settings"
                    ? "text-blue-500"
                    : "text-gray-500"
                }`}
              >
                Settings
              </span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Add New Task"
        open={isModalVisible}
        className="max-w-sm mx-auto"
        onOk={handleAddTask}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Enter task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-4">
          <AutoComplete
            className="w-full"
            placeholder="Enter or select category"
            options={categoryOptions}
            value={category}
            onChange={(value) => setCategory(value)}
            allowClear
          />
          <Divider className="my-4">Available Categories</Divider>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {categoryOptions.map((cat) => (
              <div key={cat.value} className="flex items-start">
                <Text
                  className="text-blue-500 cursor-pointer"
                  onClick={() => setCategory(cat.value)}
                >
                  #{cat.value}
                </Text>
                <Text type="secondary" className="ml-2 text-sm">
                  - {cat.description}
                </Text>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default MobileNavigation;

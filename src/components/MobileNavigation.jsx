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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-24 flex items-center justify-around px-4 md:hidden shadow-xl">
        {/* HOME BUTTON */}
        <div className="flex-1 flex justify-center">
          <Button
            type="ghost"
            className={`flex items-center justify-center ${
              location.pathname === "/"
                ? "text-blue-500 border-none"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<HomeOutlined style={{ fontSize: "26px" }} />}
            onClick={() => navigate("/")}
            style={{
              paddingLeft: "16px",
            }}
          />
        </div>
        <div className="flex-1" /> {/* Spacer */}
        {/* TASK GROUP BUTTON */}
        <div className="flex-1 flex justify-center m-0">
          <Button
            type="ghost"
            className={`flex items-center justify-center ${
              location.pathname === "/groups"
                ? "text-blue-500 border-none"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<FolderOutlined style={{ fontSize: "30px" }} />}
            onClick={() => navigate("/groups")}
            style={{
              padding: "0 20px",
            }}
          />
        </div>
        <div className="flex-1" /> {/* Spacer */}
        {/* ADD TASK BUTTON */}
        <div className="flex-1 flex justify-center m-0">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{
              fontSize: "18px",
              padding: "24px 24px",
            }}
            className="flex items-center justify-center"
          />
        </div>
        <div className="flex-1" /> {/* Spacer */}
        {/* STATISTICS BUTTON */}
        <div className="flex-1 flex justify-center">
          <Button
            type="ghost"
            className={`flex items-center justify-center ${
              location.pathname === "/stats"
                ? "text-blue-500 border-none"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<BarChartOutlined style={{ fontSize: "30px" }} />}
            onClick={() => navigate("/stats")}
            style={{
              padding: "0 20px",
            }}
          />
        </div>
        <div className="flex-1" /> {/* Spacer */}
        {/* SETTINGS BUTTON */}
        <div className="flex-1 flex justify-center">
          <Button
            type="ghost"
            className={`flex items-center justify-center ${
              location.pathname === "/settings"
                ? "text-blue-500 border-none"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<SettingOutlined style={{ fontSize: "30px" }} />}
            onClick={() => navigate("/settings")}
            style={{
              paddingRight: "16px",
            }}
          />
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

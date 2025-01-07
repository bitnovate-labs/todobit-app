import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Input, AutoComplete, Button, Divider, Typography } from "antd";
import {
  PlusOutlined,
  HomeOutlined,
  BarChartOutlined,
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
    setIsModalVisible(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 flex items-center justify-around px-4 md:hidden">
        <div className="flex-1" /> {/* Spacer */}
        {/* HOME BUTTON */}
        <div className="flex-1 flex justify-center">
          <Button
            type="ghost"
            className={`flex items-center justify-center ${
              location.pathname === "/"
                ? "text-blue-500 border-blue-500"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            style={{
              fontSize: "18px",
              padding: "22px 22px",
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
              padding: "22px 22px",
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
                ? "text-blue-500 border-blue-500"
                : "text-gray-500"
            } focus:outline-none`}
            icon={<BarChartOutlined />}
            onClick={() => navigate("/stats")}
            style={{
              fontSize: "18px",
              padding: "22px 22px",
            }}
          />
        </div>
        <div className="flex-1" /> {/* Spacer */}
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

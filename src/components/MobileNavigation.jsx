import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Modal,
  Input,
  AutoComplete,
  Button,
  Divider,
  Typography,
  Switch,
} from "antd";
import { todoApi, supabase } from "../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faHome,
  faChartBar,
  faGear,
  faStar,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

const { Text } = Typography;

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("");
  const [isPriority, setIsPriority] = useState(false);
  const [tasks, setTasks] = useState([]);
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
      // Fetch tasks to check priority count
      const { data: tasksData } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      setTasks(tasksData || []);

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
      // Check priority task limit
      if (isPriority) {
        const priorityTaskCount = tasks.filter(
          (task) => !task.is_completed && task.is_priority
        ).length;

        if (priorityTaskCount >= 3) {
          Modal.warning({
            title: "Priority Task Limit Reached",
            content:
              "You can only have 3 priority tasks at a time. Please complete or delete an existing priority task first.",
            okText: "Got it",
            style: { top: "35%" },
          });
          return;
        }
      }

      const hashtag = category.startsWith("#") ? category.slice(1) : category;
      await todoApi.create(newTask, hashtag, isPriority);

      // Reset form
      setNewTask("");
      setCategory("");
      setIsPriority(false);
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
              {/* HOME BUTTON */}
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/" ? "text-blue-500" : "text-gray-500"
                } focus:outline-none`}
                icon={
                  <FontAwesomeIcon icon={faHome} style={{ fontSize: "26px" }} />
                }
                onClick={() => navigate("/")}
              />
            </div>
            {/* TASK GROUP BUTTON */}
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/groups"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    style={{ fontSize: "26px" }}
                  />
                }
                onClick={() => navigate("/groups")}
              />
            </div>
            {/* ADD TASK BUTTON */}
            <div className="flex justify-center items-center">
              <Button
                type="primary"
                shape="circle"
                icon={
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: "24px" }} />
                }
                onClick={() => setIsModalVisible(true)}
                size="large"
                className="flex items-center justify-center focus:outline-none shadow-lg"
                style={{
                  padding: "30px",
                }}
              />
            </div>
            {/* STATS BUTTON */}
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/stats"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={
                  <FontAwesomeIcon
                    icon={faChartBar}
                    style={{ fontSize: "26px" }}
                  />
                }
                onClick={() => navigate("/stats")}
              />
            </div>
            {/* SETTINGS BUTTON */}
            <div className="flex flex-col items-center">
              <Button
                className={`flex items-center justify-center border-none ${
                  location.pathname === "/settings"
                    ? "text-blue-500"
                    : "text-gray-500"
                } focus:outline-none`}
                icon={
                  <FontAwesomeIcon icon={faGear} style={{ fontSize: "26px" }} />
                }
                onClick={() => navigate("/settings")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              <Text>Priority Task</Text>
            </div>
            <Switch
              checked={isPriority}
              onChange={setIsPriority}
              className={isPriority ? "bg-yellow-500" : ""}
            />
          </div>
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

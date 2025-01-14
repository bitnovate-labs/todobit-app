import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Checkbox,
  Typography,
  Row,
  Col,
  Button,
  Modal,
  Input,
  Dropdown,
  // Carousel,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrashCan,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";
import MobileHeader from "./MobileHeader";
import { motion, AnimatePresence } from "motion/react";
import { todoApi, subscribeToTodos } from "../lib/supabase";
import EmptyState from "./EmptyTodo";
import forest_image from "../assets/tree.jpg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedHashtag, setEditedHashtag] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [clearModalVisible, setClearModalVisible] = useState(false);
  const { user } = useAuth();
  const { isDarkMode } = useTheme(); // Access theme context

  // Get user's name from metadata or email
  const userName =
    user?.user_metadata?.name || user?.email?.split("@")[0] || "there";

  // Fetch Data
  const fetchTasks = useCallback(async () => {
    try {
      const data = await todoApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  // Check for date change and clear todos at midnight
  useEffect(() => {
    const checkDateChange = async () => {
      const currentDate = dayjs().format("YYYY-MM-DD");
      if (currentDate !== lastCheckDate) {
        try {
          await todoApi.archiveAndClear();
          setLastCheckDate(currentDate);
          await fetchTasks(); // Refresh the task list
        } catch (error) {
          console.error("Error clearing todos at midnight:", error);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkDateChange, 60000);
    return () => clearInterval(interval);
  }, [lastCheckDate, fetchTasks]);

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time updates
    const subscription = subscribeToTodos((payload) => {
      if (payload.eventType === "INSERT") {
        setTasks((current) => [payload.new, ...current]);
      } else if (payload.eventType === "DELETE") {
        setTasks((current) =>
          current.filter((task) => task.id !== payload.old.id)
        );
      } else if (payload.eventType === "UPDATE") {
        setTasks((current) =>
          current.map((task) =>
            task.id === payload.new.id ? payload.new : task
          )
        );
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTasks]);

  // HANDLE COMPLETE
  const handleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      // Optimistically update UI
      setTasks((current) =>
        current.map((t) =>
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        )
      );

      if (!task.is_completed) {
        // Mark as completed
        await todoApi.toggleComplete(taskId, true);
      } else {
        // Mark as uncompleted
        await todoApi.toggleComplete(taskId, false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert optimistic update on error
      setTasks((current) =>
        current.map((t) =>
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        )
      );
    }
  };

  // HANDLE EDIT
  const handleEdit = async () => {
    try {
      await todoApi.update(editingTask.id, editedText, editedHashtag);
      setEditingTask(null);
      setEditedText("");
      setEditedHashtag("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // HANDLE DELETE
  const handleDelete = async (taskId) => {
    try {
      await todoApi.delete(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // HANDLE CLEAR ALL
  const handleClearAll = async () => {
    try {
      await todoApi.clearAll();
      setClearModalVisible(false);
      // Tasks will be updated automatically through the subscription
    } catch (error) {
      console.error("Error clearing tasks:", error);
    }
  };

  // TESTING STYLING for SECTION
  // const contentStyle = {
  //   height: "160px",
  //   // color: "#ffffff",
  //   color: "#545454",
  //   lineHeight: "160px",
  //   textAlign: "center",
  //   fontSize: "25px",
  //   background: "#FFFFFF",
  //   // background: "#2563eb",
  //   // background: "linear-gradient(to right, #ffffff, #2563eb)",
  //   borderRadius: "12px",
  //   overflow: "hidden",
  // };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 mt-[4.5rem]">
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Homepage</h2>
      </div>

      <div
        className={`fixed top-[3.5rem] left-0 right-0 z-10 md:relative md:top-0 ${
          isDarkMode ? "bg-gray" : "bg-white"
        }`}
      >
        {/* MOBILE HEADER */}
        <MobileHeader title="Homepage" />
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 md:pt-4">
          <img
            src={
              user?.user_metadata?.avatar_url ||
              `https://api.dicebear.com/7.x/micah/svg?seed=${user?.id}`
            }
            alt="Profile"
            className="w-12 h-auto rounded-full ml-2"
          />
          <div className="ml-2">
            <h2 className="text-lg font-semibold">Hello {userName}!</h2>
            <Text className="text-gray-500">
              You have {tasks.filter((task) => !task.is_completed).length} tasks
              today
            </Text>
          </div>
        </div>

        {/* SECTION */}
        <div className="mt-2 flex flex-col justify-center items-center">
          <div className="m-auto">
            {/* <img src={home_image} alt="login image" className="px-6" /> */}
            <img src={forest_image} alt="login image" className="opacity-90 " />
          </div>
          {/* CODE FOR FUTURE USE */}
          {/* <Card
            size="small"
            className="rounded-3xl border-none shadow-lg bg-white opacity-70 my-2 absolute"
            style={{
              width: 350,
            }}
          >
            <Carousel autoplay>
              <div className=" break-all ">
                <h3 style={contentStyle}>Today Is When You Start!</h3>
              </div>
              <div>
                <h3 style={contentStyle}>2</h3>
              </div>
              <div>
                <h3 style={contentStyle}>3</h3>
              </div>
              <div>
                <h3 style={contentStyle}>4</h3>
              </div>
            </Carousel>
          </Card> */}
        </div>

        {/* Tasks remaining and Clear All Button */}
        <div className="flex items-center justify-between w-full max-w-2xl h-12">
          <h2 className="text-gray-500 text-base ml-8 font-semibold">
            Today's Tasks
          </h2>
          {tasks.some((task) => !task.is_completed) && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "1",
                    icon: <FontAwesomeIcon icon={faTrashCan} />,
                    label: "Clear All",
                    danger: true,
                    onClick: () => setClearModalVisible(true),
                  },
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={
                  <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    style={{ fontSize: "20px", marginRight: "12px" }}
                  />
                }
                className="bg-transparent text-gray-500"
              />
            </Dropdown>
          )}
        </div>
      </div>

      {/* TASK CARDS */}
      <div className="pt-[360px]">
        {tasks.some((task) => !task.is_completed) ? (
          <Row gutter={[16, 16]} className="relative z-0">
            <AnimatePresence mode="popLayout">
              {tasks
                .filter((task) => !task.is_completed || showCompleted)
                .sort((a, b) => {
                  // Sort by priority first (priority tasks on top)
                  if (a.is_priority && !b.is_priority) return -1;
                  if (!a.is_priority && b.is_priority) return 1;
                  // Then sort by creation date (newest first)
                  return new Date(b.created_at) - new Date(a.created_at);
                })
                .map((task) => (
                  <Col xs={24} key={task.id}>
                    <motion.div
                      initial={{ opacity: 0, height: "auto" }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        marginBottom: 0,
                        transition: {
                          opacity: { duration: 0.2 },
                          height: { duration: 0.3, delay: 0.2 },
                        },
                        y: 25,
                      }}
                      layout
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <Card
                        hoverable
                        className={`shadow-md hover:shadow-md rounded-2xl transition-shadow ${
                          task.is_priority
                            ? "bg-gradient-to-r from-blue-400 to-blue-700"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <div className="flex items-start min-w-0">
                            {/* TODO CHECKBOX */}
                            <Checkbox
                              checked={task.is_completed}
                              onChange={() => handleTaskComplete(task.id)}
                              className="scale-125"
                            />
                            {/* TODO TEXT */}
                            <Typography.Text
                              className={`ml-4 break-words ${
                                task.is_priority ? "text-white" : ""
                              }`}
                              style={{ width: "100%" }}
                              delete={task.is_completed}
                            >
                              {task.task}
                            </Typography.Text>
                          </div>
                          <div className="flex items-center justify-between ml-8">
                            <div className="flex gap-2">
                              {/* EDIT BUTTON */}
                              <Button
                                type="text"
                                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                                size="small"
                                className={`text-gray-400 hover:text-blue-500 ${
                                  task.is_priority ? "text-white" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                  setEditedText(task.task);
                                  setEditedHashtag(task.hashtag || "");
                                }}
                              />
                              {/* DELETE BUTTON */}
                              <Button
                                type="text"
                                icon={<FontAwesomeIcon icon={faTrashCan} />}
                                size="small"
                                className={`text-red-400 ${
                                  task.is_priority ? "text-orange-300" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(task.id);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
            </AnimatePresence>
          </Row>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* MODAL - EDIT TASK */}
      <Modal
        title="Edit Task"
        open={!!editingTask}
        onOk={handleEdit}
        onCancel={() => {
          setEditingTask(null);
          setEditedText("");
          setEditedHashtag("");
        }}
      >
        <div className="space-y-4">
          <Input
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Enter task"
          />
          <Input
            value={editedHashtag}
            onChange={(e) => setEditedHashtag(e.target.value)}
            placeholder="Category (optional)"
            prefix="#"
          />
        </div>
      </Modal>

      {/* MODAL - CLEAR ALL TASKS */}
      <Modal
        title="Clear All Tasks"
        open={clearModalVisible}
        onOk={handleClearAll}
        onCancel={() => setClearModalVisible(false)}
        okText="Clear All"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        style={{ top: "35%" }}
      >
        <p>Are you sure you want to delete all uncompleted tasks?</p>
      </Modal>
    </div>
  );
}

export default TodoList;

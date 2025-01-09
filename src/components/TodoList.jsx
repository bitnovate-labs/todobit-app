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
} from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MobileHeader from "./MobileHeader";
import { motion, AnimatePresence } from "motion/react";
import { todoApi, subscribeToTodos } from "../lib/supabase";
import EmptyState from "./EmptyState";

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

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 mt-[4.5rem]">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Today's Tasks</h2>
      </div>
      <div className="fixed top-[3.5rem] left-0 right-0 bg-white z-10 md:relative md:top-0">
        {/* MOBILE HEADER */}
        <MobileHeader title="Today's Tasks" />
        <div className="flex items-center justify-between w-full mt-2 max-w-2xl mx-auto px-4 pb-2">
          <p className="text-gray-500 ml-2">
            {tasks.filter((task) => !task.is_completed).length} tasks remaining
          </p>
          {tasks.some((task) => !task.is_completed) && (
            <Button
              danger
              type="ghost"
              icon={<DeleteOutlined style={{ fontSize: "15px" }} />}
              className="rounded-2xl shadow-none p-0 mr-2"
              onClick={() => setClearModalVisible(true)}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* TASK CARDS */}
      <div className="pt-[50px]">
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
                                icon={<EditOutlined />}
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
                                icon={<DeleteOutlined />}
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

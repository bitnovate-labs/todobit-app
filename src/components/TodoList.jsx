import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Checkbox,
  Tag,
  Empty,
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
import { todoApi, subscribeToTodos } from "../lib/supabase";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [lastCheckDate, setLastCheckDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );

  const handleEdit = async () => {
    try {
      await todoApi.update(editingTask.id, editedText);
      setEditingTask(null);
      setEditedText("");
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

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

  const handleDelete = async (taskId) => {
    try {
      await todoApi.delete(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
      </div>
      <MobileHeader title="Today's Tasks" />
      {tasks.length > 0 ? (
        <TransitionGroup component={Row} gutter={[16, 16]}>
          {tasks
            .filter((task) => !task.is_completed || showCompleted)
            .map((task) => (
              <CSSTransition key={task.id} timeout={1500} classNames="task">
                <Col xs={24}>
                  <Card
                    hoverable
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start min-w-0">
                        <Checkbox
                          checked={task.is_completed}
                          onChange={() => handleTaskComplete(task.id)}
                          className="scale-125"
                        />
                        <Typography.Text
                          className="ml-4 break-words"
                          style={{ width: "100%" }}
                          delete={task.is_completed}
                        >
                          {task.task}
                        </Typography.Text>
                      </div>
                      <div className="flex items-center justify-between ml-8">
                        <div>
                          {task.hashtag && (
                            <Tag color="blue">#{task.hashtag}</Tag>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            className="text-gray-400 hover:text-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTask(task);
                              setEditedText(task.task);
                            }}
                          />
                          <Button
                            type="text"
                            icon={<DeleteOutlined />}
                            size="small"
                            className="text-red-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(task.id);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </CSSTransition>
            ))}
        </TransitionGroup>
      ) : (
        <Empty description="No tasks yet" className="my-8" />
      )}

      <Modal
        title="Edit Task"
        open={!!editingTask}
        onOk={handleEdit}
        onCancel={() => {
          setEditingTask(null);
          setEditedText("");
        }}
      >
        <Input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Enter task"
        />
      </Modal>
    </div>
  );
}

export default TodoList;

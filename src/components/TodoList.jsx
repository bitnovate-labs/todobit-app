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
import MobileHeader from "./MobileHeader";
import { todoApi, subscribeToTodos } from "../lib/supabase";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // FETCH TASKS
  const fetchTasks = useCallback(async () => {
    try {
      const data = await todoApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  // REAL-TIME UPDATES
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
  }, []);

  // HANDLE COMPLETED TASK
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
      await todoApi.update(editingTask.id, editedText);
      setEditingTask(null);
      setEditedText("");
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

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
      </div>
      <MobileHeader title="Today's Tasks" />

      {/* Task Groups Section */}
      {/* {groups.length > 0 && (
        <div className="mb-6">
          {groups.map(
            (group) =>
              group.items.some((item) => !item.is_completed) && (
                <Card
                  key={group.id}
                  className="mb-4 shadow-sm hover:shadow-md transition-shadow"
                  title={group.name}
                >
                  <Collapse bordered={false} className="-mx-6 -mb-6">
                    <Collapse.Panel
                      key="tasks"
                      header="View Tasks"
                      className="border-t border-gray-200"
                    >
                      <div className="space-y-2 pt-2">
                        {group.items
                          .filter((item) => !item.is_completed)
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between"
                            >
                              <Checkbox
                                className="flex-1"
                                checked={false}
                                onChange={() =>
                                  handleTaskComplete(item.id, group.id)
                                }
                              >
                                <span>{item.task}</span>
                              </Checkbox>
                              <div className="ml-2">
                                {item.hashtag && (
                                  <Tag color="blue">#{item.hashtag}</Tag>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </Card>
              )
          )}
        </div>
      )} */}

      {tasks.length > 0 ? (
        <TransitionGroup component={Row} gutter={[10, 10]}>
          {tasks
            .filter((task) => !task.is_completed || showCompleted)
            .map((task) => (
              <CSSTransition key={task.id} timeout={1500} classNames="task">
                <Col xs={24}>
                  <Card
                    hoverable
                    className="shadow-md hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start min-w-0">
                        <Checkbox
                          checked={task.is_completed}
                          onChange={() => handleTaskComplete(task.id)}
                          className="scale-125 mr-2"
                        />
                        <Typography.Text
                          className="ml-2 break-words"
                          style={{ width: "100%" }}
                          delete={task.is_completed}
                        >
                          {task.task}
                        </Typography.Text>
                      </div>
                      <div className="flex items-center justify-between gap-2 ml-8">
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

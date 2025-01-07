import { useState, useEffect, useCallback } from "react";
import { Card, Checkbox, Tag, Empty, Typography, Row, Col, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import MobileHeader from "./MobileHeader";
import { todoApi, subscribeToTodos } from "../lib/supabase";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function TodoList() {
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await todoApi.getAll();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

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

  // Handle Completed Task
  const handleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const updatedTask = await todoApi.toggleComplete(
        taskId,
        !task.is_completed
      );
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      setTimeout(() => setTasks(tasks.filter((t) => t.id !== taskId)), 1500);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle Delete
  const handleDelete = async (taskId) => {
    try {
      await todoApi.delete(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>
      </div>
      <MobileHeader title="Today's Tasks" />
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
                      {/* {task.hashtag && (
                        <Tag color="blue" className="self-start ml-8 mt-1">
                          #{task.hashtag}
                        </Tag>
                      )} */}
                      <div className="flex items-center justify-between gap-2 ml-8">
                        <div>
                          {task.hashtag && (
                            <Tag color="blue">#{task.hashtag}</Tag>
                          )}
                        </div>
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
                  </Card>
                </Col>
              </CSSTransition>
            ))}
        </TransitionGroup>
      ) : (
        <Empty description="No tasks yet" className="my-8" />
      )}
    </div>
  );
}

export default TodoList;

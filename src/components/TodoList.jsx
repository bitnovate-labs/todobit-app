import { useState, useEffect, useCallback } from "react";
import { List, Checkbox, Tag, Empty, Typography } from "antd";
import MobileHeader from "./MobileHeader";
import { todoApi, subscribeToTodos } from "../lib/supabase";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function TodoList() {
  const [tasks, setTasks] = useState([]);

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

  return (
    <div className="max-w-2xl mx-auto space-y-4 px-4 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Today's Tasks</h2>
      </div>
      <MobileHeader title="Today's Tasks" />
      {tasks.length > 0 ? (
        <TransitionGroup
          component={List}
          className="bg-white rounded-lg shadow-sm"
        >
          {tasks.map((task) => (
            <CSSTransition key={task.id} timeout={1500} classNames="task">
              <List.Item className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 task-item">
                <Checkbox
                  checked={task.is_completed}
                  onChange={() => handleTaskComplete(task.id)}
                >
                  <Typography.Text className="ml-2">
                    {task.task}
                  </Typography.Text>
                </Checkbox>
                {task.hashtag && (
                  <Tag color="blue" className="ml-auto">
                    #{task.hashtag}
                  </Tag>
                )}
              </List.Item>
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

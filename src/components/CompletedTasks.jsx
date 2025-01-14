import { useState, useEffect } from "react";
import { List, Empty, Card, Typography, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import MobileHeader from "./MobileHeader";
import { useAuth } from "../context/AuthContext";

// Extend dayjs with the UTC plugin
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

function CompletedTasks() {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  // FETCH ALL COMPLETED TASKS
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("todos")
          .select("id, task, hashtag, created_at, completed_at")
          .eq("is_completed", true)
          .eq("user_id", user.id)
          .eq("is_visible", true)
          .order("completed_at", { ascending: false });
        if (error) throw error;

        console.log("Fetched completed tasks:", data);
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    };

    fetchCompletedTasks();
  }, [user.id]);

  // HANDLE DELETE
  const handleDelete = async (taskId) => {
    try {
      await supabase
        .from("todos")
        .update({ is_visible: false }) // Change to update instead of delete
        .eq("id", taskId)
        .eq("user_id", user.id);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // HANDLE DELETE ALL
  const handleDeleteAll = () => {
    setTasks([]); // Clear the tasks from view
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 mt-[4.5rem]">
      {/* MOBILE HEADER */}
      <MobileHeader title="Completed Tasks" onDeleteAll={handleDeleteAll} />
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Completed Tasks</h2>
      </div>

      {tasks.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1 }}
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item>
              <Card className="w-full shadow-md hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <Text className="text-lg">{task.task}</Text>
                  <div className="flex items-center justify-between">
                    <Text type="secondary" className="text-sm">
                      Completed{" "}
                      {dayjs
                        .utc(task.completed_at)
                        .local()
                        .format("MMM D, YYYY h:mm A")}
                    </Text>
                    <div className="flex justify-start">
                      {/* {task.hashtag && <Tag color="blue">#{task.hashtag}</Tag>} */}
                      <Button
                        type="text"
                        icon={<FontAwesomeIcon icon={faTrash} />}
                        className="text-red-400 hover:text-red-500"
                        onClick={() => handleDelete(task.id)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No completed tasks yet"
          className="bg-transparent pt-32"
        />
      )}
    </div>
  );
}

export default CompletedTasks;

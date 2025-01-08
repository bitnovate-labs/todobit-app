import { useState, useEffect } from "react";
import { List, Tag, Empty, Card, Typography, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import MobileHeader from "./MobileHeader";

// Extend dayjs with the UTC plugin
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;

function CompletedTasks() {
  const [tasks, setTasks] = useState([]);

  // FETCH ALL COMPLETED TASKS
  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const { data } = await supabase
          .from("todos")
          .select("id, task, hashtag, created_at, completed_at")
          .eq("is_completed", true)
          .order("completed_at", { ascending: false });
        setTasks(data || []);
      } catch (error) {
        console.error("Error fetching completed tasks:", error);
      }
    };

    fetchCompletedTasks();
  }, []);

  // HANDLE DELETE
  const handleDelete = async (taskId) => {
    try {
      await supabase.from("todos").delete().eq("id", taskId);
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 pb-24">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Completed Tasks</h2>
      </div>
      <MobileHeader title="Completed Tasks" />

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
                        icon={<DeleteOutlined />}
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
          className="bg-white p-8 rounded-2xl shadow-md"
        />
      )}
    </div>
  );
}

export default CompletedTasks;

import { useState, useEffect } from "react";
import { Calendar, Badge, Modal, TimePicker, Button, message } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function TimeBlocking() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeRange, setTimeRange] = useState([null, null]);

  // Query time blocks
  const { data: timeBlocks } = useQuery({
    queryKey: ["timeBlocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_blocks")
        .select("*, todos(*)")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
  });

  // Query available tasks
  const { data: availableTasks } = useQuery({
    queryKey: ["availableTasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .is("time_block_id", null);

      if (error) throw error;
      return data;
    },
  });

  // Mutation for creating time blocks
  const createTimeBlock = useMutation({
    mutationFn: async ({ taskId, startTime, endTime }) => {
      const { data, error } = await supabase
        .from("time_blocks")
        .insert([
          {
            todo_id: taskId,
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availableTasks"] });
      message.success("Task scheduled successfully");
    },
    onError: (error) => {
      message.error("Failed to schedule task: " + error.message);
    },
  });

  // Mutation for updating time blocks
  const updateTimeBlock = useMutation({
    mutationFn: async ({ id, startTime, endTime }) => {
      const { data, error } = await supabase
        .from("time_blocks")
        .update({
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeBlocks"] });
      message.success("Schedule updated successfully");
    },
  });

  // Mutation for deleting time blocks
  const deleteTimeBlock = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("time_blocks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availableTasks"] });
      message.success("Schedule removed successfully");
    },
  });

  // Handle notifications
  useEffect(() => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    const checkPermission = async () => {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };

    checkPermission();

    const notificationInterval = setInterval(() => {
      if (!timeBlocks) return;

      timeBlocks.forEach((block) => {
        if (block.notification_sent) return;

        const startTime = dayjs(block.start_time);
        const now = dayjs();
        const diff = startTime.diff(now, "minute");

        if (diff <= 15 && diff > 0) {
          new Notification("Upcoming Task", {
            body: `${block.todos.task} starts in ${diff} minutes`,
            icon: "/logo.png",
          });

          // Mark notification as sent
          supabase
            .from("time_blocks")
            .update({ notification_sent: true })
            .eq("id", block.id);
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(notificationInterval);
  }, [timeBlocks]);

  const dateCellRender = (date) => {
    if (!timeBlocks) return null;

    const dayBlocks = timeBlocks.filter((block) =>
      dayjs(block.start_time).isSame(date, "day")
    );

    return (
      <ul className="events">
        {dayBlocks.map((block) => (
          <li key={block.id}>
            <Badge
              status="processing"
              text={`${dayjs(block.start_time).format("HH:mm")} - ${
                block.todos.task
              }`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const handleSelect = (date) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const handleSchedule = async () => {
    if (!selectedTask || !timeRange[0] || !timeRange[1]) {
      message.error("Please select a task and time range");
      return;
    }

    const [startTime, endTime] = timeRange;

    try {
      await createTimeBlock.mutateAsync({
        taskId: selectedTask,
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
      });

      setModalVisible(false);
      setSelectedTask(null);
      setTimeRange([null, null]);
    } catch (error) {
      console.error("Error scheduling task:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Calendar
        onSelect={handleSelect}
        cellRender={dateCellRender}
        className={isDarkMode ? "dark-theme" : ""}
      />

      <Modal
        title="Schedule Task"
        open={modalVisible}
        onOk={handleSchedule}
        onCancel={() => {
          setModalVisible(false);
          setSelectedTask(null);
          setTimeRange([null, null]);
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Select Task</label>
            <select
              value={selectedTask || ""}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Choose a task...</option>
              {availableTasks?.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.task}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Select Time Range</label>
            <TimePicker.RangePicker
              value={timeRange}
              onChange={setTimeRange}
              format="HH:mm"
              className="w-full"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TimeBlocking;

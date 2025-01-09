import { useMemo, useState, useEffect } from "react";
import { Drawer, List, Button, Modal, Typography } from "antd";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { supabase } from "../lib/supabase";
import { DeleteOutlined } from "@ant-design/icons";
import { capitalize } from "../utils/stringUtils";

const { Text } = Typography;

const DAYS_OF_WEEK = [
  { short: "Mon", label: "Mon" },
  { short: "Tue", label: "Tue" },
  { short: "Wed", label: "Wed" },
  { short: "Thu", label: "Thu" },
  { short: "Fri", label: "Fri" },
  { short: "Sat", label: "Sat" },
  { short: "Sun", label: "Sun" },
];
const WEEKS_TO_SHOW = 52;

function Heatmap({ data = [], hashtag, onDeleteCategory }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const heatmapData = useMemo(() => {
    // Find the most active day for the category
    const maxActivityDay = data.reduce(
      (max, curr) => (curr.count > (max?.count || 0) ? curr : max),
      null
    );

    const today = dayjs();
    const endDate = today.endOf("week");
    const startDate = endDate
      .subtract(WEEKS_TO_SHOW - 1, "week")
      .startOf("week");

    // If we have activity, set it as selected initially
    if (maxActivityDay && !selectedDate) {
      setSelectedDate(dayjs(maxActivityDay.date));
    }

    // Create empty grid
    const grid = DAYS_OF_WEEK.map((day) => {
      return Array(WEEKS_TO_SHOW)
        .fill(0)
        .map((_, weekIndex) => ({
          date: startDate
            .add(weekIndex, "week")
            .day(DAYS_OF_WEEK.findIndex((d) => d.short === day.short) + 1),
          count: 0,
        }));
    });

    // Fill in data
    data.forEach((item) => {
      const date = dayjs(item.date);
      const weekIndex = Math.floor(date.diff(startDate, "day") / 7);
      const dayIndex = DAYS_OF_WEEK.findIndex(
        (d) => d.short === date.format("ddd")
      );

      if (weekIndex >= 0 && weekIndex < WEEKS_TO_SHOW && dayIndex >= 0) {
        grid[dayIndex][weekIndex].count = item.count;
      }
    });

    return grid;
  }, [data, selectedDate]);

  const getColorClass = (count) => {
    if (count === 0) return "bg-activityColor-none";
    if (count === 1) return "bg-activityColor-low";
    if (count === 2) return "bg-activityColor-mediumLow";
    if (count === 3) return "bg-activityColor-mediumHigh";
    if (count === 4) return "bg-activityColor-high";
    return "bg-activityColor-high";
  };

  const fetchTasksForDate = useMemo(
    () => async (date) => {
      try {
        const { data: tasks } = await supabase
          .from("todos")
          .select("*")
          .eq("hashtag", hashtag)
          .eq("is_completed", true)
          .gte("completed_at", date.startOf("day").toISOString())
          .lte("completed_at", date.endOf("day").toISOString())
          .order("completed_at", { ascending: false });

        setSelectedDayTasks(tasks || []);
      } catch (error) {
        console.error("Error fetching day tasks:", error);
      }
    },
    [hashtag]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchTasksForDate(selectedDate);
    }
  }, [selectedDate, fetchTasksForDate]);

  return (
    <div
      className="w-full bg-white rounded-2xl p-6 shadow-md relative hover:shadow-md transition-shadow"
      onClick={(e) => {
        if (
          e.target === e.currentTarget ||
          e.target.closest(".heatmap-content")
        ) {
          setDrawerVisible(true);
        }
      }}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setDrawerVisible(true);
        }
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{capitalize(hashtag)}</h3>
        <Text className="text-gray-500">{dayjs().format("MMMM YYYY")}</Text>
      </div>
      <div className="overflow-hidden heatmap-content">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div className="flex flex-col gap-1">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.short}
                className="h-4 text-xs text-gray-400 flex items-center"
                style={{ width: "32px" }}
              >
                {day.label}
              </div>
            ))}
          </div>

          <div className="flex-1">
            {DAYS_OF_WEEK.map((day, dayIndex) => (
              <div key={day.short} className="flex gap-1 mb-1">
                {[...heatmapData[dayIndex]].reverse().map((cell, weekIndex) => (
                  <div
                    key={`${day.short}-${weekIndex}`}
                    className={`w-4 h-4 rounded-sm ${getColorClass(
                      cell.count
                    )}  ${
                      dayjs().isSame(cell.date, "day")
                        ? "ring-2 ring-green-500"
                        : ""
                    } transition-colors`}
                    title={`${cell.date.format("MMM D")}: ${cell.count} tasks`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Drawer
        title={`${capitalize(hashtag)} - ${selectedDate?.format(
          "MMM D, YYYY"
        )}`}
        placement="right"
        className="heatmap-drawer"
        open={drawerVisible}
        style={{ padding: "10px 0" }}
        onClose={() => setDrawerVisible(false)}
        width="100%"
        footer={
          <div className="p-4">
            <Button
              danger
              block
              onClick={() => setDeleteModalVisible(true)}
              icon={<DeleteOutlined />}
              className="font-bold"
            >
              Delete Category
            </Button>
          </div>
        }
      >
        <List
          dataSource={selectedDayTasks}
          renderItem={(task) => (
            <List.Item>
              <div className="w-full">
                <Text>{task.task}</Text>
                <Text type="secondary" className="block text-xs">
                  {dayjs(task.completed_at).format("h:mm A")}
                </Text>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: "No tasks for this day" }}
        />
      </Drawer>

      <Modal
        title="Delete Category"
        open={deleteModalVisible}
        onOk={() => {
          onDeleteCategory(hashtag);
          setDeleteModalVisible(false);
          setDrawerVisible(false);
        }}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        style={{ top: "70%" }} // Adjust the top position
      >
        <p>Are you sure you want to delete this category and all its tasks?</p>
        {/* <p className="text-gray-500 mt-2">This action cannot be undone.</p> */}
      </Modal>
    </div>
  );
}

Heatmap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
  hashtag: PropTypes.string.isRequired,
  onDeleteCategory: PropTypes.func.isRequired,
};

export default Heatmap;

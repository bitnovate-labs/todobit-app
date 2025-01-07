import { useState, useEffect } from "react";
import { Card, Row, Col, Modal, List } from "antd";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import dayjs from "dayjs";
import MobileHeader from "./MobileHeader";
import { todoApi, supabase } from "../lib/supabase";

function Statistics() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [completionData, setCompletionData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stats, completion] = await Promise.all([
          todoApi.getStatistics(),
          todoApi.getCompletionData(),
        ]);
        setCategoryStats(stats);
        setCompletionData(completion);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      if (selectedCategory && !selectedCategory.name) {
        try {
          const { data } = await supabase
            .from("todos")
            .select("*")
            .is("hashtag", null)
            .eq("is_completed", true)
            .order("created_at", { ascending: false });
          setCompletedTasks(data || []);
        } catch (error) {
          console.error("Error fetching completed tasks:", error);
        }
      }
    };

    fetchCompletedTasks();
  }, [selectedCategory]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:mt-0 space-y-4">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Activity Overview</h2>
      </div>
      <MobileHeader title="Activity Overview" />

      <div className="bg-white rounded-lg p-8 mb-8 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Activity</h3>
          <span className="text-gray-500">{dayjs().format("MMMM YYYY")}</span>
        </div>
        <CalendarHeatmap
          startDate={dayjs().startOf("month").toDate()}
          endDate={dayjs().endOf("month").toDate()}
          values={completionData}
          showWeekdayLabels={true}
          showMonthLabels={false}
          weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          transformDayElement={(element, value) => ({
            ...element,
            props: {
              ...element.props,
              "data-tip": value
                ? `${value.count} tasks on ${dayjs(value.date).format("D")}`
                : "No tasks",
            },
          })}
          classForValue={(value) => {
            if (!value) return "color-empty";
            return `color-scale-${value.count}`;
          }}
          gutterSize={10}
          horizontal={false}
          showOutOfRangeDays={true}
          className="mx-[-8px] scale-90 origin-left"
        />
      </div>

      <h3 className="text-lg font-semibold text-center mb-4">Categories</h3>
      <Row gutter={[16, 16]}>
        {categoryStats
          .sort((a, b) => b.completedTasks - a.completedTasks)
          .map((category) => (
            <Col xs={24} sm={12} md={8} key={category.name}>
              <Card
                hoverable
                className="shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category)}
              >
                <h4 className="text-lg font-medium mb-2">
                  {category.name ? `#${category.name}` : "Uncategorized"}
                </h4>
                <p className="text-gray-600">
                  {category.completedTasks} of {category.totalTasks} tasks
                  completed
                </p>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${category.completionRate}%` }}
                  />
                </div>
              </Card>
            </Col>
          ))}
      </Row>

      <Modal
        title={
          selectedCategory
            ? selectedCategory.name
              ? `#${selectedCategory.name} Details`
              : "Uncategorized Tasks Details"
            : ""
        }
        open={!!selectedCategory}
        onCancel={() => setSelectedCategory(null)}
        footer={null}
      >
        {selectedCategory && (
          <div className="space-y-2">
            <p>Total tasks: {selectedCategory.totalTasks}</p>
            <p>Completed: {selectedCategory.completedTasks}</p>
            <p>Completion rate: {selectedCategory.completionRate}%</p>
            {!selectedCategory.name && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-500">
                  These are tasks without any category assigned.
                </p>
                <List
                  className="mt-4"
                  size="small"
                  header={<div className="font-medium">Completed Tasks</div>}
                  dataSource={completedTasks}
                  renderItem={(task) => (
                    <List.Item>
                      <span className="text-gray-600">{task.task}</span>
                      <span className="text-gray-400 text-sm">
                        {dayjs(task.created_at).format("MMM D")}
                      </span>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Statistics;

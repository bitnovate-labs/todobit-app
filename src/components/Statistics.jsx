import { useState, useEffect } from "react";
import { Card, Row, Col, Modal } from "antd";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import dayjs from "dayjs";
import MobileHeader from "./MobileHeader";
import { todoApi } from "../lib/supabase";

function Statistics() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [completionData, setCompletionData] = useState([]);

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

  return (
    <div className="max-w-4xl mx-auto px-4 md:mt-0 space-y-4">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Activity Overview</h2>
      </div>
      <MobileHeader title="Activity Overview" />

      <div className="bg-white rounded-lg p-8 mb-8 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-semibold mb-6">Activity</h3>
        <CalendarHeatmap
          startDate={dayjs().startOf("month").toDate()}
          endDate={dayjs().endOf("month").toDate()}
          values={completionData}
          showWeekdayLabels={true}
          weekdayLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          classForValue={(value) => {
            if (!value) return "color-empty";
            return `color-scale-${value.count}`;
          }}
          gutterSize={3}
          horizontal={false}
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
                className="shadow-md hover:shadow-md transition-shadow"
                onClick={() => setSelectedCategory(category)}
              >
                <h4 className="text-lg font-medium mb-2">
                  #{category.name || "uncategorized"}
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
        title={selectedCategory ? `#${selectedCategory.name} Details` : ""}
        open={!!selectedCategory}
        onCancel={() => setSelectedCategory(null)}
        footer={null}
      >
        {selectedCategory && (
          <div>
            <p>Total tasks: {selectedCategory.totalTasks}</p>
            <p>Completed: {selectedCategory.completedTasks}</p>
            <p>Completion rate: {selectedCategory.completionRate}%</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Statistics;

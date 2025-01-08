import { useMemo } from "react";
import dayjs from "dayjs";

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

function Heatmap({ data = [], hashtag }) {
  const heatmapData = useMemo(() => {
    const today = dayjs();
    const endDate = today.endOf("week");
    const startDate = endDate
      .subtract(WEEKS_TO_SHOW - 1, "week")
      .startOf("week");

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
  }, [data]);

  const getColorClass = (count) => {
    if (count === 0) return "bg-gray-100";
    if (count === 1) return "bg-green-200";
    if (count === 2) return "bg-green-300";
    if (count === 3) return "bg-green-400";
    return "bg-green-500";
  };

  return (
    <div className="w-full bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4">#{hashtag}</h3>
      <div className="overflow-hidden">
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
                    )}`}
                    title={`${cell.date.format("MMM D")}: ${cell.count} tasks`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;

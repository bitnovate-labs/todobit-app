import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spin, message } from "antd";
import MobileHeader from "./MobileHeader";
import Heatmap from "./Heatmap";
import { todoApi, supabase } from "../lib/supabase";

function Statistics() {
  // const [loading, setLoading] = useState(true);
  const [categoryStats, setCategoryStats] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});

  // Query statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["statistics"],
    queryFn: todoApi.getStatistics,
    initialData: () => {
      const cached = localStorage.getItem("stats_cache");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          // 30 minutes
          return data;
        }
      }
      return undefined;
    },
  });

  // Query heatmap data for each category
  const { data: heatmapStats, isLoading: isLoadingHeatmap } = useQuery({
    queryKey: ["heatmapData", stats],
    queryFn: async () => {
      if (!stats) return {};
      const heatmapPromises = stats
        .filter((stat) => stat.name)
        .map(async (stat) => {
          const data = await todoApi.getCompletionData(stat.name);
          return [stat.name, data];
        });
      const heatmapResults = await Promise.all(heatmapPromises);
      return Object.fromEntries(heatmapResults);
    },
    enabled: !!stats,
  });

  useEffect(() => {
    if (stats) {
      setCategoryStats(stats.filter((stat) => stat.name));
    }
    if (heatmapStats) {
      setHeatmapData(heatmapStats);
    }
  }, [stats, heatmapStats]);

  // HANDLE DELETE CATEGORY
  const handleDeleteCategory = async (hashtag) => {
    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("hashtag", hashtag);

      if (error) throw error;

      // Update local state
      setCategoryStats((prev) => prev.filter((stat) => stat.name !== hashtag));
      setHeatmapData((prev) => {
        const newData = { ...prev };
        delete newData[hashtag];
        return newData;
      });

      message.success(`Category #${hashtag} deleted successfully`);
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       setLoading(true);
  //       const stats = await todoApi.getStatistics();
  //       const filteredStats = stats.filter((stat) => stat.name); // Only keep categories with hashtags
  //       setCategoryStats(filteredStats);

  //       // Fetch heatmap data for each category
  //       const heatmapPromises = filteredStats.map(async (stat) => {
  //         const data = await todoApi.getCompletionData(stat.name);
  //         return [stat.name, data];
  //       });

  //       const heatmapResults = await Promise.all(heatmapPromises);
  //       const heatmapDataByCategory = Object.fromEntries(heatmapResults);
  //       setHeatmapData(heatmapDataByCategory);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching statistics:", error);
  //       setLoading(false);
  //     }
  //   };

  //   fetchStats();
  // }, []);

  return (
    <div className="max-w-4xl mx-auto md:mt-0 space-y-14">
      {/* MOBILE HEADER */}
      <MobileHeader title="Statistics" />
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Statistics</h2>
      </div>
      {isLoadingStats || isLoadingHeatmap ? (
        <div className="flex justify-center py-8">
          <Spin size="large" />
        </div>
      ) : (
        <div className="space-y-6">
          {categoryStats.map((category) => (
            <Heatmap
              key={category.name}
              data={heatmapData[category.name] || []}
              hashtag={category.name}
              onDeleteCategory={handleDeleteCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Statistics;

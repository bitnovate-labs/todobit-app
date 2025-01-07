import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Subscribe to changes
export const subscribeToTodos = (callback) => {
  return supabase
    .channel("public:todos")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "todos" },
      (payload) => callback(payload)
    )
    .subscribe();
};

// Todo CRUD operations
export const todoApi = {
  // Create a new todo
  async create(task, hashtag) {
    const { data, error } = await supabase
      .from("todos")
      .insert([{ task, hashtag }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Read all todos
  async getAll() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get todos by hashtag
  async getByHashtag(hashtag) {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("hashtag", hashtag)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update todo completion status
  async toggleComplete(id, isCompleted) {
    const { data, error } = await supabase
      .from("todos")
      .update({ is_completed: isCompleted })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get statistics by hashtag
  async getStatistics() {
    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const stats = todos.reduce((acc, todo) => {
      const category = todo.hashtag || null;
      const key = category || "uncategorized";

      if (!acc[key]) {
        acc[key] = {
          name: category,
          totalTasks: 0,
          completedTasks: 0,
          completionRate: 0,
        };
      }

      acc[key].totalTasks++;
      if (todo.is_completed) {
        acc[key].completedTasks++;
      }

      acc[key].completionRate = Math.round(
        (acc[key].completedTasks / acc[key].totalTasks) * 100
      );

      return acc;
    }, {});

    return Object.values(stats);
  },
  // Get completion data for heatmap
  async getCompletionData() {
    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .eq("is_completed", true);

    if (error) throw error;

    const completionMap = todos.reduce((acc, todo) => {
      const date = todo.created_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(completionMap).map(([date, count]) => ({
      date,
      count: Math.min(count, 4), // Cap at 4 for heatmap scale
    }));
  },

  // Delete a todo
  async delete(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) throw error;
    return true;
  },
};

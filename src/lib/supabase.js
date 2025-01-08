import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

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

  // Archive completed tasks and clear todo list
  async archiveAndClear() {
    try {
      // First move completed tasks to completed_todos
      await supabase.rpc("archive_completed_todos");

      // Then delete all todos
      const { error } = await supabase
        .from("todos")
        .delete()
        .not("id", "is", null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error archiving and clearing todos:", error);
      throw error;
    }
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

  // Update todo text
  async update(id, task, hashtag) {
    const { data, error } = await supabase
      .from("todos")
      .update({ task, hashtag })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update todo completion status
  async toggleComplete(id, isCompleted) {
    const { data, error } = await supabase
      .from("todos")
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
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
  async getCompletionData(hashtag = null) {
    const startDate = dayjs()
      .subtract(52, "weeks")
      .startOf("week")
      .toISOString();
    const endDate = dayjs().endOf("week").toISOString();

    let query = supabase
      .from("todos")
      .select("*")
      .eq("is_completed", true)
      .gte("completed_at", startDate)
      .lte("completed_at", endDate);

    if (hashtag) {
      query = query.eq("hashtag", hashtag);
    }

    const { data: todos, error } = await query;

    if (error) throw error;

    // Fill in completed tasks
    const completionMap = todos.reduce((acc, todo) => {
      const date = dayjs(todo.completed_at).format("YYYY-MM-DD");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(completionMap)
      .sort()
      .map(([date, count]) => ({
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

// Task Groups API
export const taskGroupsApi = {
  // Create a new task group
  async create(name, description = "") {
    const { data, error } = await supabase
      .from("task_groups")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Add items to a task group
  async addItems(groupId, items) {
    const { data, error } = await supabase
      .from("task_group_items")
      .insert(
        items.map((item) => ({
          group_id: groupId,
          task: item.task,
          hashtag: item.hashtag,
        }))
      )
      .select();

    if (error) throw error;
    return data;
  },

  // Get all task groups
  async getAll() {
    const { data, error } = await supabase
      .from("task_groups")
      .select(
        `
        *,
        items:task_group_items(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add group tasks to todos
  async addToTodos(groupId) {
    const { data: items } = await supabase
      .from("task_group_items")
      .select("*")
      .eq("group_id", groupId);

    if (items) {
      const promises = items.map((item) =>
        todoApi.create(item.task, item.hashtag)
      );
      await Promise.all(promises);
    }
  },
};

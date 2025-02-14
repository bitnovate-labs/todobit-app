import { createClient } from "@supabase/supabase-js";
import dayjs from "dayjs";

// Cache configuration
const CACHE_CONFIG = {
  TODOS: {
    key: "todos_cache",
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  TASK_GROUPS: {
    key: "task_groups_cache",
    ttl: 15 * 60 * 1000, // 15 minutes
  },
  STATS: {
    key: "stats_cache",
    ttl: 30 * 60 * 1000, // 30 minutes
  },
};

// Cache utilities
const cache = {
  get: (key) => {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const config = Object.values(CACHE_CONFIG).find((c) => c.key === key);

    if (Date.now() - timestamp > config.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  },
  set: (key, data) => {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  },
  invalidate: (key) => {
    localStorage.removeItem(key);
  },
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for user authentication
const getAuthenticatedUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Please sign in to continue");
  return user;
};

// Helper function for error handling
const handleSupabaseResponse = ({ data, error }) => {
  if (error) throw error;
  return data;
};

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
  // CREATE NEW TODO
  async create(task, hashtag, isPriority = false) {
    const user = await getAuthenticatedUser();

    return handleSupabaseResponse(
      await supabase
        .from("todos")
        .insert([
          {
            task,
            hashtag: hashtag || "", // Use empty string instead of null
            user_id: user.id,
            is_priority: isPriority,
          },
        ])
        .select()
        .single()
    );
  },

  // GET ALL TODOS
  async getAll() {
    const user = await getAuthenticatedUser();

    // Check cache first
    const cached = cache.get(CACHE_CONFIG.TODOS.key);
    if (cached) {
      return cached;
    }

    // Fetch from server if not cached
    const data = handleSupabaseResponse(
      await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    );

    // Cache the result
    cache.set(CACHE_CONFIG.TODOS.key, data);
    return data;
  },

  // DELETE ALL TODOS (NON-COMPLETED / CURRENT)
  async clearAll() {
    const user = await getAuthenticatedUser();

    const result = handleSupabaseResponse(
      await supabase
        .from("todos")
        .delete()
        .eq("is_completed", false)
        .eq("user_id", user.id)
    );

    // Invalidate todos cache
    cache.invalidate(CACHE_CONFIG.TODOS.key);
    return result;
  },

  // GET TODOS BY HASHTAG
  async getByHashtag(hashtag) {
    const user = await getAuthenticatedUser();
    return handleSupabaseResponse(
      await supabase
        .from("todos")
        .select("*")
        .eq("hashtag", hashtag)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    );
  },

  // UPDATE TODOS
  async update(id, task, hashtag, isPriority) {
    const user = await getAuthenticatedUser();

    const result = handleSupabaseResponse(
      await supabase
        .from("todos")
        .update({ task, hashtag, is_priority: isPriority })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()
    );

    // Invalidate todos cache
    cache.invalidate(CACHE_CONFIG.TODOS.key);
    return result;
  },

  // UPDATE TODO COMPLETED STATUS
  async toggleComplete(id, isCompleted) {
    const user = await getAuthenticatedUser();

    const result = handleSupabaseResponse(
      await supabase
        .from("todos")
        .update({
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()
    );

    // Invalidate todos cache
    cache.invalidate(CACHE_CONFIG.TODOS.key);
    return result;
  },

  // GET STATISTICS BY HASHTAG
  async getStatistics() {
    const user = await getAuthenticatedUser();

    // Check cache first
    const cached = cache.get(CACHE_CONFIG.STATS.key);
    if (cached) {
      return cached;
    }

    const { data: todos, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
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

    const result = Object.values(stats);

    // Cache the result
    cache.set(CACHE_CONFIG.STATS.key, result);
    return result;
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
    const user = await getAuthenticatedUser();
    return handleSupabaseResponse(
      await supabase.from("todos").delete().eq("id", id).eq("user_id", user.id)
    );
  },
};

// -----------------------------------------------
// TASK GROUPS API
export const taskGroupsApi = {
  // CREATE A NEW TASK GROUP
  async create(name, description = "") {
    const user = await getAuthenticatedUser();

    return handleSupabaseResponse(
      await supabase
        .from("task_groups")
        .insert([
          {
            name,
            description,
            user_id: user.id,
          },
        ])
        .select()
        .single()
    );
  },

  // ADD ITEMS TO A TASK GROUP
  async addItems(groupId, items) {
    const user = await getAuthenticatedUser();

    return handleSupabaseResponse(
      await supabase
        .from("task_group_items")
        .insert(
          items.map((item) => ({
            group_id: groupId,
            task: item.task,
            hashtag: item.hashtag,
            user_id: user.id,
          }))
        )
        .select()
    );
  },

  // GET ALL TASK GROUPS
  async getAll() {
    const user = await getAuthenticatedUser();

    // Check cache first
    const cached = cache.get(CACHE_CONFIG.TASK_GROUPS.key);
    if (cached) {
      return cached;
    }

    const data = handleSupabaseResponse(
      await supabase
        .from("task_groups")
        .select(
          `
          *,
          items:task_group_items(*)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    );

    // Cache the result
    cache.set(CACHE_CONFIG.TASK_GROUPS.key, data);
    return data;
  },

  // UPDATE TASK GROUP
  async update(id, name, description) {
    const user = await getAuthenticatedUser();
    return handleSupabaseResponse(
      await supabase
        .from("task_groups")
        .update({ name, description })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()
    );
  },

  // DELETE TASK GROUP
  async delete(id) {
    const user = await getAuthenticatedUser();
    return handleSupabaseResponse(
      await supabase
        .from("task_groups")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
    );
  },

  // UPDATE TASK GROUP ITEM
  async updateItem(itemId, task, hashtag) {
    const user = await getAuthenticatedUser();

    return handleSupabaseResponse(
      await supabase
        .from("task_group_items")
        .update({ task, hashtag })
        .eq("id", itemId)
        .eq("user_id", user.id)
        .select()
        .single()
    );
  },

  // DELETE TASK GROUP ITEM
  async deleteItem(itemId) {
    const user = await getAuthenticatedUser();
    return handleSupabaseResponse(
      await supabase
        .from("task_group_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user.id)
    );
  },

  // ADD TASK GROUP TO TODOS
  async addToTodos(groupId) {
    const user = await getAuthenticatedUser();

    const { data: items, error } = await supabase
      .from("task_group_items")
      .select("*")
      .eq("group_id", groupId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching task group items:", error);
      throw error;
    }

    if (!items || items.length === 0) {
      return;
    }

    try {
      // Create tasks one by one with user_id
      for (const item of items) {
        const { error: createError } = await supabase.from("todos").insert([
          {
            task: item.task,
            hashtag: item.hashtag || "",
            user_id: user.id,
            is_priority: false,
          },
        ]);

        if (createError) throw createError;
      }
    } catch (error) {
      console.error("Error adding tasks to todo list:", error);
      throw error;
    }
  },
};

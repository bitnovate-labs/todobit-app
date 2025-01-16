import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const TodoContext = createContext({});

export function TodoProvider({ children }) {
  const [todos, setTodos] = useState(() => {
    // Initialize from localStorage if available
    const cached = localStorage.getItem("todos");
    return cached ? JSON.parse(cached) : [];
  });

  const [taskGroups, setTaskGroups] = useState(() => {
    const cached = localStorage.getItem("taskGroups");
    return cached ? JSON.parse(cached) : [];
  });

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch todos
        const { data: todosData } = await supabase
          .from("todos")
          .select("*")
          .order("created_at", { ascending: false });

        if (todosData) {
          setTodos(todosData);
          localStorage.setItem("todos", JSON.stringify(todosData));
        }

        // Fetch task groups
        const { data: groupsData } = await supabase
          .from("task_groups")
          .select("*, items:task_group_items(*)")
          .order("created_at", { ascending: false });

        if (groupsData) {
          setTaskGroups(groupsData);
          localStorage.setItem("taskGroups", JSON.stringify(groupsData));
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("public:todos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          setTodos((currentTodos) => {
            let updatedTodos = [...currentTodos];

            if (payload.eventType === "INSERT") {
              updatedTodos = [payload.new, ...updatedTodos];
            } else if (payload.eventType === "DELETE") {
              updatedTodos = updatedTodos.filter(
                (todo) => todo.id !== payload.old.id
              );
            } else if (payload.eventType === "UPDATE") {
              updatedTodos = updatedTodos.map((todo) =>
                todo.id === payload.new.id ? payload.new : todo
              );
            }

            localStorage.setItem("todos", JSON.stringify(updatedTodos));
            return updatedTodos;
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Todo operations
  const addTodo = async (task, hashtag, isPriority = false) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([{ task, hashtag: hashtag || "", is_priority: isPriority }])
        .select()
        .single();

      if (error) throw error;

      const newTodos = [data, ...todos];
      setTodos(newTodos);
      localStorage.setItem("todos", JSON.stringify(newTodos));
      return data;
    } catch (error) {
      console.error("Error adding todo:", error);
      throw error;
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedTodos = todos.map((todo) => (todo.id === id ? data : todo));
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      return data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) throw error;

      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  };

  // Task group operations
  const addTaskGroup = async (name, description = "") => {
    try {
      const { data, error } = await supabase
        .from("task_groups")
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;

      const newGroups = [data, ...taskGroups];
      setTaskGroups(newGroups);
      localStorage.setItem("taskGroups", JSON.stringify(newGroups));
      return data;
    } catch (error) {
      console.error("Error adding task group:", error);
      throw error;
    }
  };

  // Statistics methods
  const getStatistics = () => {
    return todos.reduce((acc, todo) => {
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
  };

  const value = {
    // State
    todos,
    taskGroups,

    // Todo Operations
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete: async (id, isCompleted) => {
      return await updateTodo(id, {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      });
    },
    clearAllTodos: async () => {
      try {
        const { error } = await supabase
          .from("todos")
          .delete()
          .eq("is_completed", false);
        if (error) throw error;

        const updatedTodos = todos.filter((todo) => todo.is_completed);
        setTodos(updatedTodos);
        localStorage.setItem("todos", JSON.stringify(updatedTodos));
      } catch (error) {
        console.error("Error clearing todos:", error);
        throw error;
      }
    },
    clearCompletedTodos: async () => {
      try {
        await supabase.rpc("archive_completed_todos");
        const updatedTodos = todos.filter((todo) => !todo.is_completed);
        setTodos(updatedTodos);
        localStorage.setItem("todos", JSON.stringify(updatedTodos));
      } catch (error) {
        console.error("Error clearing completed todos:", error);
        throw error;
      }
    },

    // Todo Getters
    getCompletedTodos: () => todos.filter((todo) => todo.is_completed),
    getTodosByHashtag: (hashtag) =>
      todos.filter((todo) => todo.hashtag === hashtag),
    getStatistics,

    // Task Group Operations
    addTaskGroup,
    updateTaskGroup: async (id, name, description) => {
      try {
        const { data, error } = await supabase
          .from("task_groups")
          .update({ name, description })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        const updatedGroups = taskGroups.map((group) =>
          group.id === id ? data : group
        );
        setTaskGroups(updatedGroups);
        localStorage.setItem("taskGroups", JSON.stringify(updatedGroups));
        return data;
      } catch (error) {
        console.error("Error updating task group:", error);
        throw error;
      }
    },
    deleteTaskGroup: async (id) => {
      try {
        const { error } = await supabase
          .from("task_groups")
          .delete()
          .eq("id", id);

        if (error) throw error;

        const updatedGroups = taskGroups.filter((group) => group.id !== id);
        setTaskGroups(updatedGroups);
        localStorage.setItem("taskGroups", JSON.stringify(updatedGroups));
      } catch (error) {
        console.error("Error deleting task group:", error);
        throw error;
      }
    },

    // Task Group Items Operations
    addTaskGroupItem: async (groupId, task, hashtag) => {
      try {
        const { data, error } = await supabase
          .from("task_group_items")
          .insert([{ group_id: groupId, task, hashtag }])
          .select()
          .single();

        if (error) throw error;

        const updatedGroups = taskGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              items: [...(group.items || []), data],
            };
          }
          return group;
        });
        setTaskGroups(updatedGroups);
        localStorage.setItem("taskGroups", JSON.stringify(updatedGroups));
        return data;
      } catch (error) {
        console.error("Error adding task group item:", error);
        throw error;
      }
    },
    updateTaskGroupItem: async (itemId, task, hashtag) => {
      try {
        const { data, error } = await supabase
          .from("task_group_items")
          .update({ task, hashtag })
          .eq("id", itemId)
          .select()
          .single();

        if (error) throw error;

        const updatedGroups = taskGroups.map((group) => ({
          ...group,
          items: group.items?.map((item) => (item.id === itemId ? data : item)),
        }));
        setTaskGroups(updatedGroups);
        localStorage.setItem("taskGroups", JSON.stringify(updatedGroups));
        return data;
      } catch (error) {
        console.error("Error updating task group item:", error);
        throw error;
      }
    },
    deleteTaskGroupItem: async (itemId, groupId) => {
      try {
        const { error } = await supabase
          .from("task_group_items")
          .delete()
          .eq("id", itemId);

        if (error) throw error;

        const updatedGroups = taskGroups.map((group) => {
          if (group.id === groupId) {
            return {
              ...group,
              items: group.items?.filter((item) => item.id !== itemId),
            };
          }
          return group;
        });
        setTaskGroups(updatedGroups);
        localStorage.setItem("taskGroups", JSON.stringify(updatedGroups));
      } catch (error) {
        console.error("Error deleting task group item:", error);
        throw error;
      }
    },
    addGroupToTodos: async (groupId) => {
      try {
        const group = taskGroups.find((g) => g.id === groupId);
        if (!group?.items?.length) return;

        for (const item of group.items) {
          await addTodo(item.task, item.hashtag);
        }
      } catch (error) {
        console.error("Error adding group to todos:", error);
        throw error;
      }
    },
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

// Custom hook to use the todo context
export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};

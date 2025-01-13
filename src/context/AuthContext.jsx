import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Spin, message } from "antd";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshUser = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Check if this is a new user (sign up)
      if (
        _event === "SIGNED_IN" &&
        session?.user?.created_at === session?.user?.last_sign_in_at
      ) {
        // Clear any existing completed tasks for the new user
        clearCompletedTasks(session.user.id).catch(console.error);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearCompletedTasks = async (userId) => {
    try {
      const { error } = await supabase.rpc("clear_user_completed_todos", {
        user_id_param: userId,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      message.error("Failed to initialize user data");
    }
  };

  useEffect(() => {
    const refreshUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    if (refreshTrigger > 0) {
      refreshUserData();
    }
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

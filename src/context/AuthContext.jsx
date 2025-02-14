import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Spin, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshUser = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    // Check active sessions (auth state) and sets the user
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   setUser(session?.user ?? null);
    //   if (!session?.user) {
    //     // Only redirect to /login if not already there
    //     if (
    //       location.pathname !== "/login" &&
    //       location.pathname !== "/welcome"
    //     ) {
    //       navigate("/login");
    //     }
    //   }
    // });
    // setLoading(false);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange((_event, session) => {
    //   setUser(session?.user ?? null);
    //   if (!session?.user) {
    //     // Only redirect to /login if not already there
    //     if (
    //       location.pathname !== "/login" &&
    //       location.pathname !== "/welcome"
    //     ) {
    //       navigate("/login");
    //     }
    //   }

    //   // Check if this is a new user (sign up)
    //   if (
    //     _event === "SIGNED_IN" &&
    //     session?.user?.created_at === session?.user?.last_sign_in_at
    //   ) {
    //     // Clear any existing completed tasks for the new user
    //     clearCompletedTasks(session.user.id).catch(console.error);
    //   }
    // });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // SIGN UP
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // CLEAR COMPLETED TASKS
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

  const value = {
    signUp,
    user,
    loading,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};

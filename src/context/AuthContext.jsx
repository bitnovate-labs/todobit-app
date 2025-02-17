import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Spin, message } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  const refreshUser = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const type = searchParams.get("type");
    const accessToken = searchParams.get("access_token");
    const isRecovery =
      (type === "recovery" || type === "passwordRecovery") && !!accessToken;
    setIsPasswordReset(isRecovery);

    // Check active sessions and handle auth state
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isRecovery) {
          navigate("/reset-password");
          setUser(session?.user ?? null);
          return;
        }

        setUser(session?.user ?? null);

        if (
          !session?.user &&
          !isRecovery &&
          location.pathname === "/reset-password"
        ) {
          navigate("/login");
          return;
        }

        // Only redirect to home if user is logged in and not in password reset flow
        if (session?.user && !isRecovery && location.pathname === "/login") {
          navigate("/");
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Handle password reset
      if (
        _event === "PASSWORD_RECOVERY" ||
        (_event === "SIGNED_IN" && isPasswordReset)
      ) {
        navigate("/reset-password");
        return;
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, searchParams, isPasswordReset]);

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

import { useState, useEffect } from "react";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

function ResetPassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const initializeReset = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          const errorCode = searchParams.get("error_code");
          const errorDescription = searchParams.get("error_description");

          if (errorCode === "otp_expired") {
            setError(
              "The password reset link has expired. Please request a new one."
            );
          } else {
            setError(errorDescription || "Invalid or expired reset link");
          }
          return;
        }

        setSession(session);
      } catch (error) {
        console.error("Reset initialization error:", error);
        setError("An error occurred while processing your request");
      }
    };

    initializeReset();
  }, [searchParams]);

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          isDarkMode ? "bg-gray" : "bg-gray-50"
        }`}
      >
        <div
          className={`max-w-md w-full space-y-8 p-8 rounded-2xl shadow-lg ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="text-center">
            <Title level={2}>
              <span
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Password Reset Error
              </span>
            </Title>
            <Text
              className={`block mt-4 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {error}
            </Text>
            <Button
              type="primary"
              onClick={() => navigate("/login")}
              className="mt-8"
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!session && !error) {
    return <Navigate to="/login" replace />;
  }

  const handlePasswordReset = async (values) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      message.success("Password updated successfully");
      navigate("/login");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        isDarkMode ? "bg-gray" : "bg-gray-50"
      }`}
    >
      <div
        className={`max-w-md w-full space-y-8 p-8 rounded-2xl shadow-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="text-center">
          <Title level={2}>
            <span
              className={`text-2xl font-bold ${
                isDarkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              Reset Password
            </span>
          </Title>
          <Text
            className={`block mt-2 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Enter your new password below
          </Text>
        </div>

        <Form
          name="reset-password"
          onFinish={handlePasswordReset}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ResetPassword;

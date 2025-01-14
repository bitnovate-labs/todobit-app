import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import login_image from "../assets/login_img.png";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();

  // HANDLE LOGIN
  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      navigate("/");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-dvh overflow-hidden grid grid-rows-2 ${
        isDarkMode
          ? "bg-gray"
          : "bg-gradient-to-b from-blue-700 via-blue-200 to-white"
      }`}
    >
      <div className="m-auto">
        <img src={login_image} alt="login image" className="opacity-70 px-20" />
      </div>
      <div
        className={`max-w-md w-screen space-y-4 rounded-t-3xl p-8 ${
          isDarkMode
            ? "bg-gradient-to-b from-blue-700 via-blue-500 via-50% to-white"
            : "bg-white"
        }`}
      >
        <div className="text-center mt-6">
          <Title level={2}>
            <span
              className={`text-3xl font-black ${
                isDarkMode ? "text-gray-100" : "text-gray-700 "
              }`}
            >
              Welcome Back
            </span>
          </Title>
          <Text
            className={`${isDarkMode ? "text-gray-100" : "text-gray-600 "}`}
          >
            Sign in to continue to Dobit
          </Text>
        </div>

        <Form
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="text-lg w-full"
              size="large"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-blue-600">
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Login;

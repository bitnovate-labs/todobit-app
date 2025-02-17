import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import reg_image from "../assets/reg_img.png";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const safeAreaTop = "env(safe-area-inset-top)";
  const { isDarkMode } = useTheme();

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) throw error;

      message.success("Registration successful! Please sign in.");
      navigate("/login");
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`h-screen overflow-hidden grid grid-rows-3 justify-center ${
        isDarkMode
          ? "bg-gray"
          : "bg-gradient-to-b from-blue-700 via-blue-200 via-40% to-white"
      }`}
      style={{ paddingTop: safeAreaTop }}
    >
      <div className="m-auto">
        <img
          src={reg_image}
          alt="register welcome"
          className="opacity-70 px-20"
        />
      </div>
      <div
        className={`max-w-md h-dvh space-y-6 rounded-t-3xl p-8 ${
          isDarkMode
            ? "bg-gradient-to-b from-blue-700 via-blue-500 via-50% to-white"
            : "bg-white"
        }`}
      >
        <div className="flex flex-col text-center mt-4">
          <span
            className={`text-3xl font-black ${
              isDarkMode ? "text-gray-100" : "text-gray-700 "
            }`}
          >
            Create Account
          </span>
          <Text
            className={`my-2 ${
              isDarkMode ? "text-gray-100" : "text-gray-600 "
            }`}
          >
            Get started with Dobit
          </Text>
        </div>

        <Form
          name="register"
          onFinish={handleRegister}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
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
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Register;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, message, Modal } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import login_image from "../assets/login_img.png";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
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

  // HANDLE PASSWORD RESET
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      message.error("Please enter your email address");
      return;
    }

    try {
      setResetLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
      });

      if (error) throw error;

      message.success("Password reset instructions sent to your email");
      setResetModalVisible(false);
      setResetEmail("");
    } catch (error) {
      message.error(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className={`h-screen overflow-hidden grid grid-rows-3 justify-center ${
        isDarkMode
          ? "bg-gray"
          : "bg-gradient-to-b from-blue-700 via-blue-200 to-white"
      }`}
    >
      <div className="m-auto">
        <img src={login_image} alt="login image" className="opacity-70 px-20" />
      </div>
      <div
        className={`max-w-md h-dvh space-y-6 rounded-t-3xl p-8 ${
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

          {/* FORGOT PASSWORD */}
          <div className="text-right mb-4">
            <Button
              type="link"
              onClick={() => setResetModalVisible(true)}
              className={`p-0 ${
                isDarkMode ? "text-gray-300" : "text-blue-600"
              }`}
            >
              Forgot Password?
            </Button>
          </div>

          {/* SIGN IN BUTTON */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={`text-lg w-full ${
                isDarkMode ? "border-white bg-blue-500" : "border-none"
              }`}
              size="large"
              loading={loading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* SIGN UP BUTTON */}
        <div className="text-center">
          <Text
            className={` ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Don&apos;t have an account?{" "}
            <Link to="/register">
              <span
                className={`${isDarkMode ? "text-gray-300" : "text-blue-600"}`}
              >
                Sign up
              </span>
            </Link>
          </Text>
        </div>
      </div>

      {/* PASSWORD RESET MODAL */}
      <Modal
        title="Reset Password"
        open={resetModalVisible}
        onOk={handlePasswordReset}
        onCancel={() => {
          setResetModalVisible(false);
          setResetEmail("");
        }}
        confirmLoading={resetLoading}
      >
        <div className="space-y-4">
          <p>
            Enter your email address to receive password reset instructions.
          </p>
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Login;

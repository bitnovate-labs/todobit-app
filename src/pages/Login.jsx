import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import login_image from "../assets/login_img.png";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white grid grid-rows-3">
      <div className="m-auto">
        <img src={login_image} alt="login image" className="opacity-70 px-20" />
      </div>
      <div className="max-w-md w-screen space-y-8 bg-white p-8">
        <div className="text-center mt-6">
          <Title level={2}>Welcome Back</Title>
          <Text className="text-gray-600">Sign in to continue to Go Task</Text>
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
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}

export default Login;

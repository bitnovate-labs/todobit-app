import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { supabase } from "../lib/supabase";
import reg_image from "../assets/reg_img.png";

const { Title, Text } = Typography;

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white grid grid-rows-3">
      <div className="m-auto">
        <img
          src={reg_image}
          alt="register welcome"
          className="opacity-70 px-20"
        />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white p-8">
        <div className="text-center mt-6">
          <Title level={2}>Create Account</Title>
          <Text className="text-gray-600">Get started with Dobit</Text>
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

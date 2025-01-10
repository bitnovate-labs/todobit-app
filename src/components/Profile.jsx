import { useState } from "react";
import {
  Card,
  Avatar,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  EditOutlined,
  LockOutlined,
  SettingOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MobileHeader from "./MobileHeader";

const { Text } = Typography;

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      message.error(`Error logging out: ${error.message}`);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: { name: values.name },
      });

      if (error) throw error;

      message.success("Profile updated successfully");
      setEditModalVisible(false);
    } catch (error) {
      message.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (error) throw error;

      message.success("Password changed successfully");
      setPasswordModalVisible(false);
    } catch (error) {
      message.error(`Failed to change password: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-0 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Profile</h2>
      </div>
      <MobileHeader title="Profile" />

      <Card className="shadow-sm pt-24 bg-transparent">
        <div className="flex flex-col items-center space-y-4">
          <Avatar size={130} src={user?.user_metadata?.avatar_url}>
            {user?.user_metadata?.name?.[0] || user?.email?.[0]}
          </Avatar>
          <Text className="text-xl font-semibold">
            {user?.user_metadata?.name || "User"}
          </Text>
          <Text type="secondary">{user?.email}</Text>
        </div>
      </Card>

      <div className="space-y-2">
        {/* EDIT PROFILE BUTTON */}
        <Button
          block
          onClick={() => setEditModalVisible(true)}
          className="text-left h-14 flex items-center justify-between rounded-2xl border-none shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <EditOutlined className="text-teal-600" />
            </div>
            <span className="text-base">Edit Profile</span>
          </div>
          <RightOutlined className="text-gray-400" />
        </Button>

        {/* CHANGE PASSWORD BUTTON */}
        <Button
          block
          onClick={() => setPasswordModalVisible(true)}
          className="text-left h-14 flex items-center justify-between rounded-2xl border-none shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <LockOutlined className="text-green-600" />
            </div>
            <span className="text-base">Change Password</span>
          </div>
          <RightOutlined className="text-gray-400" />
        </Button>

        {/* SETTINGS BUTTON */}
        <Button
          block
          onClick={() => navigate("/settings")}
          className="text-left h-14 flex items-center justify-between rounded-2xl border-none shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <SettingOutlined className="text-blue-600" />
            </div>
            <span className="text-base">Settings</span>
          </div>
          <RightOutlined className="text-gray-400" />
        </Button>

        {/* LOGOUT BUTTON */}
        <Button
          block
          onClick={handleLogout}
          className="text-left h-14 flex items-center justify-between rounded-2xl border-none shadow-md"
          danger
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <LogoutOutlined className="text-red-600" />
            </div>
            <span className="text-base">Logout</span>
          </div>
          <RightOutlined className="text-gray-400" />
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          onFinish={handleUpdateProfile}
          initialValues={{ name: user?.user_metadata?.name }}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleChangePassword} layout="vertical">
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: "Please input your new password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Profile;

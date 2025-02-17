import {
  Layout,
  Input,
  Dropdown,
  Avatar,
  Button,
  Modal,
  Form,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { EditOutlined, LogoutOutlined, LockOutlined } from "@ant-design/icons";

function DesktopHeader() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        message.error("Please upload an image file");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        message.error("Image size should be less than 2MB");
        return;
      }

      setLoading(true);

      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().getTime();
      const filePath = `${user.id}/avatar-${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      message.success("Profile picture updated successfully");
      refreshUser();
    } catch (error) {
      message.error(`Error updating profile picture: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login", { replace: true });
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
      refreshUser();
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

  const items = [
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit Profile",
      onClick: () => setEditModalVisible(true),
    },
    {
      key: "password",
      icon: <LockOutlined />,
      label: "Change Password",
      onClick: () => setPasswordModalVisible(true),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout.Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <Input
        prefix={<SearchOutlined className="text-gray-400" />}
        placeholder="Search tasks..."
        className="max-w-md"
      />
      <div className="flex items-center gap-4">
        <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
          <div className="cursor-pointer flex items-center gap-3">
            <span className="text-gray-600">
              {user?.user_metadata?.name || user?.email}
            </span>
            <Avatar
              size={40}
              src={user?.user_metadata?.avatar_url}
              className="cursor-pointer"
              onClick={handleUploadClick}
            >
              {user?.user_metadata?.name?.[0] || user?.email?.[0]}
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </Dropdown>
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
    </Layout.Header>
  );
}

export default DesktopHeader;

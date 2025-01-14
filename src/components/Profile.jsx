import { useRef, useState } from "react";
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
  CameraOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import MobileHeader from "./MobileHeader";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;

function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { isDarkMode } = useTheme(); // Access theme context

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    try {
      const file = event.target.files?.[0]; // Get the selected file
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        message.error("Please upload an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        message.error("Image size should be less than 2MB");
        return;
      }

      setLoading(true);

      // Create a unique filename using timestamp
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().getTime();
      const filePath = `${user.id}/avatar-${timestamp}.${fileExt}`;

      // Upload file to Supabase Storage (using SDK Client)
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // After successful upload, clean up old avatars
      try {
        const { data: existingFiles } = await supabase.storage
          .from("avatars")
          .list(user.id);

        const oldFiles = existingFiles?.filter(
          (f) => f.name !== `avatar-${timestamp}.${fileExt}`
        );
        if (oldFiles?.length > 0) {
          await supabase.storage
            .from("avatars")
            .remove(oldFiles.map((f) => `${user.id}/${f.name}`));
        }
      } catch (cleanupError) {
        console.error("Error cleaning up old avatars:", cleanupError);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user metadata with the new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      message.success("Profile picture updated successfully");
      refreshUser(); // Refresh user data to update the avatar
    } catch (error) {
      message.error(`Error updating profile picture: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Navigate to login page after successful logout
      navigate("/login", { replace: true }); // Add replace: true to prevent going back
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

      <Card
        className={`shadow-sm pt-24 bg-transparent ${
          isDarkMode ? "border-none" : ""
        }`}
      >
        <div className="flex flex-col items-center space-y-4 mb-8">
          <div className="relative">
            <Avatar
              size={100}
              src={user?.user_metadata?.avatar_url}
              className="cursor-pointer border-2 border-transparent group-hover:border-blue-500 transition-all"
              onClick={handleUploadClick}
            >
              {user?.user_metadata?.name?.[0] || user?.email?.[0]}
            </Avatar>
            <div
              className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={handleUploadClick}
            >
              <CameraOutlined className="text-white text-xl" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
          <Text className="text-2xl font-bold">
            {user?.user_metadata?.name || "User"}
          </Text>
          <Text type="secondary">{user?.email}</Text>
        </div>
      </Card>

      {/* BUTTONS */}
      <div className={`space-y-2`}>
        {/* EDIT PROFILE BUTTON */}
        <Button
          block
          onClick={() => setEditModalVisible(true)}
          className={`text-left h-14 flex items-center justify-between rounded-2xl shadow-md ${
            isDarkMode ? "bg-gray" : "bg-white border-none"
          }`}
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
          className={`text-left h-14 flex items-center justify-between rounded-2xl shadow-md ${
            isDarkMode ? "bg-gray" : "bg-white border-none"
          }`}
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
          className={`text-left h-14 flex items-center justify-between rounded-2xl shadow-md ${
            isDarkMode ? "bg-gray" : "bg-white border-none"
          }`}
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
          className={`text-left h-14 flex items-center justify-between rounded-2xl shadow-md ${
            isDarkMode ? "bg-gray text-red-500 " : "bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <LogoutOutlined className="text-red-600" />
            </div>
            <span className="text-base">Logout</span>
          </div>
          {/* <RightOutlined className="text-gray-400" /> */}
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

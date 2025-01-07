import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal, Input, Select, Button } from "antd";
import {
  PlusOutlined,
  HomeOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { todoApi } from "../lib/supabase";

function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [category, setCategory] = useState("");

  const handleAddTask = async () => {
    try {
      await todoApi.create(newTask, category);
      // Reset form
      setNewTask("");
      setCategory("");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
    setIsModalVisible(false);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-20 flex items-center justify-around px-4 md:hidden">
        <Button
          type={location.pathname === "/" ? "primary" : "text"}
          icon={<HomeOutlined />}
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-12 h-12"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
          style={{ width: "48px", height: "48px" }}
          className="flex items-center justify-center"
        />
        <Button
          type={location.pathname === "/stats" ? "primary" : "text"}
          icon={<BarChartOutlined />}
          onClick={() => navigate("/stats")}
          className="flex items-center justify-center w-12 h-12"
        />
      </div>

      <Modal
        title="Add New Task"
        open={isModalVisible}
        className="max-w-sm mx-auto"
        onOk={handleAddTask}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Enter task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="mb-4"
        />
        <Select
          className="w-full"
          placeholder="Select category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "work", label: "#work" },
            { value: "personal", label: "#personal" },
            { value: "health", label: "#health" },
          ]}
        />
      </Modal>
    </>
  );
}

export default MobileNavigation;

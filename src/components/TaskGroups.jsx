import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  Form,
  Empty,
  List,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { taskGroupsApi } from "../lib/supabase";
import MobileHeader from "./MobileHeader";

const { Text } = Typography;

function TaskGroups() {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await taskGroupsApi.getAll();
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateGroup = async (values) => {
    try {
      const group = await taskGroupsApi.create(values.name, values.description);
      if (values.tasks) {
        const tasks = values.tasks.map((task) => ({
          task: task.task,
          hashtag: task.hashtag,
        }));
        await taskGroupsApi.addItems(group.id, tasks);
      }
      form.resetFields();
      setIsModalVisible(false);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleAddToTodos = async (groupId) => {
    try {
      await taskGroupsApi.addToTodos(groupId);
      Modal.success({
        title: "Tasks Added",
        content: "All tasks from this group have been added to your todo list.",
      });
    } catch (error) {
      console.error("Error adding tasks:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0">
      <div className="hidden md:flex items-center justify-between h-14">
        <h2 className="text-lg font-semibold">Task Groups</h2>
      </div>
      <div className="md:hidden flex items-center justify-between">
        <div className="flex-1">
          <MobileHeader title="Task Groups" />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="ml-4"
        >
          Create
        </Button>
      </div>

      {groups.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1 }}
          dataSource={groups}
          renderItem={(group) => (
            <List.Item>
              <Card
                title={group.name}
                extra={
                  <Button
                    size="small"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleAddToTodos(group.id)}
                  >
                    Add
                  </Button>
                }
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                {group.description && (
                  <Text type="secondary" className="block mb-4">
                    {group.description}
                  </Text>
                )}
                <List
                  size="small"
                  dataSource={group.items}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item.task}</Text>
                      {item.hashtag && <Tag color="blue">#{item.hashtag}</Tag>}
                    </List.Item>
                  )}
                />
              </Card>
            </List.Item>
          )}
        />
      ) : (
        <Empty
          description="No task groups yet"
          className="bg-white p-8 rounded-lg shadow-sm"
        />
      )}

      <Modal
        title="Create Task Group"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleCreateGroup} layout="vertical">
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: "Please enter a group name" }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.List name="tasks">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key} className="flex gap-2">
                    <Form.Item
                      {...field}
                      label={index === 0 ? "Tasks" : ""}
                      name={[field.name, "task"]}
                      rules={[{ required: true, message: "Task is required" }]}
                      className="flex-1"
                    >
                      <Input placeholder="Enter task" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={index === 0 ? "Category" : ""}
                      name={[field.name, "hashtag"]}
                    >
                      <Input placeholder="Category (optional)" />
                    </Form.Item>
                    <Button
                      type="text"
                      onClick={() => remove(field.name)}
                      className="mt-8"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    block
                  >
                    Add Task
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

export default TaskGroups;

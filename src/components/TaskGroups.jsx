import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Input,
  Form,
  Empty,
  List,
  Tag,
  Typography,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  PlayCircleOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { taskGroupsApi } from "../lib/supabase";
import MobileHeader from "./MobileHeader";

const { Text } = Typography;

function TaskGroups() {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();

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
      if (editingGroup) {
        await taskGroupsApi.update(
          editingGroup.id,
          values.name,
          values.description
        );
      } else {
        const group = await taskGroupsApi.create(
          values.name,
          values.description
        );
        if (values.tasks) {
          const tasks = values.tasks.map((task) => ({
            task: task.task,
            hashtag: task.hashtag,
          }));
          await taskGroupsApi.addItems(group.id, tasks);
        }
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleEdit = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await taskGroupsApi.delete(groupToDelete.id);
      setDeleteModalVisible(false);
      setGroupToDelete(null);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
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

  const handleEditItem = async (values) => {
    try {
      await taskGroupsApi.updateItem(
        editingItem.id,
        values.task,
        values.hashtag
      );
      setItemModalVisible(false);
      setEditingItem(null);
      itemForm.resetFields();
      fetchGroups();
    } catch (error) {
      console.error("Error updating task item:", error);
    }
  };

  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await taskGroupsApi.deleteItem(itemId);
      fetchGroups();
    } catch (error) {
      console.error("Error deleting task item:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 pt-20">
      {/* CREATE TASK GROUP BUTTON */}
      <div className="fixed top-[4.5rem] left-0 right-0 bg-white z-10 md:hidden flex items-center justify-center py-4">
        <div className="flex-1">
          <MobileHeader title="Task Groups" />
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          className="mx-20 w-full rounded-2xl"
        >
          Create
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="pt-[30px]">
          {groups.map((group) => (
            <Collapse
              key={group.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-md transition-shadow border-none overflow-hidden mb-2"
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  className="text-gray-400"
                />
              )}
            >
              <Collapse.Panel
                key="1"
                header={
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <Text strong className="text-lg">
                        {group.name}
                      </Text>
                      {group.description && (
                        <Text type="secondary" className="block text-sm">
                          {group.description}
                        </Text>
                      )}
                    </div>
                    <Button
                      size="small"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToTodos(group.id);
                      }}
                      className="p-4 rounded-2xl"
                    >
                      Add
                    </Button>
                  </div>
                }
              >
                <div className="flex justify-end items-center gap-2">
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => handleEdit(group, e)}
                    className="text-gray-400"
                  >
                    Edit Group
                  </Button>
                  <Button
                    size="small"
                    type="danger"
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group);
                      setDeleteModalVisible(true);
                    }}
                    className="text-red-400 hover:text-red-500"
                  >
                    Delete Group
                  </Button>
                </div>
                <List
                  size="small"
                  dataSource={group.items}
                  renderItem={(item) => (
                    <List.Item
                      className="px-4"
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                            itemForm.setFieldsValue({
                              task: item.task,
                              hashtag: item.hashtag,
                            });
                            setItemModalVisible(true);
                          }}
                          className="text-gray-400 hover:text-blue-500"
                        />,
                        <Button
                          key="delete"
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="text-red-400 hover:text-red-500"
                        />,
                      ]}
                    >
                      <div className="flex flex-col ">
                        <Text>{item.task}</Text>
                        {item.hashtag && (
                          <div>
                            <Tag color="blue">#{item.hashtag}</Tag>
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
            </Collapse>
          ))}
        </div>
      ) : (
        <Empty
          description="No task groups yet"
          className="bg-white p-8 rounded-2xl shadow-md"
        />
      )}

      <Modal
        title={editingGroup ? "Edit Task Group" : "Create Task Group"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGroup(null);
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
            {!editingGroup
              ? (fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={field.key} className="flex gap-2">
                        <Form.Item
                          {...field}
                          label={index === 0 ? "Tasks" : ""}
                          name={[field.name, "task"]}
                          rules={[
                            { required: true, message: "Task is required" },
                          ]}
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
                )
              : () => null}
          </Form.List>
        </Form>
      </Modal>

      <Modal
        title="Delete Task Group"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setGroupToDelete(null);
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete this task group? This action cannot be
          undone.
        </p>
      </Modal>

      <Modal
        title="Edit Task"
        open={itemModalVisible}
        onOk={() => itemForm.submit()}
        onCancel={() => {
          setItemModalVisible(false);
          setEditingItem(null);
          itemForm.resetFields();
        }}
      >
        <Form form={itemForm} onFinish={handleEditItem} layout="vertical">
          <Form.Item
            name="task"
            label="Task"
            rules={[{ required: true, message: "Please enter a task" }]}
          >
            <Input placeholder="Enter task" />
          </Form.Item>

          <Form.Item name="hashtag" label="Category">
            <Input placeholder="Category (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default TaskGroups;

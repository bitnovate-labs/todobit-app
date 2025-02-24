import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Modal,
  Input,
  Form,
  List,
  //   Tag,
  Typography,
  Collapse,
  Divider,
  Empty,
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleRight,
  faCirclePlay,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { taskGroupsApi } from "../lib/supabase";
import MobileHeader from "./MobileHeader";
// import EmptyGroup from "./EmptyGroup";
import BlankClipboard from "../assets/emptygroup.png";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;

function TaskGroups() {
  const [groups, setGroups] = useState([]);
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [newTaskModalVisible, setNewTaskModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [newTaskForm] = Form.useForm();
  const { isDarkMode } = useTheme(); // Access theme context

  // Add task group mutation
  const addTaskGroupMutation = useMutation({
    mutationFn: async ({ name, description, tasks }) => {
      const group = await taskGroupsApi.create(name, description);
      if (tasks?.length) {
        await taskGroupsApi.addItems(group.id, tasks);
      }
      return group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
    },
  });

  // Add items mutation
  const addItemsMutation = useMutation({
    mutationFn: async ({ groupId, items }) => {
      return await taskGroupsApi.addItems(groupId, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
    },
  });

  // Add to todos mutation
  const addTodosMutation = useMutation({
    mutationFn: async (groupId) => {
      return await taskGroupsApi.addToTodos(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      Modal.success({
        title: "Tasks Added",
        content: "All tasks from this group have been added to your todo list.",
      });
    },
  });

  // Query task groups
  const { data: groupsData } = useQuery({
    queryKey: ["taskGroups"],
    queryFn: taskGroupsApi.getAll,
    initialData: () => {
      const cached = localStorage.getItem("task_groups_cache");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 15 * 60 * 1000) {
          // 15 minutes
          return data;
        }
      }
      return undefined;
    },
  });

  // FETCH GROUPS
  // useEffect(() => {
  //   fetchGroups();
  // }, []);

  useEffect(() => {
    if (groupsData) {
      setGroups(groupsData);
    }
  }, [groupsData]);

  // const fetchGroups = async () => {
  //   try {
  //     const data = await taskGroupsApi.getAll();
  //     setGroups(data || []);
  //   } catch (error) {
  //     console.error("Error fetching groups:", error);
  //   }
  // };

  // HANDLE CREATE GROUP
  // const handleCreateGroup = async (values) => {
  //   try {
  //     if (editingGroup) {
  //       const updatedGroup = await taskGroupsApi.update(
  //         editingGroup.id,
  //         values.name,
  //         values.description
  //       );
  //       queryClient.setQueryData(["taskGroups"], (old) =>
  //         old?.map((group) =>
  //           group.id === updatedGroup.id ? updatedGroup : group
  //         )
  //       );
  //     } else {
  //       const group = await taskGroupsApi.create(
  //         values.name,
  //         values.description
  //       );
  //       if (values.tasks) {
  //         const tasks = values.tasks.map((task) => ({
  //           task: task.task,
  //           hashtag: task.hashtag,
  //         }));
  //         await taskGroupsApi.addItems(group.id, tasks);
  //       }
  //     }
  //     form.resetFields();
  //     setIsModalVisible(false);
  //     setEditingGroup(null);
  //     queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
  //     // fetchGroups();
  //   } catch (error) {
  //     console.error("Error creating group:", error);
  //   }
  // };

  // HANDLE CREATE GROUP
  const handleCreateGroup = async (values) => {
    try {
      await addTaskGroupMutation.mutateAsync({
        name: values.name,
        description: values.description,
        tasks: values.tasks?.map((task) => ({
          task: task.task,
          hashtag: task.hashtag,
        })),
      });

      form.resetFields();
      setIsModalVisible(false);
      setEditingGroup(null);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  // HANDLE EDIT
  const handleEdit = (group, e) => {
    e.stopPropagation();
    setEditingGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setIsModalVisible(true);
  };

  // HANDLE DELETE
  const handleDelete = async () => {
    try {
      await taskGroupsApi.delete(groupToDelete.id);
      queryClient.setQueryData(["taskGroups"], (old) =>
        old?.filter((group) => group.id !== groupToDelete.id)
      );
      setDeleteModalVisible(false);
      setGroupToDelete(null);
      // fetchGroups();
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  // HANDLE ADD TODOS
  const handleAddToTodos = async (groupId) => {
    try {
      // await taskGroupsApi.addToTodos(groupId);
      await addTodosMutation.mutateAsync(groupId);
      Modal.success({
        title: "Tasks Added",
        content: "All tasks from this group have been added to your todo list.",
      });
    } catch (error) {
      console.error("Error adding tasks:", error);
    }
  };

  // HANDLE EDIT ITEMS
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
      queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
      // fetchGroups();
    } catch (error) {
      console.error("Error updating task item:", error);
    }
  };

  // HANDLE DELETE ITEMS
  const handleDeleteItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await taskGroupsApi.deleteItem(itemId);
      queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
      // fetchGroups();
    } catch (error) {
      console.error("Error deleting task item:", error);
    }
  };

  //   HANDLE ADD TASK TO GROUP
  // const handleAddTaskToGroup = async (values) => {
  //   try {
  //     await taskGroupsApi.addItems(editingGroup.id, [
  //       {
  //         task: values.task,
  //         hashtag: values.hashtag,
  //       },
  //     ]);
  //     newTaskForm.resetFields();
  //     setNewTaskModalVisible(false); // close the modal
  //     setEditingGroup(null); // reset the editing group
  //     queryClient.invalidateQueries({ queryKey: ["taskGroups"] });
  //     // fetchGroups();
  //   } catch (error) {
  //     console.error("Error adding task to group:", error);
  //   }
  // };
  const handleAddTaskToGroup = async (values) => {
    try {
      await addItemsMutation.mutateAsync({
        groupId: editingGroup.id,
        items: [
          {
            task: values.task,
            hashtag: values.hashtag,
          },
        ],
      });

      newTaskForm.resetFields();
      setNewTaskModalVisible(false); // close the modal
      setEditingGroup(null); // reset the editing group
    } catch (error) {
      console.error("Error adding task to group:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0 pt-14">
      {/* MOBILE HEADER */}
      <MobileHeader title="Task Groups" />
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-between h-14">
        <h2 className="text-lg font-semibold">Task Groups</h2>
      </div>
      {/* CREATE TASK GROUP BUTTON */}
      <div className="fixed top-[2.5rem] left-0 right-0 z-10 md:hidden flex items-center justify-center py-4">
        <Button
          type="primary"
          //   icon={<PlusOutlined />}
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={(e) => {
            e.stopPropagation();
            setIsModalVisible(true);
          }}
          className="mx-20 w-1/2 rounded-2xl"
        >
          Create
        </Button>
      </div>

      {groups.length > 0 ? (
        <div className="pt-[30px]">
          {groups.map((group) => (
            <Collapse
              key={group.id}
              className={`rounded-2xl shadow-md hover:shadow-md transition-shadow overflow-hidden mb-2 ${
                isDarkMode
                  ? "bg-gray border border-gray-800"
                  : "bg-white border-none"
              }`}
              expandIcon={({ isActive }) => (
                <FontAwesomeIcon
                  icon={faAngleRight}
                  style={{
                    fontSize: "15px",
                    color: "#808080",
                    marginTop: "10px",
                    transition: "transform 0.3s",
                    transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              )}
            >
              <Collapse.Panel
                key="1"
                header={
                  <div className="flex items-center justify-between w-full">
                    <div>
                      {/* TASK GROUP TITLE */}
                      <Text strong className="text-base">
                        {group.name}
                      </Text>
                      {/* TASK GROUP DESCRIPTION */}
                      {group.description && (
                        <Text type="secondary" className="block text-sm mr-2">
                          {group.description}
                        </Text>
                      )}
                    </div>
                    {/* ADD TO TODOS BUTTON */}
                    <Button
                      size="small"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faCirclePlay} />}
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
                <div className="flex justify-evenly items-center gap-2 mb-2">
                  {/* ADD TASK TO EXISTING TASK GROUP */}
                  <Button
                    size="small"
                    type="default"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                      newTaskForm.resetFields();
                      setNewTaskModalVisible(true);
                    }}
                    className="text-xs font-bold text-green-500 px-2 border-green-500"
                  >
                    Add Task
                  </Button>
                  {/* EDIT EXISTING TASK GROUP */}
                  <Button
                    size="small"
                    type="default"
                    icon={<FontAwesomeIcon icon={faPenToSquare} />}
                    onClick={(e) => handleEdit(group, e)}
                    className="text-xs font-bold text-gray-400 px-2"
                  >
                    Edit Group
                  </Button>
                  {/* DELETE ENTIRE TASK GROUP */}
                  <Button
                    size="small"
                    type="default"
                    icon={<FontAwesomeIcon icon={faTrashCan} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupToDelete(group);
                      setDeleteModalVisible(true);
                    }}
                    className="text-xs font-bold text-red-400 border-red-400"
                  >
                    Delete Group
                  </Button>
                </div>
                {/* LISTS COMPONENT */}
                <List
                  size="small"
                  dataSource={group.items}
                  renderItem={(item) => (
                    <List.Item
                      className="px-4"
                      actions={[
                        // LIST EDIT BUTTON
                        <Button
                          key="edit"
                          type="text"
                          size="small"
                          icon={<FontAwesomeIcon icon={faPenToSquare} />}
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
                        // LIST DELETE BUTTON
                        <Button
                          key="delete"
                          type="text"
                          size="small"
                          icon={<FontAwesomeIcon icon={faTrashCan} />}
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="text-red-400 hover:text-red-500"
                        />,
                      ]}
                    >
                      <div className="flex flex-col flex-1">
                        <Text>{item.task}</Text>
                        {/* LIST HASHTAGS - CODE FOR FUTURE USE */}
                        {/* {item.hashtag && (
                          <div>
                            <Tag color="blue">#{item.hashtag}</Tag>
                          </div>
                        )} */}
                      </div>
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
            </Collapse>
          ))}
        </div>
      ) : (
        // <EmptyGroup /> // CODE FOR FUTURE USE (TOO LAGGY)
        <Empty
          // image={Empty.PRESENTED_IMAGE_SIMPLE}
          image={BlankClipboard}
          styles={{
            image: {
              height: 300,
              margin: "0 100px",
            },
          }}
          className="opacity-60"
          description={
            <Typography.Text>
              <span
                className={`${isDarkMode ? "text-gray-400" : "text-black"}`}
              >
                No task groups created yet
              </span>
            </Typography.Text>
          }
        />
      )}

      {/* MODAL EDIT TASK GROUP / CREATE TASK GROUP */}
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
                      <div key={field.key} className="flex flex-col">
                        {/* TASK INPUT */}
                        <Form.Item
                          {...field}
                          label={index === 0 ? "Tasks" : ""}
                          name={[field.name, "task"]}
                          rules={[
                            { required: true, message: "Task is required" },
                          ]}
                          className="mb-2"
                        >
                          <Input placeholder="Enter task" />
                        </Form.Item>
                        {/* CATEGORY INPUT */}
                        <Form.Item
                          {...field}
                          label={index === 0 ? "Category" : ""}
                          name={[field.name, "hashtag"]}
                          className="mb-2"
                        >
                          <Input placeholder="Category (optional)" />
                        </Form.Item>
                        {/* DELETE BUTTON */}
                        <Button
                          type="default"
                          onClick={() => remove(field.name)}
                          className=" text-red-400 border-red-400 mb-6"
                          icon={<FontAwesomeIcon icon={faTrashCan} />}
                        >
                          Delete
                        </Button>
                        {/* DIVIDER */}
                        {index < fields.length - 1 && (
                          <Divider className="my-6 text-gray-700" />
                        )}
                      </div>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<FontAwesomeIcon icon={faPlus} />}
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

      {/* MODAL DELETE TASK GROUP WARNING */}
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

      {/* MODAL ADD NEW TASK TO GROUP */}
      <Modal
        title="Add Task to Group"
        open={newTaskModalVisible}
        onOk={() => newTaskForm.submit()}
        onCancel={() => {
          setNewTaskModalVisible(false);
          setEditingGroup(null);
          newTaskForm.resetFields();
        }}
      >
        <Form
          form={newTaskForm}
          onFinish={handleAddTaskToGroup}
          layout="vertical"
        >
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

      {/* MODAL EDIT TASK */}
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

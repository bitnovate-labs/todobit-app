import { List, Switch } from "antd";
import MobileHeader from "./MobileHeader";

function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 md:mt-0">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>
      <MobileHeader title="Settings" />
      <List
        className="bg-white rounded-lg shadow-sm p-4"
        itemLayout="horizontal"
        dataSource={[
          {
            title: "Dark Mode",
            description: "Toggle dark mode theme",
            action: <Switch />,
          },
          {
            title: "Push Notifications",
            description: "Receive task reminders",
            action: <Switch />,
          },
        ]}
        renderItem={(item) => (
          <List.Item actions={[item.action]} className="px-4 hover:bg-gray-50">
            <List.Item.Meta
              className="py-2"
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export default Settings;

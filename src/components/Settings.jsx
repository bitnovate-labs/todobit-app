import { Card, Switch, Typography } from "antd";
import MobileHeader from "./MobileHeader";
import Link from "antd/es/typography/Link";

const { Text } = Typography;

const settings = [
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
];

function Settings() {
  return (
    <div className="max-w-2xl mx-auto md:mt-0 min-h-[calc(100vh-7rem)] flex flex-col space-y-20">
      <MobileHeader title="Settings" />
      <div className="space-y-4 flex-grow">
        {settings.map((setting, index) => (
          <Card
            key={index}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text strong className="text-lg">
                  {setting.title}
                </Text>
                <Text type="secondary" className="block">
                  {setting.description}
                </Text>
              </div>
              {setting.action}
            </div>
          </Card>
        ))}
      </div>
      <div className="text-center py-8 text-gray-500 mt-auto">
        <Text className="text-xs text-gray-500">
          © {new Date().getFullYear()}{" "}
        </Text>
        <Link
          href="https://bitnovatelabs.com"
          target="_blank"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Bitnovate Labs.
        </Link>
        <span className="text-xs text-gray-500"> All rights reserved.</span>
      </div>
    </div>
  );
}

export default Settings;

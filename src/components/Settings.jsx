import { Card, Switch, Typography } from "antd";
import { useTheme } from "../context/ThemeContext";
import MobileHeader from "./MobileHeader";

const { Text, Link } = Typography;

function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();

  const settings = [
    {
      title: "Dark Mode",
      description: "Toggle dark mode theme",
      action: <Switch checked={isDarkMode} onChange={toggleTheme} />,
    },
    {
      title: "Push Notifications",
      description: "Receive task reminders",
      action: <Switch />,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto md:mt-0 min-h-[calc(100vh-7rem)] flex flex-col">
      {/* MOBILE HEADER */}
      <MobileHeader title="Settings" />
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      {/* CONTENTS */}
      <div className="space-y-4 flex-grow pt-24">
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

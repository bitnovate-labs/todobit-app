import { Button, Card, Switch, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import MobileHeader from "./MobileHeader";

const { Text, Link } = Typography;

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
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto md:mt-0 min-h-[calc(100vh-7rem)] flex flex-col">
      <div className="hidden md:flex items-center justify-center h-14">
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>
      <MobileHeader title="Settings" />
      <div className="md:hidden flex items-center justify-between h-14 pt-10 pb-8 fixed top-0 left-0 right-0 bg-white z-20 border-b border-gray-200 px-4">
        <Button
          type="text"
          icon={
            <FontAwesomeIcon
              icon={faChevronLeft}
              style={{ fontSize: "20px" }}
            />
          }
          onClick={() => navigate(-1)}
          className="text-gray-600"
        />
        <h2 className="text-lg font-semibold">Settings</h2>
        <div className="w-8" /> {/* Spacer for alignment */}
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

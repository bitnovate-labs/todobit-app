import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { motion } from "framer-motion";

const { Title, Paragraph } = Typography;

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="space-y-4">
          <Title level={1} className="text-4xl font-bold text-gray-900">
            Welcome to Go Task
          </Title>
          <Paragraph className="text-lg text-gray-600">
            A workspace to over 10 Million influencers around the global of the
            world.
          </Paragraph>
        </div>

        <div className="relative">
          <motion.img
            src="/task-illustration.svg"
            alt="Task Management"
            className="w-full h-auto"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <Button
          type="primary"
          size="large"
          className="w-full h-12 text-lg font-medium rounded-lg"
          onClick={() => navigate("/login")}
        >
          Let's Start
        </Button>
      </motion.div>
    </div>
  );
}

export default Welcome;

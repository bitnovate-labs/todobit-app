import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { motion } from "framer-motion";
// import welcome_image from "../assets/welcomepage.png";
import welcome_image from "../assets/welcome_image.png";

const { Title, Paragraph } = Typography;

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        <div className="relative">
          <motion.img
            src={welcome_image}
            alt="Task Management"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="space-y-4 absolute bottom-40 left-0 right-0">
            <Title level={1} className="text-4xl font-black text-gray-900">
              Welcome to Dobit
            </Title>
            <Paragraph className="text-lg text-gray-400 mx-10">
              A todo-habit tracking app to over <br /> 10 million influencers
              around the global of the world.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="text-lg font-medium rounded-3xl px-32"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Welcome;

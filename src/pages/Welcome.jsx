import { Link, useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { motion } from "framer-motion";
// import welcome_image from "../assets/welcomepage.png";
import welcome_image from "../assets/welcome_image.png";

const { Title, Paragraph, Text } = Typography;

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex-1 flex items-center justify-center"
      >
        <div className="max-w-md w-full text-center relative">
          <motion.img
            src={welcome_image}
            alt="Task Management"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-auto max-h-[50vh] object-contain"
          />
          <div className="space-y-4">
            <Title level={1}>
              <span className="text-gray-700 text-4xl font-black">
                Welcome to Dobit
              </span>
            </Title>
            <Paragraph className="text-lg text-gray-400 mx-10">
              A todo-habit tracking app to over <br /> 10 million influencers
              around the global of the world.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="text-lg font-medium rounded-3xl px-28"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </motion.div>

      {/* FOOTER */}
      <div className="w-full py-6 px-4">
        <div className="max-w-md mx-auto flex items-center justify-center gap-1">
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
    </div>
  );
}

export default Welcome;

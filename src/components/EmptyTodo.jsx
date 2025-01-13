import { Empty } from "antd";
import { motion } from "framer-motion";
import Clipboard from "../assets/clipboard.png";

function EmptyTodo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <motion.div
        className="max-w-[150px] mx-auto opacity-45 "
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <img src={Clipboard} alt="Empty clipboard" />
      </motion.div>
      <Empty
        image={null}
        description={
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-800">No tasks yet</p>
            <p className="text-sm text-gray-500">
              Tap the '+' icon to get started!
            </p>
          </div>
        }
      />
    </motion.div>
  );
}

export default EmptyTodo;

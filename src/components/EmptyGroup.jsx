import { Empty } from "antd";
import { motion } from "framer-motion";
import BlankClipboard from "../assets/emptygroup.png";

function EmptyGroup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 text-center"
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
        <img src={BlankClipboard} alt="Empty task group" />
      </motion.div>
      <Empty
        image={null}
        description={
          <div>
            <p className="text-sm text-gray-500">No task groups created yet</p>
          </div>
        }
      />
    </motion.div>
  );
}

export default EmptyGroup;

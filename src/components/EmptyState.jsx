import { Empty } from "antd";
import { motion } from "framer-motion";

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 text-center"
    >
      <div className="max-w-[240px] mx-auto mb-6">
        <svg viewBox="0 0 200 220" className="w-full h-auto">
          {/* Background circle */}
          <circle cx="100" cy="100" r="80" fill="#f0f9ff" />

          {/* 3D Checklist */}
          <motion.g
            initial={{ rotate: -5 }}
            animate={{ rotate: 5 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {/* Main board - front face */}
            <path
              d="M60 50 L140 70 L140 160 L60 140 Z"
              fill="#ffffff"
              stroke="#e5e7eb"
            />
            {/* Right side */}
            <path
              d="M140 70 L160 50 L160 140 L140 160 Z"
              fill="#f3f4f6"
              stroke="#e5e7eb"
            />
            {/* Top side */}
            <path
              d="M60 50 L160 50 L140 70 L60 50 Z"
              fill="#f9fafb"
              stroke="#e5e7eb"
            />

            {/* Task lines with 3D effect */}
            <motion.g
              initial={{ y: 0 }}
              animate={{ y: 2 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {/* Task line 1 */}
              <rect x="75" y="85" width="50" height="6" rx="3" fill="#60a5fa" />
              <rect x="140" y="85" width="5" height="6" fill="#3b82f6" />

              {/* Task line 2 */}
              <rect
                x="75"
                y="105"
                width="40"
                height="6"
                rx="3"
                fill="#34d399"
              />
              <rect x="140" y="105" width="5" height="6" fill="#10b981" />

              {/* Task line 3 */}
              <rect
                x="75"
                y="125"
                width="45"
                height="6"
                rx="3"
                fill="#fbbf24"
              />
              <rect x="140" y="125" width="5" height="6" fill="#d97706" />
            </motion.g>

            {/* Floating elements */}
            <motion.g
              initial={{ y: -3 }}
              animate={{ y: 3 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              {/* Plus icon */}
              <circle cx="160" cy="40" r="15" fill="#22c55e" />
              <path
                d="M160 32 L160 48 M152 40 L168 40"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Check marks */}
              <circle cx="40" cy="100" r="12" fill="#3b82f6" />
              <path
                d="M34 100 L38 104 L46 96"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="170" cy="120" r="10" fill="#f59e0b" />
              <path
                d="M165 120 L169 124 L175 118"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.g>

            {/* Stars/sparkles */}
            <motion.g
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <path d="M50 60 L55 65 L50 70 L45 65 Z" fill="#f472b6" />
              <path d="M155 155 L160 160 L155 165 L150 160 Z" fill="#818cf8" />
              <path d="M175 85 L180 90 L175 95 L170 90 Z" fill="#34d399" />
            </motion.g>
          </motion.g>
        </svg>
      </div>
      <div className="relative">
        <Empty
          image={null}
          description={
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-800">No tasks yet</p>
              <p className="text-sm text-gray-500">
                Add your first task to get started!
              </p>
            </div>
          }
        />
      </div>
    </motion.div>
  );
}

export default EmptyState;

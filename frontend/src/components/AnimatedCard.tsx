import React from "react";
import { motion } from "framer-motion";
import { Card, CardProps } from "@mui/material";

interface AnimatedCardProps extends CardProps {
  delay?: number;
  children: React.ReactNode;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  delay = 0,
  children,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
        delay,
        duration: 0.5,
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card {...props}>{children}</Card>
    </motion.div>
  );
};

export default AnimatedCard;

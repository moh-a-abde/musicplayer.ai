"use client";

import { PiPlusCircleFill } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CreatePlaylistButtonProps {
  onClick: () => void;
  className?: string;
}

const CreatePlaylistButton = ({ onClick, className = "" }: CreatePlaylistButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={onClick}
        variant="gradient"
        className={`rounded-md shadow-md hover:shadow-lg ${className}`}
        aria-label="Create new playlist"
      >
        <PiPlusCircleFill className="mr-2 text-xl" />
        <span>Create Playlist</span>
      </Button>
    </motion.div>
  );
};

export default CreatePlaylistButton; 
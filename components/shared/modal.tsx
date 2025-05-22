import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import H5AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  audios?: { title: string; url: string }[];
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  audios = [],
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full flex flex-col relative mt-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: "90vh",
            }}
          >
            {/* Кнопка закрытия */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-5 right-6 p-0 bg-transparent hover:bg-transparent border-none focus-visible:ring-0 focus-visible:outline-none"
              onClick={onClose}
            >
              <X className="w-6 h-6 text-[#996633] drop-shadow-md hover:text-primary" />
            </Button>

            {/* Заголовок */}
            <h2 className="text-center text-3xl font-bold mb-4">{title}</h2>

            {/* Контент */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {children}
            </div>

            {/* Нижняя панель */}
            {audios.length > 0 && (
              <div className="mt-4 space-y-4">
                {audios.map((audio, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <H5AudioPlayer
                      src={audio.url}
                      showJumpControls={false}
                      customAdditionalControls={[]}
                      autoPlay={false}
                      style={{ borderRadius: 6 }}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

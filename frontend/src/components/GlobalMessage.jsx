import { useEffect } from "react";
import { Alert } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";

const GlobalMessage = ({ type = "info", message, onClose, autoHide = 4000 }) => {
  useEffect(() => {
    if (message && autoHide) {
      const timer = setTimeout(onClose, autoHide);
      return () => clearTimeout(timer);
    }
  }, [message, autoHide, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            top: "20px",
            left: 0,
            right: 0, 
            display: "flex",
            justifyContent: "center",
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          <Alert
            variant={
              type === "success"
                ? "success"
                : type === "error"
                ? "danger"
                : "info"
            }
            dismissible
            onClose={onClose}
            style={{
              pointerEvents: "auto",
              maxWidth: "600px",
              width: "90%",
              textAlign: "center",
              borderRadius: "12px",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            className="shadow"
          >
            {message}
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalMessage;

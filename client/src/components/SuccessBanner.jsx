import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import "./SuccessBanner.css";

export default function SuccessBanner({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="success-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaCheckCircle className="success-icon" />
          <span>Intervention enregistrée avec succès !</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

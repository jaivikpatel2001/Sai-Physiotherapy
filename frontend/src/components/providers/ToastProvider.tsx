'use client';
/**
 * Mounts the react-toastify <ToastContainer/> once at the root. Every toast in
 * the app (admin + public + auth) renders through this single container.
 *
 * Position, animation, theme and timing are all centralised here so we never
 * end up with per-page inconsistencies. Honors prefers-reduced-motion via
 * react-toastify's built-in `transition` system (default Slide is GPU-only).
 */
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
      limit={4}
      aria-label="Notifications"
    />
  );
}

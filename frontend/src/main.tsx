
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initializeCsrf } from "./services/api";

  // Initialize CSRF token before rendering app
  initializeCsrf().then(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
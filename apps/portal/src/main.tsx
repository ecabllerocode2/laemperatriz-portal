import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { capturePwaInstallPrompt } from "./lib/pwa-install-prompt";
import { enableNativePwaBehavior } from "./lib/pwa-native-behavior";
import { registerPwaAutoUpdate } from "./pwa";

capturePwaInstallPrompt();
enableNativePwaBehavior();
registerPwaAutoUpdate();

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);

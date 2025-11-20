import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./diagnostic.ts";

createRoot(document.getElementById("root")!).render(<App />);

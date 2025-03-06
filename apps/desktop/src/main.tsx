import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
// import "https://unpkg.com/augmented-ui@2/augmented-ui.min.css"

const link = document.createElement("link");
link.rel = "stylesheet";
link.type = "text/css";
link.href = "https://unpkg.com/augmented-ui@2/augmented-ui.min.css";
document.head.appendChild(link);

import { TitleBar } from "./components/navigation/Titlebar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TitleBar />
    <div className="min-h-[calc(100vh-2rem)] bg-secondary mt-8 mohave-font overflow-x-hidden">
      <App />
    </div>
  </React.StrictMode>
);

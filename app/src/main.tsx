import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapView } from "@/components/map/MapView";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapView />
  </StrictMode>,
);

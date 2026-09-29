import { createRoot } from "react-dom/client";
import { VimbisoApp } from "@/components/vimbiso/app";
import "./styles.css";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(<VimbisoApp />);
}

import App from "./App";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import './index.css'


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>
);

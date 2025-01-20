import App from "./App";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import "./index.css";

// Render the main React application
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>
);

// Define the SearchFlowWidget initialization logic
const SearchFlowWidget = {
  init: ({ siteId, apiUrl }) => {
    const containerId = "searchflow-widget";
    let container = document.getElementById(containerId);

    // Dynamically create the container if it doesn't exist
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    // Render the App or a specific widget component dynamically
    const widgetRoot = createRoot(container);
    widgetRoot.render(
      <StrictMode>
        <ChakraProvider>
          <App siteId={siteId} apiUrl={apiUrl} />
        </ChakraProvider>
      </StrictMode>
    );
  },
};

// Attach SearchFlowWidget to the global window object
window.SearchFlowWidget = SearchFlowWidget;

// Optional: Auto-initialize if specific conditions are met
if (document.getElementById("searchflow-widget")) {
  SearchFlowWidget.init({
    siteId: "DEFAULT_SITE_ID", // Replace with actual default value
    apiUrl: "https://api.example.com",
  });
}

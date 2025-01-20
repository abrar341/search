import { useEffect, useState } from "react";
import SearchWidget from "./pages/SearchWdget";
const App = () => {

  const [config, setConfig] = useState({ apiUrl: "", siteId: "" });

  useEffect(() => {
    // Check if `window.appConfig` is available
    if (window.appConfig) {
      const { apiUrl, siteId } = window.appConfig;
      setConfig({ apiUrl, siteId });
    } else {
      console.error("appConfig is not defined on the window object.");
    }
  }, []);
  return (
    <div>
      <h1>App Configuration</h1>
      <p>API URL: {config.apiUrl}</p>
      <p>Site ID: {config.siteId}</p>
      <SearchWidget />
    </div>
  );
};

export default App;

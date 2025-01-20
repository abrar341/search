import { useEffect, useState } from "react";
import SearchWidget from "./pages/SearchWdget";
const App = () => {


  return (
    <SearchWidget userId={config.userId} siteId={config.siteId} />
  );
};

export default App;

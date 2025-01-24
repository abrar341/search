import { useState, useEffect, useCallback } from "react";
import SearchModal from "./SearchModal";
import { useDisclosure } from "@chakra-ui/react";
import { search } from "../apiManager/search";
import { getSearchPreference, getTopSearchTerms } from "../apiManager/setting";
import {
  searchFromCollections,
  searchFromProducts,
  searchFromPages,
} from "../apiManager/search";
import SearchPageModal from "./SearchPageModel";


const SearchWidget = () => {

  // if (!window.appConfig) {
  //   window.appConfig = {};
  // }

  // // Set properties on appConfig
  // window.appConfig.userId = "678fb2a38972bb081ed9eb3b"; // Replace with actual user ID
  // window.appConfig.siteId = "6768b69f5fe75864249a7ce5"; // Replace with actual site ID

  const [config, setConfig] = useState(() => {
    // Set the initial hardcoded values
    return { userId: "", siteId: "" };
  });
  useEffect(() => {
    // Check if `window.appConfig` is available
    if (window.appConfig) {
      const { userId, siteId } = window.appConfig;
      setConfig({ userId, siteId });
    } else {
      console.error("appConfig is not defined on the window object.");
    }

    const fetchSearchPreference = async () => {
      try {
        const { userId, siteId } = window.appConfig;
        const preferences = await getSearchPreference(userId, siteId);
        setSearchPreference(preferences?.data);
        // Fetching top search terms
        const searchTerms = await getTopSearchTerms(userId, siteId, 5);
        setSearchTerms(searchTerms?.data); // Assuming you have a state for top search terms
      } catch (error) {
        console.error("Error fetching search preferences:", error);
      }
    };
    fetchSearchPreference();
  }, []);

  // useEffect(() => {
  //   onOpen()
  // }, []);

  const DEBOUNCE_DELAY = 500; // Delay in milliseconds
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], collections: [], pages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [instanceIsLoading, setInstanceIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // State to hold search results
  const [searchTerms, setSearchTerms] = useState([]); // State to hold search results
  const [searchPreference, setSearchPreference] = useState(null); // State to hold search preferences
  const [showResults, setShowResults] = useState(false); // State to toggle results display
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen: isSearchPageModalOpen, onOpen: openSearchPageModal, onClose: closeSearchPageModal } = useDisclosure();

  const handleSearch = async (searchQuery, userId, siteId) => {
    setInstanceIsLoading(true); // Set loading state to true
    try {
      const data = await search(searchQuery, userId, siteId);
      setSearchResults(data?.data);
    } catch (error) {
      console.error("Error calling search API:", error);
    } finally {
      setInstanceIsLoading(false); // Set loading state to false
    }

  };


  // Debounced version of handleSearch
  const debouncedSearch = useCallback(
    debounce((searchQuery, userId, siteId) => {
      handleSearch(searchQuery, userId, siteId);
    }, DEBOUNCE_DELAY),
    []
  );
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Call the debounced search function
    if (window.appConfig) {
      const { userId, siteId } = window.appConfig;
      debouncedSearch(value, userId, siteId);
    } else {
      console.error("appConfig is not defined on the window object.");
    }
  };
  const fuzzySearch = searchPreference?.searchEngineSettings?.fuzzySearch;
  const siteId = searchPreference?.siteId;
  const collectionIds = searchPreference?.searchFrom?.collections || [];
  const searchResultLayout = searchPreference?.searchResultPageCustomization?.searchResultLayout || "";
  const ShowInstance = searchPreference?.searchEngineSettings.instantSearchWidget || "";
  const InstanceSuggestedSearchTerms = searchPreference?.instantSearchWidgetCustomization.suggestedSearchTerms || "";
  const SearchSuggestedSearchTerms = searchPreference?.searchResultPageCustomization.suggestedSearchTerms || "";

  const handleSearchButtonClick = () => {
    if (query.length >= 0) {
      fetchAllResults(query, fuzzySearch, siteId, collectionIds)
      setShowResults(true); // Show results only when the button is clicked
    }
    onClose()
  };

  const fetchAllResults = async (query, fuzzySearch, siteId, collectionIds) => {
    setIsLoading(true);
    try {
      const page = 1; // Set your pagination page
      const pageSize = 3; // Set your pagination size
      const [products, collections, pages] = await Promise.all([
        searchFromProducts(siteId, query, fuzzySearch, page, pageSize),
        searchFromCollections(collectionIds, query, fuzzySearch, page, pageSize),
        searchFromPages(siteId, query, fuzzySearch, page, pageSize),
      ]);

      setResults({ products, collections, pages });
    } catch (error) {
      console.error("Error during initial search:", error);
    } finally {
      setIsLoading(false);
    }
  };

  //Props things
  const searchResultPageProps = {
    searchResults: searchResults,  // Pass results to the SearchResultPage
    searchQuery: query,
    setSearchQuery: setQuery,
    handleSearchButtonClick: handleSearchButtonClick,
    fetchAllResults: fetchAllResults,
    setIsLoading: setIsLoading,
    results: results,
    setResults: setResults,
    isLoading: isLoading,
    fuzzySearch: fuzzySearch,
    siteId: siteId,
    collectionIds: collectionIds,
    searchResultLayout: searchResultLayout,
    SearchSuggestedSearchTerms: SearchSuggestedSearchTerms,
    searchTerms: searchTerms,
  }
  // Listen for the custom event from Webflow
  useEffect(() => {
    const handleWidgetOpen = () => {
      onOpen(); // Call onOpen from useDisclosure when the event is triggered
    };

    // Add event listener for the custom event
    window.addEventListener("widgetOpen", handleWidgetOpen);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("widgetOpen", handleWidgetOpen);
    };
  }, [onOpen]);

  return (
    <div className="w-full">

      <SearchModal
        ShowInstance={ShowInstance}
        openSearchPageModal={openSearchPageModal}
        isSearchPageModalOpen={isSearchPageModalOpen}
        isOpen={isOpen}
        onClose={onClose}
        onOpen={onOpen}
        searchResults={searchResults}
        handleSearch={handleSearch}
        searchQuery={query}
        setSearchQuery={setQuery}
        initialQuery={query} // Pass query as initialQuery
        instantSearchWidgetCustomization={
          searchPreference?.instantSearchWidgetCustomization
        }
        handleSearchButtonClick={handleSearchButtonClick}
        handleInputChange={handleInputChange}
        instanceIsLoading={instanceIsLoading}
        searchTerms={searchTerms}
        InstanceSuggestedSearchTerms={InstanceSuggestedSearchTerms}
      />
      <SearchPageModal
        CloseInstance={onClose}
        isOpen={isSearchPageModalOpen}
        onClose={closeSearchPageModal}
        onOpen={openSearchPageModal}
        searchResults={searchResults}
        handleSearch={handleSearch}
        searchQuery={query}
        setSearchQuery={setQuery}
        initialQuery={query} // Pass query as initialQuery
        instantSearchWidgetCustomization={
          searchPreference?.instantSearchWidgetCustomization
        }
        handleSearchButtonClick={handleSearchButtonClick}
        handleInputChange={handleInputChange}
        instanceIsLoading={instanceIsLoading}
        searchTerms={searchTerms}
        InstanceSuggestedSearchTerms={InstanceSuggestedSearchTerms}
        {...searchResultPageProps}
      />
    </div>
  );
};

// Utility debounce function
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
export default SearchWidget;

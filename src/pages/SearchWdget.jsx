import { useState, useEffect, useCallback } from "react";
import SearchModal from "./SearchModal";
import { useDisclosure } from "@chakra-ui/react";
import { search } from "../apiManager/search";
import { getSearchPreference, getTopSearchTerms } from "../apiManager/setting";
import SearchResultPage from "./SearchResultPage";
import {
  searchFromCollections,
  searchFromProducts,
  searchFromPages,
} from "../apiManager/search";


const SearchWidget = () => {
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

  useEffect(() => {
    const fetchSearchPreference = async () => {
      const userId = "678d3af66bca9dceb1ffe3a7";
      const siteId = "6768b69f5fe75864249a7ce5";
      try {
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
  }, []); // Fetch search preferences on component mount

  const handleSearch = async (searchQuery) => {
    const userId = "678d3af66bca9dceb1ffe3a7";
    const siteId = "6768b69f5fe75864249a7ce5";

    setInstanceIsLoading(true); // Set loading state to true

    try {
      // Call the search API
      const data = await search(searchQuery, userId, siteId);

      // Update search results state
      setSearchResults(data?.data);
    } catch (error) {
      console.error("Error calling search API:", error);
    } finally {
      setInstanceIsLoading(false); // Set loading state to false
    }
  };

  // Debounced version of handleSearch
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      handleSearch(searchQuery);
    }, DEBOUNCE_DELAY),
    []
  );
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // Call the debounced search function
    debouncedSearch(value);
  };
  // console.log("searchPreference", searchPreference);

  const fuzzySearch = searchPreference?.searchEngineSettings?.fuzzySearch;
  const siteId = searchPreference?.siteId;
  const collectionIds = searchPreference?.searchFrom?.collections || [];
  const searchResultLayout = searchPreference?.searchResultPageCustomization?.searchResultLayout || "";
  const InstanceSuggestedSearchTerms = searchPreference?.instantSearchWidgetCustomization.suggestedSearchTerms || "";
  const SearchSuggestedSearchTerms = searchPreference?.searchResultPageCustomization.suggestedSearchTerms || "";
  const handleSearchButtonClick = () => {
    if (query.length >= 0) {
      fetchAllResults(query, fuzzySearch, siteId, collectionIds)
      setShowResults(true); // Show results only when the button is clicked
    }
    onClose()
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setQuery(""); // Optionally clear the query
    setSearchResults([]); // Optionally clear results
  };

  const fetchAllResults = async (query, fuzzySearch, siteId, collectionIds) => {

    setIsLoading(true);
    try {
      const page = 1; // Set your pagination page
      const pageSize = 3; // Set your pagination size
      // const collectionIds = ["6768b6a05fe75864249a7d99", "6768b6a05fe75864249a7d6b"];

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

  return (
    <div className="w-full">
      {searchPreference?.searchEngineSettings?.instantSearchWidget && (
        <SearchModal
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
      )}

      {/* Input and Search Button */}
      <div className="flex w-full mt-2 md:w-1/2 mx-auto items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search..."
          onClick={() => {
            onOpen();
          }}
          className="w-full flex-grow px-4 py-3 h-12 border border-gray-300 rounded-l-xl text-lg outline-none"
        />
        <button
          onClick={handleSearchButtonClick}
          className="px-4 py-3 h-12 bg-blue-600 text-white rounded-r-xl flex items-center justify-center hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Conditionally Render Search Results */}
      {showResults && (
        <SearchResultPage
          searchResults={searchResults}  // Pass results to the SearchResultPage
          searchQuery={query}
          setSearchQuery={setQuery}
          handleSearchButtonClick={handleSearchButtonClick}
          fetchAllResults={fetchAllResults}
          setIsLoading={setIsLoading}
          results={results}
          setResults={setResults}
          isLoading={isLoading}
          fuzzySearch={fuzzySearch}
          siteId={siteId}
          collectionIds={collectionIds}
          searchResultLayout={searchResultLayout}
          SearchSuggestedSearchTerms={SearchSuggestedSearchTerms}
          searchTerms={searchTerms}

        />
      )}
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

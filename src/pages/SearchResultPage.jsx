import React, { useState, useEffect } from "react";
import {
    searchFromCollections,
    searchFromProducts,
    searchFromPages,
} from "../apiManager/search";
import { Box, Divider, Text } from "@chakra-ui/react";

const SearchResultPage = ({ searchQuery, setIsLoading, setResults, fetchAllResults, results, isLoading, fuzzySearch, siteId, collectionIds, searchResultLayout, SearchSuggestedSearchTerms, setSearchQuery, searchTerms }) => {
    const [activeTab, setActiveTab] = useState("Collections");
    const [viewMode, setViewMode] = useState("grid"); // Options: "grid", "list"
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (searchQuery) fetchAllResults(searchQuery, fuzzySearch, siteId, collectionIds);
    }, []);

    const fetchTabResults = async (query, tab, fuzzySearch, siteId, collectionIds) => {
        setIsLoading(true);
        try {
            const page = 1;
            const pageSize = 6;

            let data = [];
            if (tab === "Products") {
                data = await searchFromProducts(siteId, query, fuzzySearch, page, pageSize);
                setResults((prev) => ({ ...prev, products: data }));
            } else if (tab === "Collections") {
                // const collectionIds = ["6768b6a05fe75864249a7d99", "6768b6a05fe75864249a7d6b"];
                data = await searchFromCollections(collectionIds, query, fuzzySearch, page, pageSize);
                setResults((prev) => ({ ...prev, collections: data }));
            } else if (tab === "Pages") {
                data = await searchFromPages(siteId, query, fuzzySearch, page, pageSize);
                setResults((prev) => ({ ...prev, pages: data }));
            }
        } catch (error) {
            console.error(`Error during ${tab} search:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) fetchTabResults(searchQuery, activeTab, fuzzySearch, siteId, collectionIds);
    }, [activeTab, currentPage]);

    const activeResults = results[activeTab.toLowerCase()] || [];
    const pagination = activeResults?.data?.pagination;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-[90vh] flex flex-col bg-white">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 flex-grow">
                <div className="flex items-center border-b border-gray-200 mb-6">
                    {(() => {
                        let tabsToRender = [];
                        if (searchResultLayout === "one-tab") {
                            tabsToRender = ["Collections"]; // Only "Collections"
                        } else if (searchResultLayout === "two-tabs") {
                            tabsToRender = ["Collections", "Products"]; // "Collections" and "Products"
                        } else if (searchResultLayout === "three-tabs") {
                            tabsToRender = ["Collections", "Products", "Pages"]; // All tabs
                        }

                        return tabsToRender.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    setCurrentPage(1);
                                }}
                                className={`px-6 py-2 text-lg font-medium transition ${activeTab === tab
                                    ? "text-blue-600 border-b-2 border-blue-600"
                                    : "text-gray-600 hover:text-blue-600"
                                    }`}
                            >
                                {tab} ({results[tab.toLowerCase()]?.data?.pagination?.totalResults || 0})
                            </button>
                        ));
                    })()}
                </div>


                {/* Results */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="loader border-t-4 border-blue-500 w-12 h-12 rounded-full animate-spin"></div>
                    </div>
                ) : activeResults?.data?.results?.length > 0 ? (
                    <div
                        className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                            : "grid-cols-1"
                            }`}
                    >
                        {activeResults?.data?.results?.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                    {activeTab === "Pages"
                                        ? item?.pageTitle || "Unnamed Item"
                                        : item?.fieldData?.name || "Unnamed Item"}
                                </h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center col-span-full">
                        No results found for "{searchQuery}".
                        {
                            SearchSuggestedSearchTerms && <Box ml={1}>
                                <div className="flex justify-center mt-20 items-center">
                                    <Text
                                        fontSize="lg"
                                        fontWeight="bold"
                                        color="blue.600"
                                        textTransform="uppercase"
                                        mb={2}
                                    >
                                        Suggessted Terms
                                    </Text>
                                </div>

                                <div className="flex gap-4 mt-4 justify-center items-center flex-wrap">
                                    {searchTerms?.map((term, index) => (
                                        <Text
                                            key={index}
                                            fontWeight="medium"
                                            mb={2}
                                            px={4}
                                            py={2}
                                            border="1px"
                                            borderColor="blue.500"
                                            borderRadius="lg"
                                            color="blue.600"
                                            cursor="pointer"
                                            _hover={{ bg: "blue.500", color: "white" }}
                                            transition="all 0.2s"
                                            onClick={() => {
                                                // Append the term to the search query
                                                setSearchQuery(term?.term || "Unnamed Collection");
                                            }}
                                        >
                                            {term?.term || "Unnamed Collection"}
                                        </Text>
                                    ))}
                                </div>
                            </Box>
                        }
                    </p>
                )}
            </main>

            {/* Pagination at Bottom */}
            {pagination && (
                <div className="flex justify-between  items-center mt-auto px-4 py-1 bg-white border-t border-gray-300">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-gray-700">
                        Page {currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>

    );
};

export default SearchResultPage;

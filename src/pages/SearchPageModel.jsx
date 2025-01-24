import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Flex,
    Box,
    Text,
    Link
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
    searchFromCollections,
    searchFromProducts,
    searchFromPages,
} from "../apiManager/search";
const SearchPageModal = ({
    CloseInstance,
    onClose,
    isOpen,
    searchQuery,
    setSearchQuery,
    handleSearchButtonClick,
    searchTerms,
    setIsLoading, setResults, fetchAllResults, results, isLoading, fuzzySearch, siteId, collectionIds, searchResultLayout, SearchSuggestedSearchTerms, handleInputChange
}) => {

    const [activeTab, setActiveTab] = useState("Collections");
    const [viewMode, setViewMode] = useState("grid"); // Options: "grid", "list"
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value)); // Update the currentPage state
    };

    useEffect(() => {
        if (searchQuery) fetchAllResults(searchQuery, fuzzySearch, siteId, collectionIds);
    }, []);

    const fetchTabResults = async (query, tab, fuzzySearch, siteId, collectionIds) => {
        setIsLoading(true);
        try {
            // const page = 1;
            // const pageSize = 6;

            let data = [];
            if (tab === "Products") {
                data = await searchFromProducts(siteId, query, fuzzySearch, currentPage, pageSize);
                setResults((prev) => ({ ...prev, products: data }));
            } else if (tab === "Collections") {
                data = await searchFromCollections(collectionIds, query, fuzzySearch, currentPage, pageSize);
                setResults((prev) => ({ ...prev, collections: data }));
            } else if (tab === "Pages") {
                data = await searchFromPages(siteId, query, fuzzySearch, currentPage, pageSize);
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
    }, [activeTab, currentPage, pageSize]);

    const activeResults = results[activeTab.toLowerCase()] || [];
    const pagination = activeResults?.data?.pagination;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setCurrentPage(newPage);
        }
    };
    return (
        <Modal onClose={onClose} size="8xl" isOpen={isOpen}>
            <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(5px)" />
            <ModalContent
                m={0}
                bg="white"
                backdropFilter="blur(10px)"
                borderRadius=""
                boxShadow="lg"
                height="100vh"
                overflow="hidden"
            >
                <ModalHeader textAlign="center" fontWeight="bold" pb={0}>SEARCH RESULTS</ModalHeader>
                <ModalBody p={4}>
                    <Flex px={3}
                        width="100%" mb={4} gap={2}>
                        <Input
                            value={searchQuery || ""}
                            onChange={handleInputChange}
                            placeholder="Search..."
                            size="lg"
                            bg="whiteAlpha.800"
                            borderRadius="md"
                        />
                        <Button
                            mt={1}
                            colorScheme="blue"
                            onClick={handleSearchButtonClick}
                        // isDisabled={(searchQuery || "").trim().length <= 0}
                        >
                            Search
                        </Button>
                    </Flex>

                    <div className="min-h-[79vh] pb-1 rounded-xl flex flex-col bg-white">
                        {/* Main Content */}
                        <main className="container mx-auto px-4 py-6 flex-grow">
                            <div className="flex flex-col md:flex-row md:justify-between items-center">
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

                                <div className="mb-6 md:mb-0">
                                    <label htmlFor="pageDropdown" className="mr-2 font-semibold">
                                        Select
                                    </label>
                                    <select
                                        id="pageDropdown"
                                        value={pageSize}
                                        onChange={handlePageSizeChange}
                                        className="border rounded px-2 py-1"
                                    >
                                        {Array.from({ length: 9 }, (_, i) => i + 1).map((page) => (
                                            <option key={page} value={page}>
                                                {page}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                            <Link
                                                href={
                                                    activeTab === "Pages"
                                                        ? item?.URL || "#" // Use `pageURL` for pages
                                                        : item?.productURL || "#" // Use `productURL` for products
                                                }
                                                isExternal
                                            >
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                                    {activeTab === "Pages"
                                                        ? item?.pageTitle || "Unnamed Item"
                                                        : item?.fieldData?.name || "Unnamed Item"}
                                                </h3>
                                            </Link>

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
                            <div className="flex justify-between  items-center  px-4 py-1 bg-white border-t border-gray-300">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 mr-2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>

                                <span className="text-gray-700">
                                    Page {currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="disabled:opacity-50"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-5 h-5 ml-2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>

                            </div>
                        )}
                    </div>

                </ModalBody>
                <ModalFooter className="absolute top-0 right-0 cursor-pointer">
                    <button
                        onClick={() => {
                            CloseInstance();
                            onClose();
                        }}
                        className="flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </ModalFooter>

            </ModalContent>
        </Modal>
    );
};

export default SearchPageModal;

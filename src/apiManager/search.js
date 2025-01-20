import api from './api';

export const search = async (query, userId, siteId) => {
    const res = await api.post('/searchManagementRoutes/search', {
        query,
        userId,
        siteId,
    });
    return res.data;
};

export const searchFromCollections = async (collectionIds, query, fuzzySearch, page, pageSize) => {
    try {
        const res = await api.post('/searchManagementRoutes/searchFromCollections', {
            collectionIds,
            query,
            fuzzySearch,
            page,
            pageSize,
        });
        return res.data;
    } catch (error) {
        console.error("Error during searchFromCollections API call:", error);
        throw error;
    }
};

export const searchFromProducts = async (siteId, query, fuzzySearch, page, pageSize) => {
    try {
        const res = await api.post('/searchManagementRoutes/searchFromProducts', {
            siteId,
            query,
            fuzzySearch,
            page,
            pageSize,
        });
        return res.data;
    } catch (error) {
        console.error("Error during searchFromProducts API call:", error);
        throw error;
    }
};


export const searchFromPages = async (siteId, query, fuzzySearch, page, pageSize) => {
    try {
        const res = await api.post('/searchManagementRoutes/searchFromPages', {
            siteId,
            query,
            fuzzySearch,
            page,
            pageSize,
        });
        return res.data;
    } catch (error) {
        console.error("Error during searchFromPages API call:", error);
        throw error;
    }
};


import api from './api';

export const getSearchPreference = async (userId, siteId) => {
    const res = await api.get(`/searchPreferenceManagementRoutes/getSearchPreference/${userId}`, {
        params: { siteId },
    });
    return res.data;
};

export const getTopSearchTerms = async (userId, siteId, limit = 5) => {
    const res = await api.get('/searchTermsManagementRoutes/getTopSearchTerms', {
        params: { userId, siteId, limit },
    });
    return res.data;
};



import api from './api';

export const historyService = {
    /**
     * Get all chat sessions for the current user.
     * @returns {Promise<Array>} List of sessions
     */
    getSessions: async () => {
        const response = await api.get('/exercise/sessions/');
        return response.data;
    },

    /**
     * Create a new chat session.
     * @returns {Promise<Object>} The new session object
     */
    createSession: async () => {
        const response = await api.post('/exercise/sessions/');
        return response.data;
    },

    /**
     * Get a specific session and its messages.
     * @param {number|string} sessionId
     * @returns {Promise<Object>} The session with messages
     */
    getSessionDetail: async (sessionId) => {
        const response = await api.get(`/exercise/sessions/${sessionId}/`);
        return response.data;
    },

    /**
     * Add a new message (user or assistant) to a specific session.
     * @param {number|string} sessionId
     * @param {string} role 'user' or 'assistant'
     * @param {Object} contentData The message data, payload will be JSON stringified to store more info
     * @returns {Promise<Object>} The newly created message
     */
    addMessage: async (sessionId, role, contentData) => {
        const payload = {
            role: role,
            content: typeof contentData === 'string' ? contentData : JSON.stringify(contentData)
        };
        const response = await api.post(`/exercise/sessions/${sessionId}/`, payload);
        return response.data;
    },

    /**
     * Delete a chat session.
     * @param {number|string} sessionId
     * @returns {Promise<void>}
     */
    deleteSession: async (sessionId) => {
        await api.delete(`/exercise/sessions/${sessionId}/`);
    }
};

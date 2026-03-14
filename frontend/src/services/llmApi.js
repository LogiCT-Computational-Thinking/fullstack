import axios from 'axios';

// Default URL to the FastAPI LLM Engine
const LLM_API_URL = import.meta.env.VITE_LLM_API_URL || 'http://127.0.0.1:8001';

const llmApi = axios.create({
    baseURL: LLM_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const llmService = {
    /**
     * Send a chat message to the LLM Engine tutor.
     * @param {string} message - The user's input message
     * @param {string} sessionId - The user's session ID
     * @param {string} cognitive - The user's cognitive profile code (e.g., '3TGR')
     * @returns {Promise<Object>} - Response containing reply and followup_question
     */
    chat: async (message, sessionId = 'default', cognitive = '3TGR') => {
        try {
            const response = await llmApi.post('/chat', {
                message,
                session_id: sessionId,
                cognitive,
            });
            return response.data;
        } catch (error) {
            console.error('Error in LLM Engine Chat API:', error);
            throw error;
        }
    },
    
    /**
     * Send an answer to be evaluated by the LLM Engine.
     * @param {string} answer - The user's answer
     * @param {string} correctAnswer - The expected correct answer/explanation
     * @param {string} activeQuestion - The question text
     * @param {string} sessionId - The user's session ID
     * @param {string} cognitive - The user's cognitive profile code
     * @param {number} wrongCount - How many times the user has failed this question
     * @returns {Promise<Object>} - Response containing evaluation feedback and hints
     */
    evaluate: async (answer, correctAnswer, activeQuestion, sessionId = 'default', cognitive = '3TGR', wrongCount = 0) => {
        try {
            const response = await llmApi.post('/evaluate', {
                answer,
                correct_answer: correctAnswer,
                active_question: activeQuestion,
                session_id: sessionId,
                cognitive,
                wrong_count: wrongCount,
            });
            return response.data;
        } catch (error) {
            console.error('Error in LLM Engine Evaluate API:', error);
            throw error;
        }
    }
};

export default llmApi;

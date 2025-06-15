import api from './index';

// Map backend snake_case to frontend camelCase
const mapBackendToFrontend = (card) => ({
  id: card.id,
  question: card.question,
  answer: card.answer,
  difficulty: card.difficulty,
  createdAt: card.created_at,
  lastModified: card.last_modified,
  createdBy: card.created_by,
  lastModifiedBy: card.last_modified_by,
  userId: card.user_id,
  user: card.user,
});

// Map frontend camelCase to backend snake_case
const mapFrontendToBackend = (card) => ({
  question: card.question,
  answer: card.answer,
  difficulty: card.difficulty,
});

export const createFlashcard = async (card) => {
  const response = await api.post('/Flashcards', mapFrontendToBackend(card));
  return mapBackendToFrontend(response.data);
};

export const getUserFlashcards = async () => {
  const response = await api.get('/Flashcards/GetUserFlashCards');
  return response.data.map(mapBackendToFrontend);
};

export const getFlashcardById = async (id) => {
  const response = await api.get(`/Flashcards/${id}`);
  return mapBackendToFrontend(response.data);
};

export const getFlashcardsByDifficulty = async (difficulty) => {
  const response = await api.get(`/Flashcards/category/${difficulty}`);
  return response.data.map(mapBackendToFrontend);
};

export const updateFlashcard = async (id, card) => {
  const response = await api.put(`/Flashcards/${id}`, {
    question: card.question,
    answer: card.answer,
  });
  return response.data;
};

export const updateFlashcardDifficulty = async (id, difficulty) => {
  const response = await api.put(`/Flashcards/${id}/difficulty`, null, {
    params: { difficulty },
  });
  return response.data;
};

export const deleteFlashcard = async (id) => {
  const response = await api.delete(`/Flashcards/${id}`);
  return response.data;
}; 
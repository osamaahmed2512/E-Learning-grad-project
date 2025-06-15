import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createFlashcard,
  getUserFlashcards,
  updateFlashcard,
  updateFlashcardDifficulty,
  deleteFlashcard
} from '../api/flashcardApi';
import { toast } from 'react-toastify';
import { progressionRules, progressionMessages } from '../components/student/flashcards/config/flashcardConfig';

const FlashCardContext = createContext();

export const useFlashCard = () => useContext(FlashCardContext);

export const FlashCardProvider = ({ children }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user from localStorage (null if not logged in)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  // Only allow flashcard actions for student users
  const isStudent = user && user.role === 'student';

  // Only fetch flashcards if user is a student
  const fetchFlashcards = useCallback(async () => {
    if (!isStudent) {
      // Not a student: clear flashcards and stop loading
      setFlashcards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const cards = await getUserFlashcards();
      setFlashcards(cards);
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFlashcards([]);
        setError(null); // No error toast for 401
      } else {
        setError('Failed to load flashcards');
        // toast.error('Failed to load flashcards');
      }
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  // Add new flashcard (only if user is a student)
  const handleAddFlashcard = async (card) => {
    if (!isStudent) return;
    try {
      await createFlashcard(card);
      toast.success('Flashcard Created');
      await fetchFlashcards();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFlashcards([]);
        setError(null);
      } else {
        toast.error('Failed to create flashcard');
      }
    }
  };

  // Edit flashcard (only if user is a student)
  const handleUpdateFlashcard = async (id, card) => {
    if (!isStudent) return;
    try {
      await updateFlashcard(id, card);
      toast.success('Flashcard Updated');
      await fetchFlashcards();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFlashcards([]);
        setError(null);
      } else {
        toast.error('Failed to update flashcard');
      }
    }
  };

  // Delete flashcard (only if user is a student)
  const handleDeleteFlashcard = async (id) => {
    if (!isStudent) return;
    try {
      await deleteFlashcard(id);
      toast.success('Flashcard Deleted');
      await fetchFlashcards();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFlashcards([]);
        setError(null);
      } else {
        toast.error('Failed to delete flashcard');
      }
    }
  };

  // Update difficulty (right/wrong answer, only if user is a student)
  const handleUpdateDifficulty = async (id, currentDifficulty, isRight) => {
    if (!isStudent) return;
    const nextDifficulty = isRight
      ? progressionRules.right[currentDifficulty]
      : progressionRules.wrong[currentDifficulty];
    if (!nextDifficulty || nextDifficulty === currentDifficulty) return;
    try {
      await updateFlashcardDifficulty(id, nextDifficulty);
      const msg = isRight
        ? progressionMessages.right[currentDifficulty]
        : progressionMessages.wrong[currentDifficulty];
      toast.info(msg);
      await fetchFlashcards();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFlashcards([]);
        setError(null);
      } else {
        toast.error('Failed to update card difficulty');
      }
    }
  };

  // Get cards by difficulty
  const getFlashcardsByDifficulty = (difficulty) =>
    flashcards.filter((c) => c.difficulty === difficulty);

  return (
    <FlashCardContext.Provider
      value={{
        flashcards,
        loading,
        error,
        fetchFlashcards,
        handleAddFlashcard,
        handleUpdateFlashcard,
        handleDeleteFlashcard,
        handleUpdateDifficulty,
        getFlashcardsByDifficulty,
      }}
    >
      {children}
    </FlashCardContext.Provider>
  );
}; 
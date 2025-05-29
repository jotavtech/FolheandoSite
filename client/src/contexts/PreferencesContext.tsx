import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserPreferences {
  genres: string[];
  authorTypes: string[];
  bookLength: 'short' | 'medium' | 'long' | 'any';
  readingFrequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
  favoriteThemes: string[];
  languagePreference: 'portuguese' | 'english' | 'both';
  moodPreference: 'light' | 'serious' | 'mixed';
}

interface PreferencesContextType {
  preferences: UserPreferences | null;
  setPreferences: (preferences: UserPreferences) => void;
  hasCompletedQuiz: boolean;
  clearPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  genres: [],
  authorTypes: [],
  bookLength: 'any',
  readingFrequency: 'weekly',
  favoriteThemes: [],
  languagePreference: 'portuguese',
  moodPreference: 'mixed'
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('userPreferences');
    return saved ? JSON.parse(saved) : null;
  });

  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(() => {
    return localStorage.getItem('quizCompleted') === 'true';
  });

  useEffect(() => {
    if (preferences) {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      localStorage.setItem('quizCompleted', 'true');
      setHasCompletedQuiz(true);
    }
  }, [preferences]);

  const setPreferences = (newPreferences: UserPreferences) => {
    setPreferencesState(newPreferences);
  };

  const clearPreferences = () => {
    setPreferencesState(null);
    setHasCompletedQuiz(false);
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('quizCompleted');
  };

  return (
    <PreferencesContext.Provider value={{
      preferences,
      setPreferences,
      hasCompletedQuiz,
      clearPreferences
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
} 
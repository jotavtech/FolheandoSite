import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    
    if (userId && userName) {
      setUser({
        id: userId,
        name: userName,
        email: userEmail || ''
      });
    }
  }, []);

  const logout = () => {
    // Limpar dados do usuário do localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('usuario');
    
    // Limpar preferências do quiz
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('quizCompleted');
    
    // Limpar estado do usuário no contexto
    setUser(null);
    
    // Redirecionar para a página inicial
    window.location.href = '/';
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context.user;
}

export function useUserActions() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserActions must be used within a UserProvider');
  }
  return { setUser: context.setUser, logout: context.logout };
} 
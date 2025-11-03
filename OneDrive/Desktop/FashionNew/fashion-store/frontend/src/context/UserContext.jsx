import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, getProfile as getProfileAPI } from '../api/userAPI.js';

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // {_id, name, email, token}
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, token });
        // Verify token by fetching profile
        getProfileAPI()
          .then((profile) => {
            setUser({ ...parsedUser, ...profile });
          })
          .catch(() => {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await loginAPI(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await registerAPI(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      if (userData._id || userData.name || userData.email) {
        localStorage.setItem('user', JSON.stringify({ _id: updated._id, name: updated.name, email: updated.email }));
      }
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};



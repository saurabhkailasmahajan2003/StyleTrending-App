import { createContext, useContext, useState } from 'react';

const ModalContext = createContext(undefined);

export function ModalProvider({ children }) {
  const [showSignInModal, setShowSignInModal] = useState(false);

  const openSignInModal = () => setShowSignInModal(true);
  const closeSignInModal = () => setShowSignInModal(false);

  return (
    <ModalContext.Provider value={{ showSignInModal, openSignInModal, closeSignInModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};


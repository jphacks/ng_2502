import { useContext } from 'react';
import { UserContext } from '../components/ui/UserProvider';

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};

export default useUser;

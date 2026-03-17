import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import installationService from '../services/installation';
import { shallowEqual } from 'react-redux';

export const PathLogout = ({ children }) => {
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const menuActive = useSelector((list) => list.menu.activeMenu, shallowEqual);
  const navigate = useNavigate();

  useEffect(() => {
    // For production, skip installation check
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('Production environment - skipping installation check');
      return;
    }
    
    installationService
      .checkInitFile()
      .then(() => console.log('file found'))
      .catch(() => {
        navigate('/welcome');
      });
  }, []);

  if (user) {
    return <Navigate to={`/${menuActive ? menuActive.url : ''}`} replace />;
  }

  return children;
};

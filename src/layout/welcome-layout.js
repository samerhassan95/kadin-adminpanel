import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { shallowEqual } from 'react-redux';
import installationService from '../services/installation';
import Loading from '../components/loading';

export const WelcomeLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth, shallowEqual);
  const menuActive = useSelector((list) => list.menu.activeMenu, shallowEqual);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // For production, skip installation check and go directly to login
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.log('Production environment - skipping installation check');
      navigate('/');
      return;
    }

    setLoading(true);
    installationService
      .checkInitFile()
      .then(() => navigate('/'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return <Navigate to={`/${menuActive ? menuActive.url : ''}`} replace />;
  }

  return children;
};

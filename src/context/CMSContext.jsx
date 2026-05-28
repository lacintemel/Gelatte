import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const CMSContext = createContext();

export function CMSProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.cms.getPublicSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load CMS settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    settings,
    loading,
    refresh: loadSettings,
    
    // Helper to get a specific key with a fallback
    getSetting: (key, fallback = '') => settings[key] || fallback
  };

  return <CMSContext.Provider value={value}>{children}</CMSContext.Provider>;
}

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) throw new Error('useCMS must be used within a CMSProvider');
  return context;
};

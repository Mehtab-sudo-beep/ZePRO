import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DegreeContextType {
  selectedDegree: 'UG' | 'PG';
  setSelectedDegree: (degree: 'UG' | 'PG') => void;
}

export const DegreeContext = createContext<DegreeContextType>({
  selectedDegree: 'UG',
  setSelectedDegree: () => {},
});

export const DegreeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDegree, setSelectedDegreeState] = useState<'UG' | 'PG'>('UG');

  // Load degree from storage on startup
  useEffect(() => {
    const loadDegree = async () => {
      try {
        const storedDegree = await AsyncStorage.getItem('userDegreePreference');
        if (storedDegree === 'PG' || storedDegree === 'UG') {
          setSelectedDegreeState(storedDegree);
        }
      } catch (e) {
        console.log('Failed to load degree preference', e);
      }
    };
    loadDegree();
  }, []);

  const setSelectedDegree = async (degree: 'UG' | 'PG') => {
    setSelectedDegreeState(degree);
    try {
      await AsyncStorage.setItem('userDegreePreference', degree);
    } catch (e) {
      console.log('Failed to save degree preference', e);
    }
  };

  return (
    <DegreeContext.Provider value={{ selectedDegree, setSelectedDegree }}>
      {children}
    </DegreeContext.Provider>
  );
};

export const useDegree = () => useContext(DegreeContext);

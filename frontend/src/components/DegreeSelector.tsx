import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { useDegree } from '../context/DegreeContext';
import { ThemeContext } from '../theme/ThemeContext';
import { BlurView } from 'expo-blur';

const CHEVRON_DOWN = require('../assets/deadlines/chevron-down.png');
const CHEVRON_DOWN_WHITE = require('../assets/deadlines/chevron-down-white.png');

interface DegreeSelectorProps {
  style?: any;
}

const DegreeSelector: React.FC<DegreeSelectorProps> = ({ style }) => {
  const { selectedDegree, setSelectedDegree } = useDegree();
  const { theme, colors } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => setModalVisible(!modalVisible);

  const selectDegree = (degree: 'UG' | 'PG') => {
    setSelectedDegree(degree);
    setModalVisible(false);
  };

  const chevronSource = isDark ? CHEVRON_DOWN_WHITE : CHEVRON_DOWN;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]} 
        onPress={toggleModal}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>{selectedDegree}</Text>
        <Image 
          source={chevronSource} 
          style={[styles.chevron, { tintColor: colors.text }]} 
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.dropdownMenu, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
            <TouchableOpacity 
              style={[styles.option, selectedDegree === 'UG' && { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
              onPress={() => selectDegree('UG')}
            >
              <Text style={[styles.optionText, { color: colors.text }, selectedDegree === 'UG' && styles.selectedOptionText]}>UG</Text>
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
            
            <TouchableOpacity 
              style={[styles.option, selectedDegree === 'PG' && { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} 
              onPress={() => selectDegree('PG')}
            >
              <Text style={[styles.optionText, { color: colors.text }, selectedDegree === 'PG' && styles.selectedOptionText]}>PG</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  chevron: {
    width: 14,
    height: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownMenu: {
    width: 150,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '700',
    color: '#0056D2', // Primary brand color accent
  },
  divider: {
    height: 1,
    width: '100%',
  }
});

export default DegreeSelector;

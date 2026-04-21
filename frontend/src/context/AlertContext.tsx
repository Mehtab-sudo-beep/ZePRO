import React, { createContext, useState, useContext, ReactNode } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertContextProps {
  showAlert: (title: string, message?: string, buttons?: AlertButton[], duration?: number) => void;
  hideAlert: () => void;
}

export const AlertContext = createContext<AlertContextProps>({
  showAlert: () => {},
  hideAlert: () => {},
});

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const { colors } = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([]);

  const showAlert = (newTitle: string, newMessage = '', newButtons: AlertButton[] = [], duration?: number) => {
    setTitle(newTitle);
    setMessage(newMessage);
    
    const isDefaultButton = newButtons.length === 0;
    if (isDefaultButton) {
      setButtons([{ text: 'OK', onPress: hideAlert }]);
    } else {
      setButtons(newButtons);
    }
    
    setVisible(true);

    // Auto-hide success/info messages after 1 second if they are just notifications (no custom buttons)
    // We avoid auto-hiding errors or warnings to ensure users see them.
    const isSuccessOrInfo = newTitle.includes('Success') || newTitle.includes('✅') || newTitle.includes('Updated') || newTitle.includes('Info');
    const isCritical = newTitle.toLowerCase().includes('error') || newTitle.toLowerCase().includes('failed') || newTitle.toLowerCase().includes('warning');

    if (duration || (isSuccessOrInfo && isDefaultButton && !isCritical)) {
      setTimeout(() => {
        hideAlert();
      }, duration || 1000);
    }
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    hideAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={[styles.alertContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header with Title and Close X */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <TouchableOpacity onPress={hideAlert} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Message */}
            {!!message && (
              <View style={styles.content}>
                <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    { borderColor: colors.border },
                    btn.style === 'destructive' ? { borderColor: '#ef4444' } : null,
                    buttons.length > 1 && index === 0 ? { borderRightWidth: 1 } : null,
                    { flex: 1 }
                  ]}
                  onPress={() => handleButtonPress(btn)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: btn.style === 'cancel' ? colors.subText : btn.style === 'destructive' ? '#ef4444' : colors.primary },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(150,150,150,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
  },
  button: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const LanguageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  return (
    <View style={styles.languagePicker}>
      <TouchableOpacity onPress={toggleDropdown}>
        <Text style={styles.language}>Language</Text>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={() => handleLanguageChange('en')}>
            <Text style={selectedLanguage === 'en' ? styles.selectedLanguage : styles.language}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleLanguageChange('no')}>
            <Text style={selectedLanguage === 'no' ? styles.selectedLanguage : styles.language}>NO</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  languagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  language: {
    color: '#000',
    paddingHorizontal: 10,
  },
  selectedLanguage: {
    color: '#fff',
    paddingHorizontal: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default LanguageDropdown;

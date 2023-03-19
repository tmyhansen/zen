import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ripple from 'react-native-material-ripple';

const PrimaryButton = ({ title, onPress, color }) => {
  const [rippleColor, setRippleColor] = useState('#000000');
  const backgroundColor = color || '#E07A5F';

  return (
    <Ripple
      rippleColor={rippleColor}
      rippleDuration={500}
      onPressIn={() => setRippleColor('rgba(255, 255, 255, 0.2)')}
      onPressOut={() => setRippleColor('#000000'), onPress}
      //onPress={onPress}
      style={[styles.buttonContainer, { backgroundColor }]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Ripple>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 100,
    width: 200,
    height: 50,
    backgroundColor: '#E07A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrimaryButton;

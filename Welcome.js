import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Animated, Button, TouchableOpacity, Text, ImageBackground, Platform, Alert } from 'react-native';
import FastImage from 'expo-fast-image';
import PrimaryButton from './components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { getLang } from './components/translations';
import * as Localization from 'expo-localization';
import { Picker } from '@react-native-picker/picker';

export default function WelcomeScreen({ navigation }) {
  const [fadeAnimation] = useState(new Animated.Value(0));


  // Get the device language
  const deviceLanguage = Localization.locale.split('-')[0];
const supportedLanguages = ['en', 'de', 'es', 'uk', 'fr', 'pl', 'nb', 'no'];
const languageMapping = { 'nb': 'no' };

const language = supportedLanguages.includes(deviceLanguage) ? (languageMapping[deviceLanguage] || deviceLanguage) : 'en';
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const l = getLang(selectedLanguage); // Get the lang object for the current language

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 10,
      useNativeDriver: true,
    }).start(() => {
      // Navigate to the next screen after the animation is complete
      setTimeout(() => {
        navigation.navigate('TaskList', { selectedLanguage });
      }, 100000000);
    });
  }, [fadeAnimation, navigation]);



const goTodo = () => {
  navigation.navigate('TaskList', { selectedLanguage });
};

const goNotTodo = () => {
  navigation.navigate('AntiTaskList', { selectedLanguage });
};

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E07A5F', 'white']}
        start={[0, 0]}
        end={[0, 1]}
        style={styles.gradient}
      />
 <Text style={styles.text}>Zen AI<Text> {"\n"}</Text> <Text style={styles.textRegular}>{l['To-do and not-to-do']}</Text></Text>
    <Text> {"\n"}</Text>
      <Animated.View style={[styles.fadeContainer, { opacity: fadeAnimation }]}>
        <FastImage
          source={require('./zen_ai.png')}
          defaultSource={require('./zen_ai.png')}
          style={styles.image}
          cache={FastImage.cacheControl}
        />
          <Text> {"\n"}</Text>
          <PrimaryButton title={l['To-do']} onPress={goTodo} />
          <Text> {"\n"}</Text>
          <PrimaryButton title={l['Not-to-do']} onPress={goNotTodo} />

      </Animated.View>

    </View>
  );
  
}

WelcomeScreen.navigationOptions = {
  headerTransparent: true,
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B7D7D8',
  },
  pick: {
    color: "white"
  },
  text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold'
  },
  textRegular: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 16,
    color: 'white',
    fontWeight: 'normal'
  },
  fadeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
    gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
languagePicker: {
  flexDirection: 'row',
  marginTop: 20,
},

language: {
  color: 'white',
  fontSize: 16,
  marginHorizontal: 10,
},
selectedLanguage: {
  color: 'white',
  fontSize: 16,
  textDecorationLine: 'underline',
  marginHorizontal: 10,
},
  image: {
    width: 130,
    height: 180,
    resizeMode: 'contain',
    borderRadius: 0,
  },
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    paddingRight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});

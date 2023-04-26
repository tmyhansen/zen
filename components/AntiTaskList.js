import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Platform, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from './../components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { getLang } from "./translations";
import * as Localization from 'expo-localization';

const AntiTaskList = ({ navigation, route }) => {
  const [antiListValue, setAntiListValue] = useState('');
  const [antiListParam, setAntiListParam] = useState('Week');
  const [antiListParams, setAntiListParams] = useState(['Week']);
  const [antiCheckedItems, setAntiCheckedItems] = useState({});
  const [shouldConvert, setShouldConvert] = useState(false);
  const [height, setHeight] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [hideInput, setHideInput] = useState(false);
  const [doneEdit, setDoneEdit] = useState(false);
  const [editCheckbox, setEditCheckbox] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const isMounted = useRef(false);

  const retrieveDataOnComponentInit = async (antiListParam) => {
    try {
      // Retrieve antiListParam, antiListParams, antiListValue and antiCheckedItems from AsyncStorage
      const storedAntiListParam = await AsyncStorage.getItem('antiListe') ?? 'Week';
      const storedAntiListParams = await AsyncStorage.getItem('antiListParams');
      const storedAntiListValue = await AsyncStorage.getItem(`antiListValue_${storedAntiListParam}`);
      const storedAntiCheckedItems = await AsyncStorage.getItem(`antiCheckedItems_${storedAntiListParam}`);
      // Update the state for antiListParam
      if (storedAntiListParam) {
        setAntiListParam(storedAntiListParam);
        loadImageForAntiListParam(storedAntiListParam === "Week" ? "Hipster man holding a calendar" : storedAntiListParam);
      }

      // Update the state for antiListParams
      if (storedAntiListParams) {
        setAntiListParams(storedAntiListParams.split(','));
      } else {
        saveAntiListParamsToAsyncStorage(['Week']);
        setAntiListParams(['Week']);
      }

      // Update the state for antiListValue
      if (storedAntiListValue) {
        setAntiListValue(storedAntiListValue);
        setDoneEdit(true)
        setHideInput(true)
      } else {
        setAntiListValue('');
      }

      // Update the state for antiCheckedItems
      if (storedAntiCheckedItems) {
        setAntiCheckedItems(JSON.parse(storedAntiCheckedItems));
      } else {
        setAntiCheckedItems({});
      }
      const deleteAndRenameItems = async () => {
        try {
          // Delete the antiCheckedItems_Week item
          await AsyncStorage.removeItem('antiCheckedItems_Week');

          // Get the antiCheckedItemsWeek item
          const antiCheckedItemsWeek = await AsyncStorage.getItem('antiCheckedItemsWeek');

          // If antiCheckedItemsWeek exists, set it to antiCheckedItems_Week and remove the old item
          if (antiCheckedItemsWeek) {
            await AsyncStorage.setItem('antiCheckedItems_Week', antiCheckedItemsWeek);
            await AsyncStorage.removeItem('antiCheckedItemsWeek');
            setAntiCheckedItems(JSON.parse(antiCheckedItemsWeek));
          }
        } catch (error) {
          console.error('Error deleting and renaming items:', error);
        }
      };

      // Call the function to perform the delete and rename operation
      deleteAndRenameItems();


    } catch (error) {
      console.error(`Error retrieving data on component init: ${error}`);
    }

  };

  // Save the current antiList value to AsyncStorage
  const saveAntiListValueAndParamsToAsyncStorage = async (antiListParam, antiListValue) => {
    try {
      await AsyncStorage.setItem(`antiListValue_${antiListParam}`, antiListValue);
      if (!antiListParams.includes(antiListParam)) {
        saveAntiListParamsToAsyncStorage([...antiListParams, antiListParam]);
        setAntiListParams([...antiListParams, antiListParam]);
      }
      saveAntiListParamToAsyncStorage(antiListParam);
    } catch (error) {
      console.error(`Error saving antiList value to AsyncStorage for antiListParam ${antiListParam}: ${error}`);
    }
  };

  const saveAntiListValueToAsyncStorage = async (antiListParam, antiListValue) => {
    try {
      await AsyncStorage.setItem(`antiListValue_${antiListParam}`, antiListValue);
    } catch (error) {
      console.error(`Error saving antiList value to AsyncStorage for antiListParam ${antiListParam}: ${error}`);
    }
  };

  // Get the antiList value from AsyncStorage based on the current antiListParam
  const getAntiListValueFromAsyncStorage = async (antiListParam, setAntiListValue) => {
    try {
      const storedAntiListValue = await AsyncStorage.getItem(`antiListValue_${antiListParam}`);
      if (storedAntiListValue) {
        setAntiListValue(storedAntiListValue);
      } else {
        setAntiListValue('');
      }
    } catch (error) {
      console.error(`Error getting antiList value from AsyncStorage for antiListParam ${antiListParam}: ${error}`);
    }
  };

  // Save the current antiListParam to AsyncStorage
  const saveAntiListParamToAsyncStorage = async (antiListParam) => {
    try {
      await AsyncStorage.setItem('antiListe', antiListParam);
    } catch (error) {
      console.error(`Error saving antiListParam to AsyncStorage: ${error}`);
    }
  };

  // Get the current antiListParam from AsyncStorage
  const getAntiListParamFromAsyncStorage = async (setAntiListParam) => {
    try {
      const storedAntiListParam = await AsyncStorage.getItem('antiListe');
      if (storedAntiListParam) {
        setAntiListParam(storedAntiListParam);
      }
    } catch (error) {
      console.error(`Error getting antiListParam from AsyncStorage: ${error}`);
    }
  };

  // Save the antiListParams to AsyncStorage
  const saveAntiListParamsToAsyncStorage = async (antiListParams) => {
    try {
      await AsyncStorage.setItem('antiListParams', antiListParams.join(','));
    } catch (error) {
      console.error(`Error saving antiListParams to AsyncStorage: ${error}`);
    }
  };

  // Get the antiListParams from AsyncStorage
  const getAntiListParamsFromAsyncStorage = async (setAntiListParams) => {
    try {
      const storedAntiListParams = await AsyncStorage.getItem('antiListParams');
      if (storedAntiListParams) {
        setAntiListParams(storedAntiListParams.split(','));
      }
    } catch (error) {
      console.error(`Error getting antiListParams from AsyncStorage: ${error}`);
    }
  };

  async function logAllData() {
    c(imageURL)
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);

      console.log('_____________Start_________________');
      allData.forEach(data => {
        console.log(data[0], ':', data[1]);
      });
      console.log('______________End________________');
    } catch (e) {
      console.log("Error getting all data from AsyncStorage:", e);
    }
  }

  const { selectedLanguage } = route.params || { selectedLanguage: 'en' };
  // Get the device language
  const deviceLanguage = Localization.locale.split('-')[0];
  const supportedLanguages = ['en', 'de', 'es', 'uk', 'fr', 'pl'];
  const languageMapping = { 'nb': 'no' };

  const language = supportedLanguages.includes(deviceLanguage) ? (languageMapping[deviceLanguage] || deviceLanguage) : 'en';
  const [selectedLanguageState, setSelectedLanguageState] = useState(selectedLanguage);
  const l = getLang(selectedLanguage); // Get the lang object for the current language

  useEffect(() => {
    navigation.setOptions({ title: selectedLanguage === 'no' ? "Ikke gjøre" : "Do" });
  }, [selectedLanguage, navigation, l]);

  useEffect(() => {
    setSelectedLanguageState(selectedLanguage)
  }, [selectedLanguage]);

  useEffect(() => {
    if (isMounted.current) {
      console.log("AntiListParams updated: " + antiListParams + " (triggered on update)");
    } else {
      console.log("AntiListParams updated: " + antiListParams + " (triggered on mount)");
      isMounted.current = true;
    }
  }, [antiListParams]);

  useEffect(() => {
    if (isMounted.current && antiCheckedItems && Object.keys(antiCheckedItems).length > 0) {
      AsyncStorage.setItem(`antiCheckedItems_${antiListParam}`, JSON.stringify(antiCheckedItems));
    }
    if (antiListParam === "Week" && antiCheckedItems && Object.keys(antiCheckedItems).length > 0) {
      AsyncStorage.setItem(`antiCheckedItemsWeek`, JSON.stringify(antiCheckedItems));
    }

  }, [antiCheckedItems]);

  const loadAntiCheckedItems = async () => {

    const storedAntiCheckedItems = await AsyncStorage.getItem(`antiCheckedItems_${antiListParam}`);
    if (storedAntiCheckedItems) {
      setAntiCheckedItems(JSON.parse(storedAntiCheckedItems));
    } else {
      setAntiCheckedItems({});
    }
  };


  const saveAntiListValue = () => {

    if (antiListValue.toLowerCase() === "monday") {
      setAntiListValue("Monday \n- ")
    }
    if (antiListValue.includes("undefined")) {
      setAntiListValue(antiListValue.replace('undefined', ""))
    }
    saveAntiListValueAndParamsToAsyncStorage(antiListParam, antiListValue)
    //AsyncStorage.setItem(`antiListValue_${antiListParam}`, antiListValue);

    loadAntiCheckedItems();
  };

  const showErrorAlert = () => {
    Alert.alert(
      l['Whoops!'], // Title
      l['Try a shorter prompt or remove special characters'],
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false }
    );
  };

const generateImage = async (prompt) => {
  // setImageURL("")
  // try {
  //   const response = await fetch('https://innoonni.000webhostapp.com/AI_image.php', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: `prompt=${encodeURIComponent(prompt)}`,
  //   });

  //   const data = await response.json();

  //   if (data && data.data.length > 0) {
  //     const imageURL = data.data[0].url;
  //     setImageURL(imageURL);

  //     // Save the image URL to AsyncStorage
  //     await AsyncStorage.setItem(`image_${antiListParam}`, imageURL);
  //   } else {
  //     console.error('No image generated');
  //   }
  // } catch (error) {
  //   console.error('Error generating image:', error);
  // }
};

  const translate = async (text) => {

    // const requestOptions = {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: `txt=${encodeURIComponent("Translate the following text to English: " + text)}`
    // };


    // fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
    //   .then(response => response.text())
    //   .then(data => {
    //     generateImage(data)
    //     //return data;

    //   })
    //   .catch(error => {
    //     console.error('Error:', error);
    //     //return text;
    //   });
  };

  const handlePrompt = () => {
    setIsLoading(true);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: antiListParam === 'Week' ? `txt=${encodeURIComponent(l["Create a to-do antiList in the following format: Day of the week - To-do. Distribute the tasks in a rational manner over the 7-day week; Some days may be empty if there are few to-dos; To-dos:"] + antiListValue.replace(/[\r\n]+|\s{2,}/g, ' '))}` : `txt=${encodeURIComponent(l["Create a to-do antiList (seperate with - and a space) for how to achieve the following task based on best practices in its field: "] + antiListParam.replace(/[\r\n]+|\s{2,}/g, ' ') + (antiListValue !== '' && " " + antiListValue))}`
    };


    fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
      .then(response => response.text())
      .then(data => {
        console.log(data)
        if (!data.includes('Undefined property')) {
          const stringWithDaysHyphen = data.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mandag|Tirsdag|Onsdag|Torsdag|Fredag|Lørdag|Søndag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo|Понеділок|Вівторок|Середа|Четвер|Пʼятниця|Субота|Неділя|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche|Poniedziałek|Wtorek|Środa|Czwartek|Piątek|Sobota|Niedziela):/gi, '$1 -');
          let a = stringWithDaysHyphen.replace(/(—|–)/g, '-')
          let b = a.replace(/-/g, '\n-')
          let c = b.replace(/.*(Monday|Mandag|Montag|Lunes|Понеділок|Lundi|Poniedziałek)/, "$1")

          let e = antiListParam === 'Week' ? rearrangeTasks(c) : c
          setHideInput(true)
          setAntiListValue(e)
          saveAntiListValueToAsyncStorage(antiListParam, e)
          setDoneEdit(true)
        } else {
          showErrorAlert()
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        showErrorAlert()
        setIsLoading(false);
      });
  };

  useEffect(() => {
    retrieveDataOnComponentInit("Week");
  }, []);

  useEffect(() => {
    setDoneEdit(!antiListValue.includes('-'));
    if(antiListValue.includes("undefined")){
      setAntiListValue(antiListValue.replace(/undefined/g, ""));
    }
  }, [antiListValue]);

  useEffect(() => {
    // Save the antiList of antiList parameters to AsyncStorage
    if (!isMounted.current) {
      AsyncStorage.setItem('antiListParams', antiListParams.join(','));
    }

  }, [antiListParams]);

  const c = (f: any) => {
    console.log(f)
  }

  useEffect(() => {
    if (antiListParam !== '' && antiCheckedItems) {
      AsyncStorage.setItem(`antiCheckedItems_${antiListParam}`, JSON.stringify(antiCheckedItems));
    }
  }, [antiCheckedItems]);

  const daysMapping = {
    en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    no: ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'],
    de: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    uk: ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'Пʼятниця', 'Субота', 'Неділя'],
    fr: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    pl: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
  };

  const rearrangeTasks = (tasksString) => {
    const days = daysMapping[selectedLanguageState] || daysMapping.en;
    const tasksByDay = tasksString.split('\n').reduce((acc, line) => {
      const dayIndex = days.findIndex(day => line.startsWith(day));
      if (dayIndex !== -1) {
        acc[dayIndex] = line + '\n';
      } else {
        acc[dayIndex === -1 ? acc.length - 1 : dayIndex] += line + '\n';
      }
      return acc;
    }, []);

    const todayIndex = (new Date().getDay() + 6) % 7;
    const tasksBeforeToday = tasksByDay.slice(0, todayIndex).flatMap(dayTasks => dayTasks.split('\n').filter(task => task.startsWith('- ')));
    const remainingDays = days.length - todayIndex;

    tasksByDay.slice(0, todayIndex).forEach((_, index) => (tasksByDay[index] = days[index] + '\n'));

    if (tasksBeforeToday.length > 0) {
      tasksBeforeToday.forEach((task, index) => {
        const dayIndex = (todayIndex + index % remainingDays) % days.length;
        tasksByDay[dayIndex] += task + '\n';
      });
    }

    return tasksByDay.join('');
  };


  const handleCheckboxChange = (id, antiChecked) => {
    // Update the antiChecked state of the checkbox in state
    setAntiCheckedItems((prevItems) => ({ ...prevItems, [id]: antiChecked }));

    // Uncheck all other items with the same label
    const value = id.split('-')[1]; // Get the label value
    const items = antiListValue.split('\n');

    for (const item of items) {
      if (item.startsWith('-') && item.replace(/-|\s*:$/g, '') === value) {
        const otherIndex = items.indexOf(item);
        const otherId = `item-${otherIndex}`;
        if (otherId !== id) {
          setAntiCheckedItems((prevItems) => ({ ...prevItems, [otherId]: false }));
        }
      }
    }
  };

  const handleRefresh = () => {
    handlePrompt();
    setEditCheckbox(false)
  };

  const handleLinkPress = (param) => {
    setImageURL("")
    loadImageForAntiListParam(param)
    logAllData()
    getAntiListValueFromAsyncStorage(param, setAntiListValue);
    saveAntiListParamToAsyncStorage(param)
    setAntiListParam(param);
    setEditCheckbox(false)
    //getcheckteditems
  };

  useEffect(() => {
    loadAntiCheckedItems();
  }, [antiListParam, antiListValue]);

  const loadImageForAntiListParam = async (prompt) => {
    setImageURL("")
    try {
      const storedImageURL = await AsyncStorage.getItem(`image_${prompt}`);
      if (storedImageURL) {
        setImageURL(storedImageURL);
      }else{
        translate(prompt)
      }
    } catch (error) {
      console.error('Error loading image for antiListParam:', error);
    }
  };


  const handleAntiListValueChange = (value) => {
    setAntiListValue(value);
  };

  const handleAntiListValueBlur = () => {
    saveAntiListValueAndParamsToAsyncStorage(antiListParam, antiListValue);
  };

  const handleTextInputSubmit = () => {
    setShouldConvert(antiListValue.trim().startsWith('-'));
  };

  const clearAntiList = async () => {
    try {
      await AsyncStorage.setItem(`antiListValue_${antiListParam}`, '');
      setAntiListValue('');
      await AsyncStorage.setItem(`antiCheckedItems_${antiListParam}`, {});
      setAntiCheckedItems({});
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  const clearAll = async () => {
    try {
      await AsyncStorage.clear();
      setAntiListValue("");
      setAntiListParams(['Week']);
      setAntiListParam("Week");
      setAntiCheckedItems({});
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

const getRandomPlaceholder = () => {
const sentences = [
'What habits do you want to avoid this week?',
    'What do you want to eliminate from your routine this week?',
    'What do you want to stop doing this week?',
    'What bad habits do you want to break this week?',
    'What do you want to cut out of your schedule this week?',
    'What do you want to say no to this week?',
    'What do you want to resist this week?',
    'What do you want to abstain from this week?',
    'What do you want to refrain from doing this week?',
    'What do you want to give up this week?',
    'What do you want to let go of this week?',
    'What do you want to release this week?',
    'What do you want to avoid this week to stay focused?',
    'What do you want to avoid this week to stay on track?',
    'What distractions do you want to avoid this week?',
    'What temptations do you want to avoid this week?',

  ];

const sentencesNo = [
'What habits do you want to avoid this week?',
    'What do you want to eliminate from your routine this week?',
    'What do you want to stop doing this week?',
    'What bad habits do you want to break this week?',
    'What do you want to cut out of your schedule this week?',
    'What do you want to say no to this week?',
    'What do you want to resist this week?',
    'What do you want to abstain from this week?',
    'What do you want to refrain from doing this week?',
    'What do you want to give up this week?',
    'What do you want to let go of this week?',
    'What do you want to release this week?',
    'What do you want to avoid this week to stay focused?',
    'What do you want to avoid this week to stay on track?',
    'What distractions do you want to avoid this week?',
    'What temptations do you want to avoid this week?',

  ];

    const randomIndex = Math.floor(Math.random() * sentences.length);
    return (
      selectedLanguageState === "en"
        ? sentences[randomIndex]
        : selectedLanguageState === "no"
          ? sentencesNo[randomIndex]
          : selectedLanguageState === "de"
            ? sentencesDe[randomIndex]
            : selectedLanguageState === "fr"
              ? sentencesFr[randomIndex]
              : selectedLanguageState === "es"
                ? sentencesEs[randomIndex]
                : selectedLanguageState === "uk"
                  ? sentencesUk[randomIndex]
                  : selectedLanguageState === "pl"
                    ? sentencesPl[randomIndex]
                    : sentences[randomIndex]
    );
  }

  const AntiListItems = () => {
    const items = antiListValue
      .split('\n')
      .map((label, index) => ({ key: `item-${index}`, label }));

    const renderItem = (item, index) => {
      if (item.label.startsWith('-')) {
        const id = `item-${index}`;
        const value = item.label.replace(/-|\s*:$/g, '').trim();
        return (<View>
          {
            editCheckbox == id ?
              (
                <View style={[styles.editButtonsContainer, { flex: 0 }]}>
                  {!antiListParams.includes(value.trim()) ?
                  <TouchableOpacity onPress={() => newAntiList(value.trim())}>
                    <Text style={styles.arrowButton}>+</Text>
                  </TouchableOpacity>
                  :
                   <TouchableOpacity onPress={() => handleLinkPress(value)}>
                    <Text style={styles.arrowButton}>➜</Text>
                  </TouchableOpacity>
                  }
                  <View>
                    <Text> </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteItem(index)}>
                    <Text style={styles.arrowButton}>x</Text>
                  </TouchableOpacity>
                </View>
              ) : null
          }
          <View style={styles.checkboxContainer} key={index}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flex: 1}}>
              <BouncyCheckbox
                size={35}
                fillColor="#4F7942"
                unfillColor="#FFFFFF"
                text={value}
                iconStyle={{ borderColor: "white" }}
                innerIconStyle={{ borderWidth: 0 }}
                textStyle={{ fontFamily: "Roboto", width: 280, flexWrap: 'wrap' }}
                isChecked={antiCheckedItems[id] === 'true' || antiCheckedItems[id] === true}
                onPress={(isChecked) => handleCheckboxChange(id, isChecked)}
              />
            </View>
            {editCheckbox == id ? (
              <View style={[styles.arrowButtonsContainer, { flex: 0 }]}>
                <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
                  <Text style={styles.arrowButton}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
                  <Text style={styles.arrowButton}>↓</Text>
                </TouchableOpacity>
              </View>
            ) :
              <View style={[styles.arrowButtonsContainer, { flex: 0 }]}>
                <TouchableOpacity onPress={() => setEditCheckbox(id)}>
                  <Text style={styles.arrowButton}>✎</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </View>
        );
      } else {
        if (isPastDay(item.label)) {
          return (
            <Text style={[styles.label, styles.strikethrough]} key={index}>
              {item.label}
            </Text>
          );
        } else {
          return (
            <Text style={styles.label} key={index}>
              {item.label}
            </Text>
          );
        }
      }
    };

    const updateAntiListValue = async (param, value) => {
      try {
        await AsyncStorage.setItem(`antiListValue_${param}`, value);
        setAntiListValue(value);
      } catch (error) {
        console.error(error);
      }
    };

    const getAntiListValue = async (param) => {
      try {
        const value = await AsyncStorage.getItem(`antiListValue_${param}`);
        return value;
      } catch (error) {
        console.error(error);
      }
    };

    const newAntiList = async (newAntiListName) => {
      if (antiListParams.includes(newAntiListName)) {
        console.warn(`AntiList with the name "${newAntiListName}" already exists.`);
        return;
      }
      loadImageForAntiListParam(newAntiListName)
      setAntiListParam(newAntiListName);
      setDoneEdit(false);
      setHideInput(false);

      // Update antiListParams if the new antiListParam does not exist
      if (!antiListParams.includes(newAntiListName)) {
        const updatedAntiListParams = [...antiListParams, newAntiListName];
        setAntiListParams(updatedAntiListParams);
        saveAntiListParamsToAsyncStorage(updatedAntiListParams);
      }

      AsyncStorage.getItem(`antiListValue_${newAntiListName}`)
        .then((storedAntiListValue) => {
          if (storedAntiListValue) {
            updateAntiListValue(newAntiListName, storedAntiListValue);
          } else {
            saveAntiListValueAndParamsToAsyncStorage(newAntiListName, '');
            updateAntiListValue(newAntiListName, '');
          }
        })
        .catch((error) => {
          console.error(`Error getting antiList value from AsyncStorage for antiListParam ${newAntiListName}: ${error}`);
        });
    };

const deleteItem = async (index) => {
  const newItems = [...antiListValue.split('\n')];
  newItems.splice(index, 1);
  setAntiListValue(newItems.join('\n'));

  // Update antiCheckedItems
  const newAntiCheckedItems = {};

  // Reassign the antiChecked state of items
  Object.entries(antiCheckedItems).forEach(([key, antiChecked]) => {
    const itemIndex = parseInt(key.split('-')[1]);
    if (itemIndex < index) {
      newAntiCheckedItems[key] = antiChecked;
    } else if (itemIndex > index) {
      const newKey = `item-${itemIndex - 1}`;
      newAntiCheckedItems[newKey] = antiChecked;
    }
  });

  setAntiCheckedItems(newAntiCheckedItems);

  // Update antiCheckedItems in AsyncStorage
  try {
    await AsyncStorage.setItem(`antiCheckedItems_${antiListParam}`, JSON.stringify(newAntiCheckedItems));
  } catch (error) {
    console.error('Error updating antiCheckedItems in AsyncStorage:', error);
  }
  logAllData()
};


    const days = daysMapping[selectedLanguageState] || daysMapping.en;
    const todayIndex = (new Date().getDay() + 6) % 7;

    const isPastDay = (day) => {
      const dayIndex = days.findIndex((d) => d === day);
      return dayIndex !== -1 && dayIndex < todayIndex;
    };

const moveItem = (fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= antiListValue.split('\n').length) {
    return;
  }
  setEditCheckbox(`item-${toIndex}`);
  // Move the item in antiListValue
  const items = antiListValue.split('\n');
  const itemToMove = items[fromIndex];
  items.splice(fromIndex, 1);
  items.splice(toIndex, 0, itemToMove);
  setAntiListValue(items.join('\n'));

  // Update antiCheckedItems state
  const fromId = `item-${fromIndex}`;
  const toId = `item-${toIndex}`;
  const fromAntiChecked = antiCheckedItems[fromId];
  const toAntiChecked = antiCheckedItems[toId];

  setAntiCheckedItems(prevItems => {
    // Create a shallow copy of prevItems
    const newItems = { ...prevItems };

    // Update the antiCheckedItems state with the new positions
    delete newItems[fromId];
    delete newItems[toId];
    newItems[toId] = fromAntiChecked;
    newItems[fromId] = toAntiChecked;

    return newItems;
  });
  logAllData()
};


    return (
      <View style={styles.checkboxes}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    );
  };

  const renderButton = () => {
    if (isLoading) {
      return <PrimaryButton title={`${l["Loading"]}${dots}`} onPress={c('f')} />;
    }

    if (hideInput) {
      return (
        <PrimaryButton
          title={l["Edit list"]}
          onPress={() => {
            setHideInput(false);
            setDoneEdit(false);
          }}
        />
      );
    }

    if (antiListValue.includes("-")) {
      return (
        <PrimaryButton
          title={l["Save"]}
          onPress={() => {
            setHideInput(true);
            saveAntiListValue();
          }}
        />
      );
    } else {
      return (
        <PrimaryButton
          title={l["AI generate list"]}
          onPress={() => {
            handleRefresh();
          }}
        />
      );
    }
  };

  function capitalize(str) {
    if (!str || typeof str !== 'string') {
      return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  const dots = "...";
  return (
    <View style={[styles.container, { position: 'relative', height: '100%' }]}>
      {Platform.OS !== "ios" &&
        <LinearGradient
          colors={['#ffe6e6', '#fcffe9']}
          start={[0, 0]}
          end={[0, 1]}
          style={[styles.gradient, { height: '100%' }]}
        />
      }
      <ScrollView keyboardShouldPersistTaps={'always'} style={[styles.container, { position: 'relative', margin: 10 }]}>
        {!hideInput &&
          <TextInput
            style={[styles.textInput, { height: Math.max(100, height) }]}
            multiline={true}
            placeholder={antiListParam === 'Week' ? (selectedLanguage === "no" ? "Hvilke dårlige vaner ønsker du å unngå denne uken?" : getRandomPlaceholder()) : l['How will you approach breaking this habit?']}
            value={antiListValue}
            onChangeText={handleAntiListValueChange}
            onBlur={handleAntiListValueBlur}
            onSubmitEditing={handleTextInputSubmit}
          />

        }
        <View style={styles.center}>
          {renderButton()}
          <PrimaryButton title={l["Clear all"]} onPress={() => {
            antiListValue === "" ? clearAll() : clearAntiList()
            setHideInput(false);
            //setDoneEdit(true);
          }} color="#0A5A6C" />
        </View>
        <View style={styles.antiListLinks}>
          {antiListParams.map((param, index) => (
            <Text style={param === antiListParam ? styles.linkCurrent : styles.link} key={index} onPress={() => handleLinkPress(param)}>
              {capitalize(l[param])}
            </Text>
          ))}
        </View>
        <AntiListItems />
      </ScrollView>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  editContainer: {
    backgroundColor: 'white'
  },
  center: {
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  textInput: {
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    borderColor: 'transparent',
  },
  antiListLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 10
  },
  link: {
    marginRight: 10,
    marginBottom: 10,
    color: '#3D405B',
    textDecorationLine: 'underline',
  },
  linkCurrent: {
    marginRight: 10,
    marginBottom: 10,
    color: '#3D405B',
    textDecorationLine: 'bold',
  },
  checkboxes: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Roboto',
    //fontWeight: 'bold',
    color: '#0A5A6C',
    maxWidth: '80%'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  arrowButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20
  },
  arrowButton: {
    fontSize: 18,
    paddingHorizontal: 5,
    color: '#777',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    padding: 2,
  },
});

export default AntiTaskList;
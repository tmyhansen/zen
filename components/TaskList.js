import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Platform, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import FastImage from "expo-fast-image";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from './../components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { getLang } from "./translations";
import * as Localization from 'expo-localization';

const TaskList = ({ navigation, route }) => {
  const [listValue, setListValue] = useState('');
  const [listParam, setListParam] = useState('Week');
  const [listParams, setListParams] = useState(['Week']);
  const [checkedItems, setCheckedItems] = useState({});
  const [shouldConvert, setShouldConvert] = useState(false);
  const [height, setHeight] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [hideInput, setHideInput] = useState(false);
  const [doneEdit, setDoneEdit] = useState(false);
  const [editCheckbox, setEditCheckbox] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [images, setImages] = useState([]);
  const isMounted = useRef(false);
  const abortControllerRef = useRef(new AbortController());

  const setImageData = (newListParam, newImageUrl) => {
    const existingImage = images.find(image => image.listParam === newListParam);

    if (!existingImage) {
      const updatedImages = [...images, { listParam: newListParam, imageUrl: newImageUrl }];
      setImages(updatedImages);
      saveImagesToStorage(updatedImages);
    }
  };

useEffect(() => {
  retrieveDataOnComponentInit("Week");
  loadImagesFromStorage();
}, []);

  const getImageUrlByListParam = (searchListParam) => {
    const foundImage = images.find(image => image.listParam === searchListParam);
    
    if (foundImage) {
      return foundImage.imageUrl;
    }
    setImageURL("")
    return null;
  };

// Save images to AsyncStorage
const saveImagesToStorage = async (images) => {
  try {
    await AsyncStorage.setItem('images', JSON.stringify(images));
  } catch (error) {
    console.error('Error saving images to AsyncStorage:', error);
  }
};

// Load images from AsyncStorage
const loadImagesFromStorage = async () => {
  try {
    const imagesString = await AsyncStorage.getItem('images');
    if (imagesString !== null) {
      setImages(JSON.parse(imagesString));
    }
  } catch (error) {
    console.error('Error loading images from AsyncStorage:', error);
  }
};  

  useEffect(() => {
    const lastListParam = listParams[listParams.length - 1];
    if(getImageUrlByListParam(lastListParam) === null){
      translateAndGenerateImage(lastListParam, lastListParam);
    }
  }, [listParams]);

  useEffect(() => {
    c(images)
    const l = getImageUrlByListParam(listParam);
    if(l !== null && listParam !== ""){
      setImageURL(l)
          c(l + imageURL)
    }
     return () => {
      abortControllerRef.current.abort();
    };

  }, [listParam]);

  async function logAllData() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);

      //console.log('_____________Start_________________');
      allData.forEach(data => {
        //console.log(data[0], ':', data[1]);
      });
      //console.log('______________End________________');
    } catch (e) {
      //console.log("Error getting all data from AsyncStorage:", e);
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
    navigation.setOptions({ title: selectedLanguage === 'no' ? "Gjøre" : "Do" });
  }, [selectedLanguage, navigation, l]);

  useEffect(() => {
    setSelectedLanguageState(selectedLanguage)
  }, [selectedLanguage]);

  // useEffect(() => {
  //  //c("____REACT STATE START____")
  //  //c(listValue)
  //  //c(listParam)
  //      //c(imageURL)
  //  //c(listParams)
  //  //c(checkedItems)
  //  //c("____REACT END____")
  //   logAllData()
  // }, [listValue, listParam, listParams, checkedItems, imageURL]);

  

  const retrieveDataOnComponentInit = async (listParam) => {
    try {

      // Retrieve listParam, listParams, listValue and checkedItems from AsyncStorage
      const storedListParam = await AsyncStorage.getItem('liste') ?? 'Week';
      const storedListParams = await AsyncStorage.getItem('listParams');
      const storedListValue = await AsyncStorage.getItem(`listValue_${storedListParam}`);
      const storedCheckedItems = await AsyncStorage.getItem(`checkedItems_${storedListParam}`);
      // Update the state for listParam
      if (storedListParam) {
        setListParam(storedListParam);
        // if(storedListParam !== "Week"){
        //   loadImageForListParam(storedListParam)
        // }
      }

      // Update the state for listParams
      if (storedListParams) {
        setListParams(storedListParams.match(/([^,\s]+(?:\s+[^,\s]+)*)/g));
      } else {
        saveListParamsToAsyncStorage(['Week']);
        setListParams(['Week']);
      }

      // Update the state for listValue
      if (storedListValue) {
        setListValue(storedListValue);
        setDoneEdit(true)
        setHideInput(true)
      } else {
        setListValue('');
      }

      // Update the state for checkedItems
      if (storedCheckedItems) {
        setCheckedItems(JSON.parse(storedCheckedItems));
      } else {
        setCheckedItems({});
      }
      const deleteAndRenameItems = async () => {
        try {
          // Delete the checkedItems_Week item
          await AsyncStorage.removeItem('checkedItems_Week');

          // Get the checkedItemsWeek item
          const checkedItemsWeek = await AsyncStorage.getItem('checkedItemsWeek');

          // If checkedItemsWeek exists, set it to checkedItems_Week and remove the old item
          if (checkedItemsWeek) {
            await AsyncStorage.setItem('checkedItems_Week', checkedItemsWeek);
            await AsyncStorage.removeItem('checkedItemsWeek');
            setCheckedItems(JSON.parse(checkedItemsWeek));
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

  // Save the current list value to AsyncStorage
  const saveListValueAndParamsToAsyncStorage = async (listParam, listValue) => {
    try {
      await AsyncStorage.setItem(`listValue_${listParam}`, listValue);
      if (!listParams.includes(listParam)) {
        saveListParamsToAsyncStorage([...listParams, listParam]);
        setListParams([...listParams, listParam]);
      }
      saveListParamToAsyncStorage(listParam);
    } catch (error) {
      console.error(`Error saving list value to AsyncStorage for listParam ${listParam}: ${error}`);
    }
  };

  const saveListValueToAsyncStorage = async (listParam, listValue) => {
    try {
      await AsyncStorage.setItem(`listValue_${listParam}`, listValue);
    } catch (error) {
      console.error(`Error saving list value to AsyncStorage for listParam ${listParam}: ${error}`);
    }
  };

  // Get the list value from AsyncStorage based on the current listParam
  const getListValueFromAsyncStorage = async (listParam, setListValue) => {
    try {
      const storedListValue = await AsyncStorage.getItem(`listValue_${listParam}`);
      if (storedListValue) {
        setListValue(storedListValue);
      } else {
        setListValue('');
      }
    } catch (error) {
      console.error(`Error getting list value from AsyncStorage for listParam ${listParam}: ${error}`);
    }
  };

  // Save the current listParam to AsyncStorage
  const saveListParamToAsyncStorage = async (listParam) => {
    try {
      await AsyncStorage.setItem('liste', listParam);
    } catch (error) {
      console.error(`Error saving listParam to AsyncStorage: ${error}`);
    }
  };

  // Get the current listParam from AsyncStorage
  const getListParamFromAsyncStorage = async (setListParam) => {
    try {
      const storedListParam = await AsyncStorage.getItem('liste');
      if (storedListParam) {
        setListParam(storedListParam);
      }
    } catch (error) {
      console.error(`Error getting listParam from AsyncStorage: ${error}`);
    }
  };

  // Save the listParams to AsyncStorage
  const saveListParamsToAsyncStorage = async (listParams) => {
    try {
      await AsyncStorage.setItem('listParams', listParams.join(','));
    } catch (error) {
      console.error(`Error saving listParams to AsyncStorage: ${error}`);
    }
  };

  // Get the listParams from AsyncStorage
  const getListParamsFromAsyncStorage = async (setListParams) => {
    try {
      const storedListParams = await AsyncStorage.getItem('listParams');
      if (storedListParams) {
        setListParams(storedListParams.split(','));
      }
    } catch (error) {
      console.error(`Error getting listParams from AsyncStorage: ${error}`);
    }
  };

  useEffect(() => {
    if (isMounted.current) {
      //console.log("ListParams updated: " + listParams + " (triggered on update)");
    } else {
      //console.log("ListParams updated: " + listParams + " (triggered on mount)");
      isMounted.current = true;
    }
  }, [listParams]);

  useEffect(() => {
    if (isMounted.current && checkedItems && Object.keys(checkedItems).length > 0) {
      AsyncStorage.setItem(`checkedItems_${listParam}`, JSON.stringify(checkedItems));
    }
    if (listParam === "Week" && checkedItems && Object.keys(checkedItems).length > 0) {
      AsyncStorage.setItem(`checkedItemsWeek`, JSON.stringify(checkedItems));
    }

  }, [checkedItems]);

  // useEffect(() => {

  //   if(imgLoading){
  //     setTimeout(() => {
  //       setImgLoading(false)
  //     }, "7000");
  //   }
  // }, [imgLoading]);  

useEffect(() => {
  const fetchImage = async () => {
    const img = await AsyncStorage.getItem(`image_${listParam}`);
    if (!img) {
      // Save the image URL to AsyncStorage
      await AsyncStorage.setItem(`image_${listParam}`, imageURL);
    }
  };

  fetchImage();
}, [imageURL]);

  const loadCheckedItems = async () => {

    const storedCheckedItems = await AsyncStorage.getItem(`checkedItems_${listParam}`);
    if (storedCheckedItems) {
      setCheckedItems(JSON.parse(storedCheckedItems));
    } else {
      setCheckedItems({});
    }
  };


  const saveListValue = () => {

    if (listValue.toLowerCase() === "monday") {
      setListValue("Monday \n- ")
    }
    if (listValue.includes("undefined")) {
      setListValue(listValue.replace('undefined', ""))
    }
    saveListValueAndParamsToAsyncStorage(listParam, listValue)
    //AsyncStorage.setItem(`listValue_${listParam}`, listValue);

    loadCheckedItems();
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

  const loadImageForListParam = async (param) => {
    if(!imgLoading && param !== ""){
      setImgLoading(true)
    try {
      const storedImageURL = await AsyncStorage.getItem(`image_${param}`);
      if (storedImageURL) {
              
        setImageURL(storedImageURL);
        setImgLoading(false)
      }else{
              
        translateAndGenerateImage(param)
      }
    } catch (error) {
      console.error('Error loading image for listParam:', error);
    }
    }
  };

const generateImage = async (prompt, listParam) => {
  debugger;
    // Cancel the previous fetch request
    abortControllerRef.current.abort();
    // Create a new AbortController
    abortControllerRef.current = new AbortController();
  try {
    const response = await fetch('https://innoonni.000webhostapp.com/AI_image.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `prompt=${encodeURIComponent(prompt)}`,
      signal: abortControllerRef.current.signal
    });
   //c(prompt)
    const data = await response.json();

    if (data && data.data.length > 0) {
      const imageURL = "https://innoonni.000webhostapp.com/" + data.data[0].local_url;
      setImageData(listParam, imageURL)
      setImageURL(imageURL.trim())
      setImgLoading(false)
    } else {
      console.error('No image generated');
      setImgLoading(false)
    }
  } catch (error) {
    console.error('Error generating image: _' + prompt, error);
    setImgLoading(false)
  }
};

  const translateAndGenerateImage = async (text, listParam) => {
    if(selectedLanguage === "en" || text === "Week"){
      generateImage(text, listParam)
      return text;
    }
 //c("translateAndGenerate"+ text)
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `txt=${encodeURIComponent("Translate the following text to English: " + text)}`
    };


    fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
      .then(response => response.text())
      .then(data => {
        generateImage(data, listParam)
        return data;

      })
      .catch(error => {
        console.error('Error: _' + text, error);
        return text;
      });
  };

  const handlePrompt = () => {
    setIsLoading(true);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: listParam === 'Week' ? `txt=${encodeURIComponent(l["Create a to-do list in the following format: Day of the week - To-do. Distribute the tasks in a rational manner over the 7-day week; Some days may be empty if there are few to-dos; To-dos:"] + listValue.replace(/[\r\n]+|\s{2,}/g, ' '))}` : `txt=${encodeURIComponent(l["Create a to-do list (seperate with - and a space) for how to achieve the following task based on best practices in its field: "] + listParam.replace(/[\r\n]+|\s{2,}/g, ' ') + (listValue !== '' && " " + listValue))}`
    };


    fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
      .then(response => response.text())
      .then(data => {
        //console.log(data)
        if (!data.includes('Undefined property')) {
          const stringWithDaysHyphen = data.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mandag|Tirsdag|Onsdag|Torsdag|Fredag|Lørdag|Søndag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo|Понеділок|Вівторок|Середа|Четвер|Пʼятниця|Субота|Неділя|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche|Poniedziałek|Wtorek|Środa|Czwartek|Piątek|Sobota|Niedziela):/gi, '$1 -');
          let a = stringWithDaysHyphen.replace(/(—|–)/g, '-')
          let b = a.replace(/-/g, '\n-')
          let c = b.replace(/.*(Monday|Mandag|Montag|Lunes|Понеділок|Lundi|Poniedziałek)/, "$1")

          let e = listParam === 'Week' ? rearrangeTasks(c) : c
          setHideInput(true)
          setListValue(e)
          saveListValueToAsyncStorage(listParam, e)
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
    setDoneEdit(!listValue.includes('-'));
    if(listValue.includes("undefined")){
      setListValue(listValue.replace(/undefined/g, ""));
    }
    if(listValue.includes(",")){
      setListValue(listValue.replace(",", "，"));
    }
  }, [listValue]);

  useEffect(() => {
    // Save the list of list parameters to AsyncStorage
    if (!isMounted.current) {
      AsyncStorage.setItem('listParams', listParams.join(','));
    }

  }, [listParams]);

  const c = (f: any) => {
    //console.log(f)
  }

  useEffect(() => {
    if (listParam !== '' && checkedItems) {
      AsyncStorage.setItem(`checkedItems_${listParam}`, JSON.stringify(checkedItems));
    }
  }, [checkedItems]);

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


  const handleCheckboxChange = (id, checked) => {
    // Update the checked state of the checkbox in state
    setCheckedItems((prevItems) => ({ ...prevItems, [id]: checked }));

    // Uncheck all other items with the same label
    const value = id.split('-')[1]; // Get the label value
    const items = listValue.split('\n');

    for (const item of items) {
      if (item.startsWith('-') && item.replace(/-|\s*:$/g, '') === value) {
        const otherIndex = items.indexOf(item);
        const otherId = `item-${otherIndex}`;
        if (otherId !== id) {
          setCheckedItems((prevItems) => ({ ...prevItems, [otherId]: false }));
        }
      }
    }
  };

  const handleRefresh = () => {
    handlePrompt();
    setEditCheckbox(false)
  };

  const handleLinkPress = (param) => {
    setListParam(param);
    // loadImageForListParam(param)
    //logAllData()
    getListValueFromAsyncStorage(param, setListValue);
    saveListParamToAsyncStorage(param)
    setEditCheckbox(false)
    //getcheckteditems
  };

  useEffect(() => {
    loadCheckedItems();
  }, [listParam, listValue]);

  const handleListValueChange = (value) => {
    setListValue(value);
  };

  const handleListValueBlur = () => {
    saveListValueAndParamsToAsyncStorage(listParam, listValue);
  };

  const handleTextInputSubmit = () => {
    setShouldConvert(listValue.trim().startsWith('-'));
  };

  const clearList = async () => {
    try {
      await AsyncStorage.setItem(`listValue_${listParam}`, '');
      setListValue('');
      await AsyncStorage.setItem(`checkedItems_${listParam}`, {});
      setCheckedItems({});
      await AsyncStorage.setItem(`images`, {});
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  const clearAll = async () => {
        Alert.alert(
          l['OK?'], // Title
          l['This will delete all your lists and tasks.'],
          [
            { text: 'OK', onPress: () => clearAllFinal() },
            { text: 'Cancel', onPress: () => { console.log('Cancel Pressed');  } },
          ],
          { cancelable: true }
        );
  };

  const clearAllFinal = async () => {

    try {
      await AsyncStorage.clear();
      setImageURL('')
      setImages([])
      setListValue("");
      setListParams(['Week']);
      setListParam("Week");
      setCheckedItems({});
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  };

  const getRandomPlaceholder = () => {
    const sentences = [
      'Got anything you want to do this week?',
      'What do you want to accomplish this week?',
      'What are your goals for the upcoming week?',
      'What do you want to get done this week?',
      'What are your intentions for the week ahead?',
      'What do you hope to achieve this week?',
      'What do you want to check off your list this week?',
      'What\'s on your to-do list for the week?',
      'What\'s on the schedule for this week?',
      'What\'s on the horizon for this week?',
      'What\'s your plan for success this week?',
      'What are you aiming for this week?',
      'What\'s the scoop for this week?',
      'What do you have planned for this week?',
      'What\'s your plan of attack for the week?',
      'What\'s your focus for the upcoming week?',
      'What do you want to make happen this week?',
      'What\'s on your radar for this week?',
      'What\'s on the agenda for this week?',
      'What are you looking to accomplish this week?',
      'What\'s on tap for this week?',
      'What do you want to get out of this week?',
      'What\'s on your mind for this week?',
      'What are your priorities for the week ahead?',
      'What\'s the plan for the week ahead?',
      'What\'s your game plan for the week ahead?',
      'What\'s on your agenda this week?',
      'Feel like sharing some things you want to do this week?',
      'Anything exciting on the schedule this week?',
      'Ready to tackle some tasks for the week?',
    ];

    const sentencesNo = [
      'Har du noe du vil gjøre denne uken?',
      'Hva ønsker du å oppnå denne uken?',
      'Hva er målene dine for den kommende uken?',
      'Hva ønsker du å få gjort denne uken?',
      'Hva er intensjonene dine for uken som kommer?',
      'Hva håper du å oppnå denne uken?',
      'Hva ønsker du å krysse av listen din denne uken?',
      'Hva er på gjøremålslisten din for uken?',
      'Hva står på timeplanen for denne uken?',
      'Hva er i horisonten for denne uken?',
      'Hva er planen din for suksess denne uken?',
      'Hva sikter du etter denne uken?',
      'Hva er nyhetene for denne uken?',
      'Hva har du planlagt for denne uken?',
      'Hva er angrepsplanen din for uken?',
      'Hva er fokuset ditt for den kommende uken?',
      'Hva ønsker du å få til denne uken?',
      'Hva er på radaren din for denne uken?',
      'Hva står på agendaen for denne uken?',
      'Hva ønsker du å oppnå denne uken?',
      'Hva står på tapetet for denne uken?',
      'Hva ønsker du å få ut av denne uken?',
      'Hva har du i tankene for denne uken?',
      'Hva er prioritetene dine for uken som kommer?',
      'Hva er planen for uken som kommer?',
      'Hva er spillplanen din for uken som kommer?',
      'Hva er på agendaen din denne uken?',
      'Føler du for å dele noen ting du vil gjøre denne uken?',
      'Noe spennende på timeplanen denne uken?',
      'Klar for å takle noen oppgaver for uken?',
    ];

    const sentencesDe = [
      'Hast du etwas, was du diese Woche erledigen möchtest?',
      'Was möchtest du diese Woche erreichen?',
      'Was sind deine Ziele für die kommende Woche?',
      'Was möchtest du diese Woche erledigen?',
      'Was sind deine Absichten für die nächste Woche?',
      'Was erhoffst du dir, diese Woche zu erreichen?',
      'Was möchtest du diese Woche von deiner Liste streichen?',
      'Was steht auf deiner To-do-Liste für diese Woche?',
      'Was ist für diese Woche geplant?',
      'Was steht für diese Woche am Horizont?',
      'Was ist dein Plan für Erfolg in dieser Woche?',
      'Worauf zielst du diese Woche ab?',
      'Was ist der Clou für diese Woche?',
      'Was hast du für diese Woche geplant?',
      'Was ist dein Angriffsplan für diese Woche?',
      'Worin liegt dein Fokus für die kommende Woche?',
      'Was möchtest du diese Woche geschehen lassen?',
      'Was steht für diese Woche auf deinem Radar?',
      'Was steht für diese Woche auf der Agenda?',
      'Was möchtest du diese Woche erreichen?',
      'Was steht für diese Woche auf dem Programm?',
      'Was möchtest du aus dieser Woche herausholen?',
      'Was beschäftigt dich für diese Woche?',
      'Was sind deine Prioritäten für die nächste Woche?',
      'Was ist der Plan für die kommende Woche?',
      'Was ist dein Spielplan für die nächste Woche?',
      'Was steht auf deiner Tagesordnung für diese Woche?',
      'Lust, einige Dinge zu teilen, die du diese Woche erledigen möchtest?',
      'Steht etwas Aufregendes für diese Woche auf dem Plan?',
      'Bereit, einige Aufgaben für diese Woche in Angriff zu nehmen?',
    ];

    const sentencesFr = [
      'As-tu quelque chose que tu veux faire cette semaine ?',
      'Que veux-tu accomplir cette semaine ?',
      'Quels sont tes objectifs pour la semaine à venir ?',
      'Que veux-tu terminer cette semaine ?',
    ];

    const sentencesEs = [
      '¿Tienes algo que quieras hacer esta semana?',
      '¿Qué quieres lograr esta semana?',
      '¿Cuáles son tus metas para la próxima semana?',
      '¿Qué quieres hacer esta semana?',
      '¿Cuáles son tus intenciones para la semana que viene?',
    ];

    const sentencesUk = [
      'Є щось, що ти хочеш зробити на цьому тижні?',
      'Що ти хочеш досягнути на цьому тижні?',
      'Які твої цілі на наступний тиждень?',
      'Що ти хочеш виконати на цьому тижні?',
      'Які твої наміри на тиждень, що йде?',
    ];

    const sentencesPl = [
      'Masz coś, co chciałbyś zrobić w tym tygodniu?',
      'Co chcesz osiągnąć w tym tygodniu?',
      'Jakie są Twoje cele na nadchodzący tydzień?',
      'Co chciałbyś zrobić w tym tygodniu?',
      'Jakie są Twoje plany na przyszły tydzień?',
      'Czego chciałbyś dokonać w tym tygodniu?',
      'Co chciałbyś odhaczyć na swojej liście w tym tygodniu?',
      'Co jest na Twojej liście rzeczy do zrobienia na ten tydzień?',
      'Co jest zaplanowane na ten tydzień?',
      'Co jest na horyzoncie na ten tydzień?',
      'Jaki jest Twój plan na sukces w tym tygodniu?',
      'Na co celujesz w tym tygodniu?',
      'Co słychać w tym tygodniu?',
      'Co masz zaplanowane na ten tydzień?',
      'Jaki jest Twój plan ataku na ten tydzień?',
      'Na czym skupiasz się w nadchodzącym tygodniu?',
      'Co chciałbyś, żeby się stało w tym tygodniu?',
      'Co jest na Twoim radarze na ten tydzień?',
      'Co jest na agendzie na ten tydzień?',
      'Czego pragniesz dokonać w tym tygodniu?',
      'Co jest na tapecie na ten tydzień?',
      'Co chciałbyś wynieść z tego tygodnia?',
      'O czym myślisz na ten tydzień?',
      'Jakie są Twoje priorytety na przyszły tydzień?',
      'Jaki jest plan na przyszły tydzień?',
      'Jaki jest Twój plan gry na przyszły tydzień?',
      'Co jest w Twojej agendzie na ten tydzień?',
      'Masz ochotę podzielić się rzeczami, które chciałbyś zrobić w tym tygodniu?',
      'Czy coś ekscytującego jest zaplanowane na ten tydzień?',
      'Gotowy, aby zmierzyć się z kilkoma zadaniami na ten tydzień?',
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

  const ListItems = () => {
    const items = listValue
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
                  <TouchableOpacity onPress={() => newList(value.trim())}>
                    <Text style={styles.arrowButton}>{listParams.includes(value.trim()) ? "→" : "+"}</Text>
                  </TouchableOpacity>
                  <View>
                    <Text>  </Text>
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
                textStyle={{ fontFamily: "Roboto", width: 230, flexWrap: 'wrap' }}
                isChecked={checkedItems[id] === 'true' || checkedItems[id] === true}
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

    const updateListValue = async (param, value) => {
      try {
        await AsyncStorage.setItem(`listValue_${param}`, value);
        setListValue(value);
      } catch (error) {
        console.error(error);
      }
    };

    const getListValue = async (param) => {
      try {
        const value = await AsyncStorage.getItem(`listValue_${param}`);
        return value;
      } catch (error) {
        console.error(error);
      }
    };

    const newList = async (newListName) => {
      setImageURL('')
      if (listParams.includes(newListName)) {
        handleLinkPress(newListName)
        console.warn(`List with the name "${newListName}" already exists.`);
        return;
      }
      setListParam(newListName);
      // loadImageForListParam(newListName)
      setDoneEdit(false);
      setHideInput(false);

      // Update listParams if the new listParam does not exist
      if (!listParams.includes(newListName)) {
        const updatedListParams = [...listParams, newListName];
        setListParams(updatedListParams);
        saveListParamsToAsyncStorage(updatedListParams);
      }

      AsyncStorage.getItem(`listValue_${newListName}`)
        .then((storedListValue) => {
          if (storedListValue) {
            updateListValue(newListName, storedListValue);
          } else {
            saveListValueAndParamsToAsyncStorage(newListName, '');
            updateListValue(newListName, '');
          }
        })
        .catch((error) => {
          console.error(`Error getting list value from AsyncStorage for listParam ${newListName}: ${error}`);
        });
    };

const deleteItem = async (index) => {
  const newItems = [...listValue.split('\n')];
  newItems.splice(index, 1);
  setListValue(newItems.join('\n'));

  // Update checkedItems
  const newCheckedItems = {};

  // Reassign the checked state of items
  Object.entries(checkedItems).forEach(([key, checked]) => {
    const itemIndex = parseInt(key.split('-')[1]);
    if (itemIndex < index) {
      newCheckedItems[key] = checked;
    } else if (itemIndex > index) {
      const newKey = `item-${itemIndex - 1}`;
      newCheckedItems[newKey] = checked;
    }
  });

  setCheckedItems(newCheckedItems);

  // Update checkedItems in AsyncStorage
  try {
    await AsyncStorage.setItem(`checkedItems_${listParam}`, JSON.stringify(newCheckedItems));
  } catch (error) {
    console.error('Error updating checkedItems in AsyncStorage:', error);
  }
  //logAllData()
};


    const days = daysMapping[selectedLanguageState] || daysMapping.en;
    const todayIndex = (new Date().getDay() + 6) % 7;

    const isPastDay = (day) => {
      const dayIndex = days.findIndex((d) => d === day);
      return dayIndex !== -1 && dayIndex < todayIndex;
    };

const moveItem = (fromIndex, toIndex) => {
  if (toIndex < 0 || toIndex >= listValue.split('\n').length) {
    return;
  }
  setEditCheckbox(`item-${toIndex}`);
  // Move the item in listValue
  const items = listValue.split('\n');
  const itemToMove = items[fromIndex];
  items.splice(fromIndex, 1);
  items.splice(toIndex, 0, itemToMove);
  setListValue(items.join('\n'));

  // Update checkedItems state
  const fromId = `item-${fromIndex}`;
  const toId = `item-${toIndex}`;
  const fromChecked = checkedItems[fromId];
  const toChecked = checkedItems[toId];

  setCheckedItems(prevItems => {
    // Create a shallow copy of prevItems
    const newItems = { ...prevItems };

    // Update the checkedItems state with the new positions
    delete newItems[fromId];
    delete newItems[toId];
    newItems[toId] = fromChecked;
    newItems[fromId] = toChecked;

    return newItems;
  });
  //logAllData()
};


    return (
      <View style={styles.checkboxes}>
        {items.map((item, index) => renderItem(item, index))}
      </View>
    );
  };

  const renderButton = () => {
    if (isLoading) {
      return <PrimaryButton title={`${l["Loading"]}${dots}`} onPress={c('f')} loading={true} />;
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

    if (listValue.includes("-")) {
      return (
        <PrimaryButton
          title={l["Save"]}
          onPress={() => {
            setHideInput(true);
            saveListValue();
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
            placeholder={listParam === 'Week' ? getRandomPlaceholder() : l['How will you approach this task?']}
            value={listValue}
            onChangeText={handleListValueChange}
            onBlur={handleListValueBlur}
            onSubmitEditing={handleTextInputSubmit}
          />

        }
        <View style={styles.center}>
          {renderButton()}
          <PrimaryButton title={listValue === "" ? l["Delete all lists"] : l["Clear all"]} onPress={() => {
            listValue === "" ? clearAll() : clearList()
            setHideInput(false);
            //setDoneEdit(true);
          }} color="#0A5A6C" />
        </View>
        <View style={styles.listLinks}>
          {listParams.map((param, index) => (
            <Text style={param === listParam ? styles.linkCurrent : styles.link} key={index} onPress={() => handleLinkPress(param)}>
              {capitalize(l[param])}
            </Text>
          ))}
        </View>
        <View>
          {imageURL !== "" && listParam !== "Week" ? (
            <Image source={{ uri: imageURL.trim() }} style={{ width: '100%', height: 200, borderRadius: 5 }} />
          ) : (
          <FastImage
            source={require('../zenlasting.png')}
            defaultSource={require('../zenlasting.png')}
            style={{ width: '100%', height: 200, borderRadius: 5 }}
            cache={FastImage.cacheControl}
          />
          )}
        </View>
        <ListItems />
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
  listLinks: {
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

export default TaskList;

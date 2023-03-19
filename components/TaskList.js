import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Platform, ScrollView, TouchableOpacity, Alert, ActivityIndicator} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from './../components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { getLang } from "./translations"; // Import the getLang function
import * as Localization from 'expo-localization';

const TaskList = ({ navigation, route }) => {
  const [listValue, setListValue] = useState('');
  const [listParam, setListParam] = useState('');
  const [listParams, setListParams] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [shouldConvert, setShouldConvert] = useState(false);
  const [height, setHeight] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [hideInput, setHideInput] = useState(false);
  const [doneEdit, setDoneEdit] = useState(true);

  const [data, setData] = useState(null);

  const { selectedLanguage } = route.params || { selectedLanguage: 'en' };
  // Get the device language
  const deviceLanguage = Localization.locale.split('-')[0];
const supportedLanguages = ['en', 'de', 'es', 'uk', 'fr', 'pl'];
const languageMapping = { 'nb': 'no' };

const language = supportedLanguages.includes(deviceLanguage) ? (languageMapping[deviceLanguage] || deviceLanguage) : 'en';
  const [selectedLanguageState, setSelectedLanguageState] = useState(selectedLanguage);
  const l = getLang(selectedLanguage); // Get the lang object for the current language

  useEffect(() => {
    navigation.setOptions({ title: selectedLanguage === 'no' ? "Gjør" : "Do"});
  }, [selectedLanguage, navigation, l]);

    useEffect(() => {
    setSelectedLanguageState(selectedLanguage)
  }, [selectedLanguage]);

    useEffect(() => {
    
  }, [hideInput]);

  useEffect(() => {
    if(listValue.toLowerCase() === "monday"){
      setListValue("Monday \n- ")
    }
    if(listValue.includes("undefined")){
      setListValue(listValue.replace('undefined', ""))
    }
    if(listValue.includes("-")){
      setDoneEdit(false)
      setHideInput(false)
    }

  }, [listValue]);

const loadCheckedItems = async () => {
  const items = listValue.split('\n');
  let newCheckedItems = {};

  for (const item of items) {
    if (item.startsWith('-')) {
      const value = item.replace(/-|\s*:$/g, '');
      const storedCheckedValue = await AsyncStorage.getItem(`${value}_${listParam}`);
      newCheckedItems[value] = storedCheckedValue === 'true' || storedCheckedValue === true;
    }
  }

  setCheckedItems(newCheckedItems);
};  

  const rotateList = (list) => {
    let currentDay = new Date().getDay();
    let newList = [...list];
    for (let i = 0; i < currentDay; i++) {
      let firstItem = newList.shift();
      newList.push(firstItem);
    }
    return newList;
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

  const handlePrompt = () => {
    setIsLoading(true);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `txt=${encodeURIComponent(l["Create a to-do list in the following format: Day of the week - To-do. Distribute the tasks in a rational manner over the 7-day week; Some days may be empty if there are few to-dos; To-dos:"] + listValue.replace(/[\r\n]+|\s{2,}/g, ' '))}`
  };
  

  fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
    .then(response => response.text())
    .then(data => {
      if(!data.includes('Undefined property')){
const stringWithDaysHyphen = data.replace(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mandag|Tirsdag|Onsdag|Torsdag|Fredag|Lørdag|Søndag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag|Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo|Понеділок|Вівторок|Середа|Четвер|Пʼятниця|Субота|Неділя|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche|Poniedziałek|Wtorek|Środa|Czwartek|Piątek|Sobota|Niedziela):/gi, '$1 -');
      let a = stringWithDaysHyphen.replace(/(—|–)/g, '-')
      let b = a.replace(/-/g, '\n-')
      let c = b.replace(/.*(Monday|Mandag|Montag|Lunes|Понеділок|Lundi|Poniedziałek)/, "$1")

      let e = rearrangeTasks(c)
      setHideInput(true)
      setListValue(e)

      }else{
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
    // Check if the list parameter is present in AsyncStorage
    AsyncStorage.getItem('liste').then((storedListParam) => {
      if (storedListParam) {
        setListParam(storedListParam);
      } else {
        // Initialize an empty list parameter in AsyncStorage
        AsyncStorage.setItem('liste', '').then(() => {
          setListParam('');
        });
      }
    });

    // Load the list value from AsyncStorage
    AsyncStorage.getItem(`listValue_${listParam}`).then((storedListValue) => {
      if (storedListValue) {
        setListValue(storedListValue);
      }
    });

    // Load the list of list parameters from AsyncStorage
    AsyncStorage.getItem('listParams').then((storedListParams) => {
      if (storedListParams) {
        setListParams(storedListParams.split(','));
      }
    });
    if(listValue.includes("-")){
              setDoneEdit(true)
              setHideInput(true)
    }
  }, []);

  useEffect(() => {
    // Save the list value to AsyncStorage
    AsyncStorage.setItem(`listValue_${listParam}`, listValue);

    loadCheckedItems();
  }, [listValue, listParam]);

  useEffect(() => {
    // Save the list of list parameters to AsyncStorage
    AsyncStorage.setItem('listParams', listParams.join(','));
  }, [listParams]);

  const c = (f: any) => {
    console.log(f)
  }

useEffect(() => {
  // Save the checkbox state to AsyncStorage when it changes
  Object.entries(checkedItems).forEach(([key, value]) => {
    AsyncStorage.setItem(`${key}_${listParam}`, value.toString());

  });
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



const ListItems = () => {
  const items = listValue
    .split('\n')
    .map((label, index) => ({ key: `item-${index}`, label }));

const renderItem = (item, index) => {

  if (item.label.startsWith('-')) {
    const value = item.label.replace(/-|\s*:$/g, '');
    return (
      <View style={styles.checkboxContainer} key={index}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <BouncyCheckbox
            size={35}
            fillColor="#4F7942"
            unfillColor="#FFFFFF"
            text={value}
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 0 }}
            textStyle={{ fontFamily: "Roboto", flexWrap: 'wrap'}}
            isChecked={checkedItems[value] === 'true' || checkedItems[value] === true}
            onPress={(isChecked) => handleCheckboxChange(value, isChecked)}
          />
        </View>
        <View style={[styles.arrowButtonsContainer, { flex: 0 }]}>
          <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
            <Text style={styles.arrowButton}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
            <Text style={styles.arrowButton}>↓</Text>
          </TouchableOpacity>
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


  const days = daysMapping[selectedLanguageState] || daysMapping.en;
const todayIndex = (new Date().getDay() + 6) % 7;

const isPastDay = (day) => {
  const dayIndex = days.findIndex((d) => d === day);
  return dayIndex !== -1 && dayIndex < todayIndex;
};

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) return;

    const newItems = [...items];
    const itemToMove = newItems[fromIndex];
    newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, itemToMove);

    const reorderedListValue = newItems.map((item) => item.label).join('\n');
    setListValue(reorderedListValue);
  };

  return (
    <View style={styles.checkboxes}>
      {items.map((item, index) => renderItem(item, index))}
    </View>
  );
};


const handleCheckboxChange = (value, checked) => {
  // Update the checked state of the checkbox in state
  setCheckedItems((prevItems) => ({ ...prevItems, [value]: checked }));

  // Save the checked state of the checkbox to AsyncStorage
  AsyncStorage.setItem(`${value}_${listParam}`, checked.toString());
};
// useEffect(() => {
//   // Save the checkbox state to AsyncStorage when it changes
//   Object.entries(checkedItems).forEach(([key, value]) => {
//     AsyncStorage.setItem(`${key}_${listParam}`, value.toString());
//   });
// }, [checkedItems]);

const handleRefresh = () => {
  handlePrompt();
};


  const handleLinkPress = (param) => {
    setListParam(param);
    AsyncStorage.setItem('liste', param);
  };

const handleListValueChange = (value) => {
  setListValue(value);
};

const handleTextInputSubmit = () => {
  setShouldConvert(listValue.trim().startsWith('-'));
};

const clearList = async () => {
  try {
    await AsyncStorage.clear();
    setListValue("");
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
const LoadingOverlay = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00ff00" />
    </View>
  );
};
const dots = "...";
return (
  <View style={[styles.container, { position: 'relative', height: '100%'}]}>
    { Platform.OS !== "ios" &&
      <LinearGradient
        colors={['#ffe6e6', '#fcffe9']}
        start={[0, 0]}
        end={[0, 1]}
        style={[styles.gradient, { height: '100%' }]}
      />
    }
  <ScrollView style={[styles.container, { position: 'relative', margin: 10 }]}>
    {!hideInput &&
      <TextInput
        style={[styles.textInput, { height: Math.max(100, height) }]}
        multiline={true}
      placeholder={getRandomPlaceholder()}
      value={listValue}
      onChangeText={handleListValueChange}
      onSubmitEditing={handleTextInputSubmit}
    />
    
    }
    <View style={styles.center}>
    {
      isLoading ? (
        <>
          <PrimaryButton title={`${l["Loading"]}${dots}`} onPress={c('f')} />

        </>
      ) : (
        doneEdit ? (
          <PrimaryButton
            title={hideInput ? l["Edit list"] : l["AI generate list"]}
            onPress={
              hideInput
                ? () => {
                    setHideInput(false);
                    setDoneEdit(false);
                  }
                : () => {
                    handleRefresh()
                  }
            }
          />
        ) : (
          <PrimaryButton
            title={l["Save"]}
            onPress={() => {
                    setHideInput(true);
                    setDoneEdit(true);
                  }}
          />
        )
      )
    }


        <PrimaryButton title={l["Clear all"]} onPress={() => {
                    clearList()
                    setHideInput(false);
                    setDoneEdit(true);
                  }} color="#0A5A6C"/>
    </View>
    <View style={styles.listLinks}>
      {listParams.map((param, index) => (
        <Text style={styles.link} key={index} onPress={() => handleLinkPress(param)}>
          {param}
        </Text>
      ))}
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
  },
  link: {
    marginRight: 10,
    marginBottom: 10,
    color: '#3D405B',
    textDecorationLine: 'underline',
  },
  checkboxes: {
    marginTop: 10,
  },
    loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  checkbox: {
    marginRight: 5,
  },

  label: {
    fontSize: 16,
    fontFamily: 'Roboto',
    //fontWeight: 'bold',
    color: '#0A5A6C',
    maxWidth: '80%'
  },
  boldLabel: {
    fontSize: 20,
    fontFamily: 'Como bold',
    fontWeight: 'bold',
    color: '#1A237E'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Add this line
    marginBottom: 10,
  },
  arrowButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10, // Add this line
  },
  arrowButton: {
    fontSize: 18,
    paddingHorizontal: 5,
    color: '#777', // Change the color to a more neutral color
  },
});

export default TaskList;

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Platform, ScrollView, TouchableOpacity} from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PrimaryButton from './../components/PrimaryButton';
import { LinearGradient } from 'expo-linear-gradient';
import { getLang } from "./translations"; // Import the getLang function
import * as Localization from 'expo-localization';

const AntiTaskList = ({ navigation, route }) => {
  const [listValue, setListValue] = useState('');
  const [listParam, setListParam] = useState('');
  const [listParams, setListParams] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [shouldConvert, setShouldConvert] = useState(false);
  const [height, setHeight] = useState(70);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState(null);

  const { selectedLanguage } = route.params || { selectedLanguage: 'en' };
  // Get the device language
  const deviceLanguage = Localization.locale.split('-')[0];
  const language = deviceLanguage === 'nb' ? 'no' : 'en'; // Set the current language, based on the device language
  const [selectedLanguageState, setSelectedLanguageState] = useState(selectedLanguage);
  const l = getLang(selectedLanguage); // Get the lang object for the current language

  useEffect(() => {
    navigation.setOptions({ title: selectedLanguage === 'no' ? "Gjør" : "Do"});
  }, [selectedLanguage, navigation, l]);

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

  const handlePrompt = () => {
    setIsLoading(true);
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `txt=${encodeURIComponent(l["Create a list of tasks or habits to avoid in the following format: Day of the week - Task to avoid. Distribute the habits to avoid evenly across the 7-day week, ensuring that each habit appears no more than ONCE; Some days may have no habits to avoid; If so, write (Day of week) - Free. Habits to avoid: "] + listValue)}`
  };

  fetch('https://innoonni.000webhostapp.com/AI.php', requestOptions)
    .then(response => response.text())
    .then(data => {
      setListValue((data.replace(/-/g, '\n-')).replace(/.*Monday/, "Monday"))
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error:', error);
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

const ListItems = () => {
  const items = listValue
    .split('\n')
    .map((label, index) => ({ key: `item-${index}`, label }));

  const renderItem = (item, index) => {
    if (item.label.startsWith('-')) {
      const value = item.label.replace(/-|\s*:$/g, '');
      return (
        <View style={styles.checkboxContainer} key={index}>
          <BouncyCheckbox
            size={35}
            fillColor="#4F7942"
            unfillColor="#FFFFFF"
            text={value}
            iconStyle={{ borderColor: "white" }}
            innerIconStyle={{ borderWidth: 0 }}
            textStyle={{ fontFamily: "Roboto" }}
            isChecked={checkedItems[value] === 'true' || checkedItems[value] === true}
            onPress={(isChecked) => handleCheckboxChange(value, isChecked)}
          />
          <View style={styles.arrowButtonsContainer}>
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
      return (
        <Text style={styles.label} key={index}>
          {item.label}
        </Text>
      );
    }
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

const clearList = () => {
  setListValue("");
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
  return selectedLanguageState === 'no' ? sentencesNo [randomIndex] : sentences[randomIndex];
}

return (
  <ScrollView style={styles.container}>
  <Text> {"\n"}</Text>
    { Platform.OS !== "ios" &&
      <LinearGradient
        colors={['#ffe6e6', '#fcffe9']}
        start={[0, 0]}
        end={[0, 1]}
        style={styles.gradient}
      />
    }
    <TextInput
        style={[styles.textInput, { height: Math.max(100, height) }]}
        multiline={true}
      placeholder={getRandomPlaceholder()}
      value={listValue}
      onChangeText={handleListValueChange}
      onSubmitEditing={handleTextInputSubmit}
    />
    <View style={styles.center}>
    {
      isLoading ? (
        <PrimaryButton title="Loading..." onPress={c('f')} />
    ) : (
    <PrimaryButton title={l["AI generate list"]} onPress={handleRefresh} />
      )
    }

        <PrimaryButton title={l["Clear all"]} onPress={clearList} color="#0A5A6C"/>
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
  
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
  checkbox: {
    marginRight: 5,
  },

  label: {
    fontSize: 16,
    fontFamily: 'Roboto',
    //fontWeight: 'bold',
    color: '#0A5A6C'
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

export default AntiTaskList;

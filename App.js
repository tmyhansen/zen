import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './Welcome'
import TaskList from './components/TaskList';
import AntiTaskList from './components/AntiTaskList';
import globalStyles from './assets/GlobalStyles';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer style={globalStyles.container}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name=" "
          component={Welcome}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskList"
          component={TaskList}
          options={{ title: 'Do', headerTintColor: "white",
            headerStyle: {
            backgroundColor: "#E07A5F"
          }  }}
        />
        <Stack.Screen
          name="AntiTaskList"
          component={AntiTaskList}
          options={{ title: "Don't do" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

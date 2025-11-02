import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeContent from './home';
import CategoryContent from './category';
import TodosScreen from './todos';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomeContent} />
      <Drawer.Screen name="Category" component={CategoryContent} />
      <Drawer.Screen name="Todos" component={TodosScreen} />
    </Drawer.Navigator>
  );
}

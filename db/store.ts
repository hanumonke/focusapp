import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeData = async (value: Object, key: string) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    // console.log('guardando', value)
  } catch (e) {
    console.error(e);
  }
};

export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
  
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error(e);
  }
};
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, Image, Text, KeyboardAvoidingView, ImageBackground, Platform,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import Picker from 'react-native-picker-select';
import axios from 'axios';


interface IGetStatesResponse {
  state_name: string;
}
interface IGetCityResponse {
  city_name: string;
}

const Home: React.FC = () => {
  const navigation = useNavigation();
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');

  useEffect(() => {
    axios.get('https://www.universal-tutorial.com/api/getaccesstoken', {
      headers: {
        Accept: 'application/json',
        'api-token': process.env.API_TOKEN,
        'user-email': process.env.API_USER_EMAIL,
      },
    }).then((res) => {
      axios.get<IGetStatesResponse[]>('https://www.universal-tutorial.com/api/states/Angola', {
        headers: {
          Authorization: `Bearer ${res.data.auth_token}`,
          Accept: 'application/json',
        },
      }).then((data) => {
        const stateName = data.data.map((state) => state.state_name);

        setStates(stateName);
      });
    });
  }, []);

  useEffect(() => {
    if (selectedState === '0') return;

    axios.get('https://www.universal-tutorial.com/api/getaccesstoken', {
      headers: {
        Accept: 'application/json',
        'api-token': process.env.API_TOKEN,
        'user-email': process.env.API_USER_EMAIL,
      },
    }).then((res) => {
      axios.get<IGetCityResponse[]>(`https://www.universal-tutorial.com/api/cities/${selectedState}`, {
        headers: {
          Authorization: `Bearer ${res.data.auth_token}`,
          Accept: 'application/json',
        },
      }).then((data) => {
        const cityName = data.data.map((city) => city.city_name);

        setCities(cityName);
      });
    });
  }, [selectedState]);

  function handleSetectState(state: string) {
    setSelectedState(state);
  }

  function handleSelectCity(city: string) {
    setSelectedCity(city);
  }

  function handleNavigateToPoints() {
    navigation.navigate('Points', {
      state: selectedState,
      city: selectedCity,
    });
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ImageBackground
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem ponts de coleta de forma eficiente</Text>
          </View>

        </View>

        <View style={styles.footer}>
          <Picker
            style={styles.select}
            onValueChange={handleSetectState}
            value={selectedState}
            placeholder="Selecione uma provincia"
            items={[
              ...(states.map((state) => ({ label: state, value: state }))),
            ]}
          />

          <Picker
            style={{
              viewContainer: styles.input,
            }}
            onValueChange={handleSelectCity}
            value={selectedCity}
            placeholder="Selecione uma cidade"
            items={[
              ...(cities.map((city) => ({ label: city, value: city }))),
            ]}
          />
          <RectButton style={styles.button} onPress={handleNavigateToPoints}>
            <View style={styles.buttonIcon}>
              <Icon name="arrow-right" size={24} color="#333" />
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },
});

export default Home;

import React, {
  useEffect, useState, ChangeEvent, FormEvent,
} from 'react';
import axios from 'axios';

import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

import api from '../../services/api';

import './styles.css';
import Dropzone from '../../components/Dropzone';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title:string;
  image_url: string;
}

interface IGetStatesResponse {
  state_name: string;
}
interface IGetCityResponse {
  city_name: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const history = useHistory();
  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

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

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([
        latitude,
        longitude,
      ]);
    });
  }, []);
  function handleSetectState(event: ChangeEvent<HTMLSelectElement>) {
    const state = event.target.value;

    setSelectedState(state);
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const areadySelected = selectedItems.findIndex((item) => item === id);
    if (areadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();


    const { name, email, whatsapp } = formData;
    const state = selectedState;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const itemsData = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('state', state);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', itemsData.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    await api.post('points', data);

    alert('ponto de colheta criado!');

    history.push('/');
  }
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          voltar par home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do
          {' '}
          <br />
          {' '}
          ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Provinvia</label>
              <select
                onChange={handleSetectState}
                value={selectedState}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma provincia</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                onChange={handleSelectCity}
                value={selectedCity}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option value={city} key={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
};

export default CreatePoint;

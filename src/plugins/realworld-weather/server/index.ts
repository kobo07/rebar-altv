import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
import { Weathers } from '@Shared/data/weathers.js';
import { WeatherConfig } from './config.js';
import { fetchWeatherApi } from 'openmeteo';


const Rebar = useRebar();
const RebarEvents = Rebar.events.useEvents();
const ServerWeather = Rebar.useServerWeather();
let weatherData = null;

const params = {
	"latitude": WeatherConfig.latitude,
	"longitude": WeatherConfig.longitude,
	"current": "weather_code"
};
const url = "https://api.open-meteo.com/v1/forecast";


const getRealWeather = async function() {
	const responses = await fetchWeatherApi(url, params);
	
	const response = responses[0];

	const current = response.current()!;
	
	weatherData = {
		current: {
			weatherCode: current.variables(0)!.value(),
		},
	
	};	
}


const realWeatherToIngame = function(weather: number): Weathers {
	switch (true) {
		case (weather === 0):
			return 'EXTRASUNNY'
		case (weather === 1):
			return 'CLEAR'
		case(weather === 2):
			return 'CLOUDS'
		case (weather === 3):
			return 'OVERCAST'
	    case (weather === 4 || (weather >=30 && weather <=35)):
			return 'SMOG'
		case (weather === 39):
			return 'BLIZZARD'		
		case (weather >=45 && weather <=49):
			return 'FOGGY'
		case ((weather >=50 && weather <=69) || (weather >=80 && weather <=90)):
			return 'RAIN'	
		case (weather >=70 && weather <=73):
			return 'SNOWLIGHT'	
		case (weather === 74 || weather === 75):
			return 'SNOW'	
		case (weather >=95 && weather <=99):
			return 'THUNDER'		
		default:
			return 'NEUTRAL'
	}
}


const updateWeather = async function () {
	await getRealWeather();
	const newWeather: Weathers = realWeatherToIngame(weatherData.current.weatherCode)
	ServerWeather.set(newWeather);
}
	

function updatePlayerWeather(player: alt.Player, weatherType: Weathers) {
    Rebar.player.useWorld(player).setWeather(weatherType, WeatherConfig.timeToTransition);
}

function handleWeatherChange(weather: Weathers) {
    for (let player of alt.Player.all) {
        if (!Rebar.player.useStatus(player).hasCharacter()) {
            continue;
        }

        updatePlayerWeather(player, weather);
    }

    alt.log(`Weather is now: ${weather}`);
}

function handleCharacterSelect(player: alt.Player) {
    updatePlayerWeather(player, ServerWeather.get());
}


updateWeather();

RebarEvents.on('character-bound', handleCharacterSelect);
RebarEvents.on('weather-changed', handleWeatherChange);
alt.setInterval(updateWeather, WeatherConfig.timeBetweenUpdates);

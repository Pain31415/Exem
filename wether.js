document.addEventListener('DOMContentLoaded', function () {
    const todayTab = document.getElementById('today-tab');
    const forecastTab = document.getElementById('forecast-tab');
    const todaySection = document.getElementById('today-section');
    const forecastSection = document.getElementById('forecast-section');
    const cityInput = document.getElementById('city-input');
    const apiKey = '51ecd4fa20920ae00200fea6164180ee';

    // Обробка натискання на вкладки
    todayTab.addEventListener('click', function () {
        todaySection.style.display = 'block';
        forecastSection.style.display = 'none';
        todayTab.classList.add('active');
        forecastTab.classList.remove('active');
    });

    forecastTab.addEventListener('click', function () {
        todaySection.style.display = 'none';
        forecastSection.style.display = 'block';
        todayTab.classList.remove('active');
        forecastTab.classList.add('active');
    });

    function getWeather(city) {
        if (!city) {
            alert('Будь ласка, введіть назву міста');
            return;
        }

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=uk`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === 200) {
                    displayCurrentWeather(data);
                    getForecast(city); // Отримання прогнозу
                    getNearbyCities(data.coord.lat, data.coord.lon);
                } else {
                    alert(`Місто не знайдено: ${data.message}`);
                }
            })
            .catch(error => {
                alert(`Помилка отримання даних: ${error.message}`);
                console.error('Помилка отримання даних:', error);
            });
    }

    function displayCurrentWeather(data) {
        const currentWeather = document.getElementById('current-weather');
        currentWeather.innerHTML = `
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${new Date().toLocaleDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
            <p>${data.weather[0].description}</p>
            <p>Температура: ${data.main.temp}°C</p>
            <p>Як відчувається: ${data.main.feels_like}°C</p>
            <p>Світанок: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
            <p>Захід сонця: ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
            <p>Тривалість дня: ${calculateDayDuration(data.sys.sunrise, data.sys.sunset)}</p>
        `;

        // Очищення погодинного прогнозу
        document.getElementById('hourly-weather').innerHTML = '';
    }

    // Функція для обчислення тривалості дня
    function calculateDayDuration(sunrise, sunset) {
        const duration = sunset - sunrise;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours} год ${minutes} хв`;
    }

    function getForecast(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=uk`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === '200') {
                    display5DayForecast(data);
                } else {
                    alert(`Не вдалося знайти прогноз для міста: ${data.message}`);
                }
            })
            .catch(error => {
                alert(`Помилка отримання даних: ${error.message}`);
                console.error('Помилка отримання даних:', error);
            });
    }

    function display5DayForecast(data) {
        const forecastSection = document.getElementById('5-day-forecast');
        forecastSection.innerHTML = '';

        let forecastHTML = '';

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const icon = item.weather[0].icon;
            const description = item.weather[0].description;
            const temp = item.main.temp;

            if (item.dt_txt.includes('12:00:00')) {
                forecastHTML += `
                    <div class="weather-card">
                        <h2>${date.toLocaleDateString()}</h2>
                        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                        <p>${description}</p>
                        <p>Температура: ${temp}°C</p>
                    </div>
                `;
            }
        });

        forecastSection.innerHTML = forecastHTML;
    }

    function getNearbyCities(lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=6&appid=${apiKey}&units=metric&lang=uk`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === '200') {
                    displayNearbyCities(data.list);
                } else {
                    alert(`Не вдалося знайти сусідні міста: ${data.message}`);
                }
            })
            .catch(error => {
                alert(`Помилка отримання даних: ${error.message}`);
                console.error('Помилка отримання даних:', error);
            });
    }

    function displayNearbyCities(cities) {
        const nearbyPlaces = document.getElementById('nearby-places');
        nearbyPlaces.innerHTML = '';

        cities.forEach(city => {
            const card = document.createElement('div');
            card.classList.add('nearby-city-card');
            card.innerHTML = `
                <h3>${city.name}</h3>
                <p>${city.main.temp}°C, ${city.weather[0].description}</p>
                <button onclick="getHourlyForecast('${city.name}')">Деталі</button>
            `;
            nearbyPlaces.appendChild(card);
        });
    }

    window.getHourlyForecast = function (city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=uk`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.cod === '200') {
                    displayHourlyForecast(data);
                    todayTab.click();
                } else {
                    alert(`Не вдалося знайти погоду для міста: ${data.message}`);
                }
            })
            .catch(error => {
                alert(`Помилка отримання даних: ${error.message}`);
                console.error('Помилка отримання даних:', error);
            });
    };

    function displayHourlyForecast(data) {
        const hourlyWeather = document.getElementById('hourly-weather');
        hourlyWeather.innerHTML = '';

        data.list.forEach(item => {
            const hourCard = document.createElement('div');
            hourCard.classList.add('hourly-card');
            hourCard.innerHTML = `
                <p>${new Date(item.dt * 1000).toLocaleTimeString()}</p>
                <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
                <p>${item.weather[0].description}</p>
                <p>${item.main.temp}°C</p>
            `;
            hourlyWeather.appendChild(hourCard);
        });
    }

    cityInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            getWeather(city);
        }
    });
});

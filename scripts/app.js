(function() {
    'use strict';

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedCities: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    };


    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function() {
        // Refresh all of the forecasts
        app.updateForecasts();
    });

    document.getElementById('butAdd').addEventListener('click', function() {
        // Open/show the add new city dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function() {
        // Add the newly selected city
        var select = document.getElementById('selectCityToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedCities) {
            app.selectedCities = [];
        }
        app.getForecast(key, label);
        app.selectedCities.push({ key: key, label: label });
        app.saveSelectedCities();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', function() {
        // Close the add new city dialog
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new city dialog.
    app.toggleAddDialog = function(visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a weather card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateForecastCard = function(data) {
        var dataLastUpdated = new Date(data.created);
        var sunrise = data.channel.astronomy.sunrise;
        var sunset = data.channel.astronomy.sunset;
        var current = data.channel.item.condition;
        var humidity = data.channel.atmosphere.humidity;
        var wind = data.channel.wind;

        var card = app.visibleCards[data.key];
        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.location').textContent = data.label;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }

        // Verifies the data provide is newer than what's already visible
        // on the card, if it's not bail, if it is, continue and update the
        // time saved in the card
        var cardLastUpdatedElem = card.querySelector('.card-last-updated');
        var cardLastUpdated = cardLastUpdatedElem.textContent;
        if (cardLastUpdated) {
            cardLastUpdated = new Date(cardLastUpdated);
            // Bail if the card has more recent data then the data
            if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
                return;
            }
        }
        cardLastUpdatedElem.textContent = data.created;

        card.querySelector('.availability').textContent = data.isAvailable;
        card.querySelector('.date').textContent = current.date;
        card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
        card.querySelector('.current .detail-container .emp-name').textContent = data.name;
        card.querySelector('.current .detail-container .emp-designation').textContent = data.age + ' yrs';
        card.querySelector('.current .detail-container .emp-jobtitle').textContent = data.jobTitle;
        if (data.bloodGroup) {
            var bloodGroup1 = data.bloodGroup.substring(0, (data.bloodGroup.length - 1));
            var bloodGroup2 = data.bloodGroup.substring((data.bloodGroup.length - 1), data.bloodGroup.length);
            card.querySelector('.current .main-details .blood-group .bld-group1').textContent = bloodGroup1;
            card.querySelector('.current .main-details .blood-group .bld-group2').textContent = bloodGroup2;
        }
        card.querySelector('.current .main-details .contact .phone-no').textContent = data.contact;
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var lastdonated = new Date(data.lastDonated);
        var lastdonDate = lastdonated.getUTCDate() + '-' + monthNames[lastdonated.getMonth()] + '-' + lastdonated.getFullYear();
        card.querySelector('.current .last-donated .don-date').textContent = lastdonDate;
        var today = new Date();
        var timeDiff = Math.abs(today.getTime() - lastdonated.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
        card.querySelector('.current .remaining-days .rem-days').textContent = diffDays;

        var nextDays = card.querySelectorAll('.future .oneday');
        var today = new Date();
        today = today.getDay();
        for (var i = 0; i < 7; i++) {
            var nextDay = nextDays[i];
            var daily = data.channel.item.forecast[i];
            if (daily && nextDay) {
                nextDay.querySelector('.date').textContent =
                    app.daysOfWeek[(i + today) % 7];
                nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
                nextDay.querySelector('.temp-high .value').textContent =
                    Math.round(daily.high);
                nextDay.querySelector('.temp-low .value').textContent =
                    Math.round(daily.low);
            }
        }
        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };


    app.updateUserCard = function(data) {
        var dataLastUpdated = new Date(data.created);

        var card = app.visibleCards[data.key];
        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            // card.querySelector('.location').textContent = data.label;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }

        // Verifies the data provide is newer than what's already visible
        // on the card, if it's not bail, if it is, continue and update the
        // time saved in the card
        var cardLastUpdatedElem = card.querySelector('.card-last-updated');
        var cardLastUpdated = cardLastUpdatedElem.textContent;
        if (cardLastUpdated) {
            cardLastUpdated = new Date(cardLastUpdated);
            // Bail if the card has more recent data then the data
            if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
                return;
            }
        }
        cardLastUpdatedElem.textContent = data.created;

        card.querySelector('.availability').style.backgroundColor = (data.isAvailable) ? 'green' : 'red';
        card.querySelector('.detail-container .emp-name').textContent = data.name;
        card.querySelector('.detail-container .emp-designation strong').textContent = data.age + ' yrs';
        card.querySelector('.detail-container .emp-jobtitle').textContent = data.jobTitle;
        if (data.bloodGroup) {
            var bloodGroup1 = data.bloodGroup.substring(0, (data.bloodGroup.length - 3));
            console.log('bloodGroup1', bloodGroup1);
            var bloodGroup2 = data.bloodGroup.substring((data.bloodGroup.length - 3), data.bloodGroup.length);
            console.log('bloodGroup2', bloodGroup2);
            card.querySelector('.main-details .blood-group .bld-group1').textContent = bloodGroup1;
            card.querySelector('.main-details .blood-group .bld-group2').textContent = bloodGroup2;
        }
        card.querySelector('.main-details .contact .phone-no').textContent = data.contact;
        var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        var lastdonated = new Date(data.lastDonated);
        var lastdonDate = lastdonated.getUTCDate() + '-' + monthNames[lastdonated.getMonth()] + '-' + lastdonated.getFullYear();
        card.querySelector('.last-donated .don-date').textContent = lastdonDate;
        var today = new Date();
        var timeDiff = Math.abs(today.getTime() - lastdonated.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); 
        card.querySelector('.remaining-days .rem-days').textContent = diffDays;

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };



    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    /*
     * Gets a forecast for a specific city and updates the card with the data.
     * getForecast() first checks if the weather data is in the cache. If so,
     * then it gets that data and populates the card with the cached data.
     * Then, getForecast() goes to the network for fresh data. If the network
     * request goes through, then the card gets updated a second time with the
     * freshest data.
     */
    app.getForecast = function(key, label) {
        var statement = 'select * from weather.forecast where woeid=' + key;
        var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' +
            statement;
        // TODO add cache logic here
        if ('caches' in window) {
            /*
             * Check if the service worker has already cached this city's weather
             * data. If the service worker has the data, then display the cached
             * data while the app fetches the latest data.
             */
            caches.match(url).then(function(response) {
                if (response) {
                    response.json().then(function updateFromCache(json) {
                        var results = json.query.results;
                        results.key = key;
                        results.label = label;
                        results.created = json.query.created;
                        app.updateForecastCard(results);
                    });
                }
            });
        }
        // Fetch the latest data.
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    var results = response.query.results;
                    results.key = key;
                    results.label = label;
                    results.created = response.query.created;
                    app.updateUserCard(results);
                }
            } else {
                // Return the initial weather forecast since no data is available.
                app.updateUserCard(initialUserData);
            }
        };
        request.open('GET', url);
        request.send();
    };

    // Iterate all of the cards and attempt to get the latest forecast data
    app.updateForecasts = function() {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function(key) {
            app.getForecast(key);
        });
    };

    // TODO add saveSelectedCities function here
    // Save list of cities to localStorage.
    app.saveSelectedCities = function() {
        var selectedCities = JSON.stringify(app.selectedCities);
        localStorage.selectedCities = selectedCities;
    };

    app.getIconClass = function(weatherCode) {
        // Weather codes: https://developer.yahoo.com/weather/documentation.html#codes
        weatherCode = parseInt(weatherCode);
        switch (weatherCode) {
            case 25: // cold
            case 32: // sunny
            case 33: // fair (night)
            case 34: // fair (day)
            case 36: // hot
            case 3200: // not available
                return 'clear-day';
            case 0: // tornado
            case 1: // tropical storm
            case 2: // hurricane
            case 6: // mixed rain and sleet
            case 8: // freezing drizzle
            case 9: // drizzle
            case 10: // freezing rain
            case 11: // showers
            case 12: // showers
            case 17: // hail
            case 35: // mixed rain and hail
            case 40: // scattered showers
                return 'rain';
            case 3: // severe thunderstorms
            case 4: // thunderstorms
            case 37: // isolated thunderstorms
            case 38: // scattered thunderstorms
            case 39: // scattered thunderstorms (not a typo)
            case 45: // thundershowers
            case 47: // isolated thundershowers
                return 'thunderstorms';
            case 5: // mixed rain and snow
            case 7: // mixed snow and sleet
            case 13: // snow flurries
            case 14: // light snow showers
            case 16: // snow
            case 18: // sleet
            case 41: // heavy snow
            case 42: // scattered snow showers
            case 43: // heavy snow
            case 46: // snow showers
                return 'snow';
            case 15: // blowing snow
            case 19: // dust
            case 20: // foggy
            case 21: // haze
            case 22: // smoky
                return 'fog';
            case 24: // windy
            case 23: // blustery
                return 'windy';
            case 26: // cloudy
            case 27: // mostly cloudy (night)
            case 28: // mostly cloudy (day)
            case 31: // clear (night)
                return 'cloudy';
            case 29: // partly cloudy (night)
            case 30: // partly cloudy (day)
            case 44: // partly cloudy
                return 'partly-cloudy-day';
        }
    };

    /*
     * Fake weather data that is presented when the user first uses the app,
     * or when the user has not saved any cities. See startup code for more
     * discussion.
     */
    var initialWeatherForecast = {
        key: '2459115',
        label: 'New York, NY',
        created: '2016-07-22T01:00:00Z',
        channel: {
            astronomy: {
                sunrise: "5:43 am",
                sunset: "8:21 pm"
            },
            item: {
                condition: {
                    text: "Windy",
                    date: "Thu, 21 Jul 2016 09:00 PM EDT",
                    temp: 56,
                    code: 24
                },
                forecast: [
                    { code: 44, high: 86, low: 70 },
                    { code: 44, high: 94, low: 73 },
                    { code: 4, high: 95, low: 78 },
                    { code: 24, high: 75, low: 89 },
                    { code: 24, high: 89, low: 77 },
                    { code: 44, high: 92, low: 79 },
                    { code: 44, high: 89, low: 77 }
                ]
            },
            atmosphere: {
                humidity: 56
            },
            wind: {
                speed: 25,
                direction: 195
            }
        }
    };

    var initialUserData = {
            name: "I am NTG",
            personalEmail: "iamntg@gmail.com",
            workEmail: "nitheesh.ganesh@triassicsolutions.com",
            contact: "+91 7403443441",
            bloodGroup: "O+ve",
            age: 23,
            address: "Kerala Nagar, House No: 20, Anayara P.O., Trivandrum",
            lastDonated: "2016-12-10T17:47:34.000Z",
            isAvailable: true,
            dateOfBirth: "1993-04-18T18:30:00.000Z",
            jobTitle: "Software Engineer",
            currentLocation: "Trivandrum",
            image: "public/images/default_avatar.png",
            activeOn: true,
            createdAt: "2016-11-26T17:49:22.044Z",
            updatedAt: "2016-11-26T17:49:22.044Z",
            id: "5839cb22d5ed7dbc12ee66e9"
        }
        // TODO uncomment line below to test app with fake data
        // app.updateForecastCard(initialWeatherForecast);
    app.updateUserCard(initialUserData);

    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/

    // TODO add startup code here
    app.selectedCities = localStorage.selectedCities;
    if (app.selectedCities) {
        app.selectedCities = JSON.parse(app.selectedCities);
        app.selectedCities.forEach(function(city) {
            app.getForecast(city.key, city.label);
        });
    } else {
        /* The user is using the app for the first time, or the user has not
         * saved any cities, so show the user some fake data. A real app in this
         * scenario could guess the user's location via IP lookup and then inject
         * that data into the page.
         */
        app.updateUserCard(initialWeatherForecast);
        app.selectedCities = [
            { key: initialWeatherForecast.key, label: initialWeatherForecast.label }
        ];
        app.saveSelectedCities();
    }

    // TODO add service worker code here
    /*if ('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('./service-worker.js')
               .then(function() { console.log('Service Worker Registered'); });
    }*/
})();

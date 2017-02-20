(function() {
    'use strict';

    var baseUrlConfig = {
        "development": 'http://localhost:1337/',
        "staging": 'https://wecat.herokuapp.com/',
        "production": 'http://localhost:1337/'
    }

    var app = {
        isLoading: true,
        baseUrl: baseUrlConfig.staging,
        visibleCards: {},
        currentUserList: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        filterArray: [],
        sortUsing: ''
    };

    const dbPromise = idb.open('keyval-store', 1, upgradeDB => {
        upgradeDB.createObjectStore('keyval');
    });

    const idbKeyval = {
        get(key) {
            return dbPromise.then(db => {
                return db.transaction('keyval')
                    .objectStore('keyval').get(key);
            });
        },
        set(key, val) {
            return dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').put(val, key);
                return tx.complete;
            });
        },
        delete(key) {
            return dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').delete(key);
                return tx.complete;
            });
        },
        clear() {
            return dbPromise.then(db => {
                const tx = db.transaction('keyval', 'readwrite');
                tx.objectStore('keyval').clear();
                return tx.complete;
            });
        },
        keys() {
            return dbPromise.then(db => {
                const tx = db.transaction('keyval');
                const keys = [];
                const store = tx.objectStore('keyval');

                // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
                // openKeyCursor isn't supported by Safari, so we fall back
                (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                    if (!cursor) return;
                    keys.push(cursor.key);
                    cursor.continue();
                });

                return tx.complete.then(() => keys);
            });
        }
    };

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Updates a user card with the latest user details. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateUserCard = function(data) {
        var dataLastUpdated = new Date(data.createdAt);

        var card = app.visibleCards[data.id];
        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.id] = card;
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
        card.querySelector('.detail-container .emp-email').textContent = data.workEmail;
        if (data.bloodGroup) {
            var bloodGroup1 = data.bloodGroup.substring(0, (data.bloodGroup.length - 3));
            var bloodGroup2 = data.bloodGroup.substring((data.bloodGroup.length - 3), data.bloodGroup.length);
            card.querySelector('.main-details .blood-group .bld-group1').textContent = bloodGroup1;
            card.querySelector('.main-details .blood-group .bld-group2').textContent = bloodGroup2;
        }
        card.querySelector('.main-details .contact .phone-no').textContent = data.contact;
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var lastdonated = new Date(data.lastDonated);
        var lastdonDate = lastdonated.getUTCDate() + '-' + monthNames[lastdonated.getMonth()] + '-' + lastdonated.getFullYear();
        card.querySelector('.last-donated .don-date').textContent = lastdonDate;
        var today = new Date();
        var timeDiff = Math.abs(today.getTime() - lastdonated.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        card.querySelector('.remaining-days .rem-days').textContent = diffDays;

        //adding click events to the card
        card.addEventListener("click", toggleCardLayout);

        console.log(data.name + " ---> " + getAge(data.dateOfBirth) + " ---> " + isAvailable(data.lastDonated));

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };


    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }


    function isAvailable(lastDonated) {
        var isAvailable = false;
        var diffDays = calculateRemainingDays(lastDonated);
        if (diffDays > 90) {
            isAvailable = true;
        }
        return isAvailable;
    }

    function calculateRemainingDays(lastDonated) {
        var today = new Date();
        var lastDonated = new Date(lastDonated);
        var timeDiff = Math.abs(today.getTime() - lastDonated.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function toggleCardLayout(event) {
        var classList = ''
        if (event.target.classList.value.includes("wecat-emp-card")) {
            classList = event.target.classList;
        } else if (event.target.offsetParent.classList.value.includes("wecat-emp-card")) {
            classList = event.target.offsetParent.classList;
        }
        if (classList.value.includes("collapsed-card")) {
            classList.remove('collapsed-card');
        } else {
            classList.add('collapsed-card');
        }
    }


    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    /*
     * Gets users blood donating details and updates the card with the data.
     * getUsers() first checks if the wecat data is in the cache. If so,
     * then it gets that data and populates the card with the cached data.
     * Then, getUsers() goes to the network for fresh data. If the network
     * request goes through, then the card gets updated a second time with the
     * freshest data.
     */
    app.getUsers = function() {
        var url = app.baseUrl + 'users/getAll';
        console.log('window', window);
        if ('caches' in window) {
            caches.match(url).then(function(response) {
                if (response) {
                    console.log('response', response);
                    response.json().then(function updateFromCache(json) {
                        console.log('json', json);
                        var results = json.query.results;
                        for (var inc = 0; inc < results.length; inc++) {
                            app.updateUserCard(results[inc]);
                        }
                    });
                }
            });
        }
        // Fetch the latest data.
        var request = new XMLHttpRequest();
        console.log('request', request);
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    var response = JSON.parse(request.response);
                    console.log(response);
                    // idbKeyval.set('userlist', response);
                    app.currentUserList = response;
                    app.saveSelectedUsers();
                    for (var inc = 0; inc < response.length; inc++) {
                        app.updateUserCard(response[inc]);
                    }

                } else {
                    // Return the initial weather forecast since no data is available.
                    if (!app.currentUserList.length) {
                        app.updateUserCard(initialUserData);
                    }
                }
            } else {
                console.log('request not completed!!');
            }
        };
        request.open('GET', url);
        request.send();
        // addClickEventToCards();
    };


    // TODO add saveSelectedUsers function here
    // Save list of users to indexeddb.
    app.saveSelectedUsers = function() {
        idbKeyval.set('userlist', app.currentUserList);
    };

    /*
     * Fake weather data that is presented when the user first uses the app
     */
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
            id: "000000000000000000000000"
        }
        // TODO uncomment line below to test app with fake data
        // app.updateUserCard(initialUserData);

    /************************************************************************
     *
     * Code required to start the app
     *
     ************************************************************************/

    idbKeyval.get('userlist').then(function(value) {
        console.log(value);
        app.currentUserList = value;
        if (app.currentUserList) {
            app.currentUserList.forEach(function(user) {
                app.updateUserCard(user);
            });
        } else {
            /* The user is using the app for the first time.
             */
            app.updateUserCard(initialUserData);
            app.currentUserList = [initialUserData];
            app.saveSelectedUsers();
        }
        app.getUsers();
    });


    // Get the filter modal
    var filterModal = document.getElementById('filterModal');

    // Get the sort modal
    var sortModal = document.getElementById('sortModal');

    // Get the button that opens the filter modal
    var filterModalBtn = document.getElementById("filterModalBtn");

    // Get the button that opens the sort modal
    var sortModalBtn = document.getElementById("SortModalBtn");

    // Get the <span> element that closes the modal
    var closeFilterModalBtn = document.getElementsByClassName("close-filterModal")[0];
    var closeSortModalBtn = document.getElementsByClassName("close-sortModal")[0];

    // When the user clicks the button, open the modal 
    filterModalBtn.onclick = function() {
        filterModal.style.display = "block";
    }

    // When the user clicks the button, open the modal 
    sortModalBtn.onclick = function() {
        sortModal.style.display = "block";
    }


    // When the user clicks on <span> (x), close the modal
    closeFilterModalBtn.onclick = function() {
        closeModal();
    }

    // When the user clicks on <span> (x), close the modal
    closeSortModalBtn.onclick = function() {
        closeModal();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if ((event.target == filterModal) || (event.target == sortModal)) {
            closeModal();
        }
    }

    function closeModal() {
        if (filterModal.style.display === "block") {
            filterModal.style.display = "none";
        } else if (sortModal.style.display === "block") {
            sortModal.style.display = "none";
        }
    }

    var filterbtn = document.getElementById('filterbtn');
    var sortbtn = document.getElementById('sortbtn');
    var filterClearbtn = document.getElementById('filterClearbtn');
    var sortClearbtn = document.getElementById('sortClearbtn');
    var availabilityFilter = document.getElementById('availability-filter');
    var bloodgroupFilter = document.getElementsByClassName('bloodgroup-filter');
    var sortingSection = document.getElementById('sorting-section');

    //filter the list from modal by choosing the required checkboxes
    filterbtn.onclick = function() {
        console.log('bloodgroupFilter', bloodgroupFilter);
        app.filterArray['availabilityFilter'] = getSelectedValueArray(availabilityFilter);
        app.filterArray['bloodgroupFilter'] = getSelectedValueArray(bloodgroupFilter[0]);
        app.filterArray['bloodgroupFilter'] = app.filterArray['bloodgroupFilter'].concat(getSelectedValueArray(bloodgroupFilter[1]));
        console.log('app.filterArray', app.filterArray);
        console.log('app.visibleCards', app.visibleCards);
        var filterList = [];
        var isFiltered = false;
        console.log('app.currentUserList', app.currentUserList);
        for (var userinc = 0; userinc < app.currentUserList.length; userinc++) {
            for (var inc = 0; inc < app.filterArray['bloodgroupFilter'].length; inc++) {
                if (app.currentUserList[userinc].bloodGroup === app.filterArray['bloodgroupFilter'][inc]) {
                    filterList.push(app.currentUserList[userinc]);
                    isFiltered = true;
                    break;
                }
            }
        }
        var finalIDList = [];
        if (!filterList.length) {
            filterList = app.currentUserList;
        }
        for (var inc = 0; inc < filterList.length; inc++) {
            if (app.filterArray['availabilityFilter'][0] === "Available") {
                if (filterList[inc].isAvailable) {
                    isFiltered = true;
                    finalIDList.push(filterList[inc]);
                }
            } else if (app.filterArray['availabilityFilter'][0] === "Unavailable") {
                if (!filterList[inc].isAvailable) {
                    isFiltered = true;
                    finalIDList.push(filterList[inc]);
                }
            }
        }


        if (!finalIDList.length) {
            finalIDList = filterList;
        }

        console.log('finalIDList', finalIDList);
        for (var userinc = 0; userinc < app.currentUserList.length; userinc++) {
            var isfound = false;
            app.visibleCards[app.currentUserList[userinc].id].removeAttribute('hidden');
            for (var inc = 0; inc < finalIDList.length; inc++) {
                if (app.currentUserList[userinc].id === finalIDList[inc].id) {
                    isfound = true;
                    break;
                }
            }
            if (!isfound) {
                app.visibleCards[app.currentUserList[userinc].id].setAttribute('hidden', true);
            }
        }
        console.log('isFiltered', isFiltered);

        closeModal();
    }

    sortbtn.onclick = function() {
        var selectedValueArr = [];
        var isSorted = false;
        selectedValueArr = getSelectedValueArray(sortingSection);
        app.sortUsing = selectedValueArr[0];
        console.log('sortingSection', sortingSection);
        console.log(getSelectedValueArray(sortingSection));

        switch (app.sortUsing) {
            case 'Availablity':
                app.currentUserList.sort(function(a, b) {
                    return parseInt(b.daysRemaining) - parseInt(a.daysRemaining);
                });
                isSorted = true;
                break;
            case 'Ascending':
                app.currentUserList.sort(function(a, b) {
                    return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
                });
                isSorted = true;
                break;
            case 'Decending':
                app.currentUserList.sort(function(a, b) {
                    return (a.name > b.name) ? -1 : ((b.name > a.name) ? 1 : 0);
                });
                isSorted = true;
                break;
            default:
                console.log("reached default for " + app.sortUsing);
        }


        if (isSorted) {
            for (var userinc = 0; userinc < app.currentUserList.length; userinc++) {
                app.visibleCards[app.currentUserList[userinc].id].parentNode.removeChild(app.visibleCards[app.currentUserList[userinc].id]);
            }

            app.visibleCards = [];

            for (var inc = 0; inc < app.currentUserList.length; inc++) {
                app.updateUserCard(app.currentUserList[inc]);
            }
        }

        closeModal();
    }

    filterClearbtn.onclick = function() {
        clearAllTheFilters();
        closeModal();
    }

    sortClearbtn.onclick = function() {
        closeModal();
    }

    //This for clearing all the selected values in the filter list and making all cards visible
    function clearAllTheFilters() {
        app.filterArray = [];
        clearSelectedValues(availabilityFilter);
        clearSelectedValues(bloodgroupFilter[0]);
        clearSelectedValues(bloodgroupFilter[1]);
        for (var userinc = 0; userinc < app.currentUserList.length; userinc++) {
            app.visibleCards[app.currentUserList[userinc].id].removeAttribute('hidden');
        }
    }


    function getSelectedValueArray(filter) {
        var valueArray = [];
        var elements = filter.elements;
        for (var inc = 0; inc < elements.length; inc++) {
            if (elements[inc].checked) {
                valueArray.push(elements[inc].value);
            }
        }
        return valueArray;
    }

    function clearSelectedValues(filter) {
        var elements = filter.elements;
        for (var inc = 0; inc < elements.length; inc++) {
            if (elements[inc].checked) {
                elements[inc].checked = false;
            }
        }
    }


    // add service worker code here
    /*if ('serviceWorker' in navigator) {
      navigator.serviceWorker
               .register('./service-worker.js')
               .then(function() { console.log('Service Worker Registered'); });
    }*/
})();

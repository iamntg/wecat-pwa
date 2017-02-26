(function() {
    'use strict';

    console.log('App is script');

    var headerElement = document.querySelector('body');
    var menuElement = document.querySelector('.menu__list');
    var metaTagTheme = document.querySelector('meta[name=theme-color]');

    //After DOM Loaded
    document.addEventListener('DOMContentLoaded', function(event) {
        //On initial load to check connectivity
        
        if (!navigator.onLine) {
            updateNetworkStatus();
        }

        window.addEventListener('online', updateNetworkStatus, false);
        window.addEventListener('offline', updateNetworkStatus, false);
    });

    if(document.readyState == 'complete') {
      console.log('navigator', navigator);
    }

    //To update network status
    function updateNetworkStatus() {
        if (navigator.onLine) {
            metaTagTheme.setAttribute('content', '#005265');
            headerElement.classList.remove('app_offline');
            menuElement.style.background = '#fff';
        } else {
            console.log('App is offline');
            metaTagTheme.setAttribute('content', '#6b6b6b');
            headerElement.classList.add('app_offline');
            menuElement.style.background = '#ececec';
        }
    }
})();

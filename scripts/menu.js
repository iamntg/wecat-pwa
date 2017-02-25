(function() {
    'use strict';

    var menuIconElement = document.querySelector('.header__icon');
    var menuElement = document.querySelector('.menu');
    var menuOverlayElement = document.querySelector('.menu__overlay');
    var goToDonorsListBtn = document.getElementById('goToDonorsList');
    var goToNewsFeedBtn = document.getElementById('goToNewsFeed');
    var goToWecatMembers = document.getElementById('goToWecatMembers');
    var goToWecatMedikit = document.getElementById('goToWecatMedikit');

    //Menu click event
    menuIconElement.addEventListener('click', showMenu, false);
    menuOverlayElement.addEventListener('click', hideMenu, false);
    menuElement.addEventListener('transitionend', onTransitionEnd, false);
    goToDonorsListBtn.addEventListener('click', goToPage, false);
    goToNewsFeedBtn.addEventListener('click', goToPage, false);
    goToWecatMembers.addEventListener('click', goToPage, false);
    goToWecatMedikit.addEventListener('click', goToPage, false);

    //To show menu
    function showMenu() {
        menuElement.style.transform = "translateX(0)";
        menuElement.classList.add('menu--show');
        menuOverlayElement.classList.add('menu__overlay--show');
    }

    //To hide menu
    function hideMenu() {
        menuElement.style.transform = "translateX(-110%)";
        menuElement.classList.remove('menu--show');
        menuOverlayElement.classList.remove('menu__overlay--show');
        menuElement.addEventListener('transitionend', onTransitionEnd, false);
    }

    var touchStartPoint, touchMovePoint;

    /*Swipe from edge to open menu*/

    //`TouchStart` event to find where user start the touch
    document.body.addEventListener('touchstart', function(event) {
        touchStartPoint = event.changedTouches[0].pageX;
        touchMovePoint = touchStartPoint;
    }, false);

    //`TouchMove` event to determine user touch movement
    document.body.addEventListener('touchmove', function(event) {
        touchMovePoint = event.touches[0].pageX;
        if (touchStartPoint < 10 && touchMovePoint > 30) {
            menuElement.style.transform = "translateX(0)";
        }
    }, false);

    function onTransitionEnd() {
        if (touchStartPoint < 10) {
            menuElement.style.transform = "translateX(0)";
            menuOverlayElement.classList.add('menu__overlay--show');
            menuElement.removeEventListener('transitionend', onTransitionEnd, false);
        }
    }

    function goToPage(event) {
        var elements = document.getElementsByClassName('page_content');
        for (var inc = 0; inc < elements.length; inc++) {
            elements[inc].setAttribute('hidden', true);
        }

        var element_id = (event.target.id) ? event.target.id : event.target.parentElement.id;
        console.log('element_id', element_id);
        switch (element_id) {
            case 'goToDonorsList':
                elements = document.getElementsByClassName('donors_list_page');
                for (var inc = 0; inc < elements.length; inc++) {
                    elements[inc].removeAttribute('hidden');
                }
                break;
            case 'goToNewsFeed':
                elements = document.getElementsByClassName('wecat_feed_page');
                for (var inc = 0; inc < elements.length; inc++) {
                    elements[inc].removeAttribute('hidden');
                }
                break;
            case 'goToWecatMembers':
                elements = document.getElementsByClassName('wecat_members_page');
                for (var inc = 0; inc < elements.length; inc++) {
                    elements[inc].removeAttribute('hidden');
                }
                break;
            case 'goToWecatMedikit':
                elements = document.getElementsByClassName('wecat_medikit_page');
                for (var inc = 0; inc < elements.length; inc++) {
                    elements[inc].removeAttribute('hidden');
                }
                break;
            default:
                console.log('reached default for ' + event.target.id);
        }

        hideMenu();
    }


})();

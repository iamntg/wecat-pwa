/**
 * @author Nitheesh T Ganesh
 * created on 20.12.2016
 */
(function() {
    'use strict';

    angular.module('wecat.pages', [
        'ngRoute',
        'wecat.pages.home'

    ]).config(routeConfig);

    function routeConfig($routeProvider) {
        $routeProvider.otherwise({ redirectTo: '/home' });
    }

})();

/**
 * @author Nitheesh T Ganesh
 * created on 20.12.2016
 */
(function() {
    'use strict';

    angular.module('wecat.parent')
        .controller('parentController', parentControllerFunction);

    /** @ngInject */
    function parentControllerFunction($location, $rootScope, $routeParams) {
        
    }

    parentControllerFunction.$inject = ['$location', '$rootScope', '$routeParams'];

})();

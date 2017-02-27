/**
 * @author VR T0467
 * created on 2.1.2017
 */

(function() {
    'use strict';

    angular.module('wecat.pages.home')
        .factory('homeService', homeService);


    function homeService(httpService) {

        var baseUrl = {
            "development": 'http://localhost:1337/',
            "staging": 'https://wecat.herokuapp.com/',
            "production": 'https://wecat.herokuapp.com/'
        };

        var currentBase = baseUrl.staging; 

        var _getAllUsers = function ( success, error) {
            var url = currentBase+'users/getAll';
            httpService.httpGet(url, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        };    

        var _createUser = function (params, success, error) {
            var url = currentBase+'users/createUser';
            httpService.httpPost(url, params, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        }; 

       	var _deleteUser = function (id, success, error) {
            var url = currentBase+'users/removeUser/'+id;
            httpService.httpDelete(url, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        }; 

        var _updateUser = function (params, success, error) {
            var url = currentBase+'users/updateUser';
            httpService.httpPut(url, params, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        };


        var _getMedikit = function ( success, error) {
            var url = currentBase+'medicine/getAll';
            httpService.httpGet(url, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        };    

        var _addMedicine = function (params, success, error) {
            var url = currentBase+'medicine/add';
            httpService.httpPost(url, params, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        }; 

       	var _deleteMedicine = function (id, success, error) {
            var url = currentBase+'medicine/remove/'+id;
            httpService.httpDelete(url, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        }; 

        var _updateMedicine = function (params, success, error) {
            var url = currentBase+'medicine/update';
            httpService.httpPut(url, params, function(respData) {
                success(respData);
            }, function(errData) {
                error(errData);
            });
        };

        return {
            getAllUsers: _getAllUsers,
            createUser: _createUser,
            deleteUser: _deleteUser,
            updateUser: _updateUser,
            getMedikit: _getMedikit,
            addMedicine: _addMedicine,
            deleteMedicine: _deleteMedicine,
            updateMedicine: _updateMedicine,
        };

    }

    homeService.$inject = ['httpService'];

})();

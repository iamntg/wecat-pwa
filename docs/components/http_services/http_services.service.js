/**
 * @author NTG
 * created on 14.12.2016
 */

(function () {
 	'use strict';

 	angular.module('wecat.httpService')
 	.factory('httpService', httpService);


 	function httpService($rootScope, $http, $log, $window) {
		
 		var showErrorToast = function(message){
 		    console.log('message', message);
 		    alert('Message: '+JSON.stringify(message));
 		};

		var _httpGet = function (url, cbSuccess, cbError) {
			$http({ 
                method: "GET",
                url: url,
                headers: {
                    "Content-Type": undefined
                }
            }).then(function getSuccess(succResponse) {
				console.log(succResponse);
				cbSuccess(succResponse.data);
			}, function getError(errResponse) {
				console.log(errResponse);
				cbError(errResponse);
			});
		};

		var _httpPost = function (url, requestParams, cbSuccess, cbError) {
			$http({ 
                method: "POST",
                url: url,
                data: requestParams
            }).then(function getSuccess(succResponse) {
				console.log(succResponse);
				cbSuccess(succResponse.data);
			}, function getError(errResponse) {
				console.log(errResponse);
				cbError(errResponse);
			});
		};

		var _httpPut = function (url, requestParams, cbSuccess, cbError) {
            $http.put(url, requestParams).then(function getSuccess(succResponse) {
            	console.log(succResponse);
				cbSuccess(succResponse.data);
            }, function getError(errResponse) {
				console.log(errResponse);
				cbError(errResponse);
			});
		};

		var _httpDelete = function (url, cbSuccess, cbError) {
			$http({ 
                method: "DELETE",
                url: url,
                headers: {
                    "Content-Type": undefined
                }
            }).then(function getSuccess(succResponse) {
				console.log(succResponse);
				cbSuccess(succResponse.data);
			}, function getError(errResponse) {
				console.log(errResponse);
				cbError(errResponse);
			});
		};

		return {
			httpGet: _httpGet,
			httpPost: _httpPost,
			httpDelete: _httpDelete,
			httpPut: _httpPut
		};

 	}
	
	httpService.$inject = ['$rootScope', '$http', '$log', '$window'];

 })();
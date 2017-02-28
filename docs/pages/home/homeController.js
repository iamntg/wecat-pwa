/**
 * @author Nitheesh T Ganesh
 * created on 20.12.2016
 */
(function() {
    'use strict';

    angular.module('wecat.pages.home')
        .controller('homeController', homeControllerFunction);

    /** @ngInject */
    function homeControllerFunction($scope, homeService, prompt) {
        var _self = this; //instance of this controller


        _self.snackMsg = "";
        _self.isEditUser = false;
        _self.isEditMedicine = false;

        var userFormModel = {
            "name": "",
            "empId": "",
            "password": "123456789",
            "personalEmail": "",
            "workEmail": "",
            "contact": "",
            "bloodGroup": "",
            "address": "",
            "lastDonated": "",
            "isAvailable": false,
            "dateOfBirth": "",
            "jobTitle": "",
            "image": "",
            "currentLocation": "",
            "isWecatMember": false,
            "wecatRole": "",
        }

        var medikitFormModel = {
            "name": "",
            "expiryDate": "",
            "purchaseDate": "",
            "count": "",
            "description": ""
        }

        _self.formData = angular.copy(userFormModel);
        _self.medikitFormData = angular.copy(medikitFormModel);

        _self.bloodGroups = ["A+ve", "A-ve", "B+ve", "B-ve", "O+ve", "O-ve", "AB+ve", "AB-ve"];
        _self.wecatRoles = ["Chairman", "Accountant", "Member"];

        _self.userList = [];
        _self.medikitList = [];


        /************************** User functions *******************************/

        _self.submitUser = function() {
            console.log(_self.formData);
            var curr = new Date();
            if (!_self.formData.isWecatMember) {
                _self.formData.wecatRole = '';
            }
            if (_self.formData.contact) {
                _self.formData.contact = '+91' + _self.formData.contact;
            }
            // _self.formData.personalEmail = curr.getTime() + '@some.com';
            var params = {
                "user": _self.formData
            }
            console.log('params', params);
            homeService.createUser(params, function(respData) {
                console.log('respData', respData);
                getAllUsers();
            }, function(err) {
                console.log('err', err);
            });
        }

        _self.clearUser = function() {
            _self.formData = angular.copy(userFormModel);
        }

        _self.initalize = function() {
            getAllUsers();
            getMedikit();
        }

        var getAllUsers = function() {
            homeService.getAllUsers(function(respData) {
                console.log('respData', respData);
                _self.userList = respData;
            }, function(err) {
                console.log('err', err);
            });
        }


        _self.deleteUser = function(user) {
            console.log('user', user);
            //simple confirmation
            prompt({
                title: 'Deleting ' + user.name + '?',
                message: 'Are you sure you want to delete ' + user.name + '?'
            }).then(function() {
                homeService.deleteUser(user.id, function(respData) {
                    console.log('respData', respData);
                    showSnackBar(user.name + " has been deleted!");
                    getAllUsers();
                }, function(err) {
                    console.log('err', err);
                });
            });


        }

        _self.editUser = function(user) {
            console.log('user', user);
            var contact = user.contact;
            _self.formData = angular.copy(user);
            _self.formData.lastDonated = (user.lastDonated) ? new Date(user.lastDonated) : "";
            _self.formData.dateOfBirth = (user.dateOfBirth) ? new Date(user.dateOfBirth) : "";
            _self.formData.contact = (contact) ? contact.substring(3, contact.length) : "";
            _self.isEditUser = true;
        }

        _self.updateUser = function() {
            console.log(_self.formData);
            var curr = new Date();
            if (!_self.formData.isWecatMember) {
                _self.formData.wecatRole = '';
            }
            if (_self.formData.contact) {
                _self.formData.contact = '+91' + _self.formData.contact;
            }
            var params = {
                "user": _self.formData
            }
            console.log('params', params);
            homeService.updateUser(params, function(respData) {
                console.log('respData', respData);
                _self.formData = angular.copy(userFormModel);
                showSnackBar(_self.formData.name + " has been updated!");
                getAllUsers();
            }, function(err) {
                console.log('err', err);
            });
        }


        _self.addNewUser = function() {
            _self.formData = angular.copy(userFormModel);
            _self.isEditUser = false;
        }



        /************************** Medikit functions *******************************/

        _self.addMedicine = function() {
            console.log(_self.medikitFormData);
            var params = {
                "medicine": _self.medikitFormData
            }
            console.log('params', params);
            homeService.addMedicine(params, function(respData) {
                console.log('respData', respData);
                getMedikit();
            }, function(err) {
                console.log('err', err);
            });
        }

        _self.clearMedicine = function() {
            _self.medikitFormData = angular.copy(medikitFormModel);
        }

        var getMedikit = function() {
            homeService.getMedikit(function(respData) {
                console.log('respData', respData);
                _self.medikitList = respData;
            }, function(err) {
                console.log('err', err);
            });
        }


        _self.deleteMedicine = function(medicine) {
            console.log('medicine', medicine);
            prompt({
                title: 'Deleting ' + medicine.name + '?',
                message: 'Are you sure you want to delete ' + medicine.name + '?'
            }).then(function() {
                homeService.deleteMedicine(medicine.id, function(respData) {
                    console.log('respData', respData);
                    showSnackBar(medicine.name + " has been deleted!");
                    getMedikit();
                }, function(err) {
                    console.log('err', err);
                });
            });
        }

        _self.editMedicine = function(medicine) {
            console.log('medicine', medicine);
            _self.medikitFormData = angular.copy(medicine);
            _self.medikitFormData.expiryDate = (medicine.expiryDate) ? new Date(medicine.expiryDate) : "";
            _self.medikitFormData.purchaseDate = (medicine.purchaseDate) ? new Date(medicine.purchaseDate) : "";
            _self.isEditMedicine = true;
        }

        _self.updateMedicine = function() {
            console.log(_self.medikitFormData);
            var params = {
                "medicine": _self.medikitFormData
            }
            console.log('params', params);
            homeService.updateMedicine(params, function(respData) {
                console.log('respData', respData);
                showSnackBar(_self.medikitFormData.name + " has been updated!");
                getMedikit();
            }, function(err) {
                console.log('err', err);
            });
        }


        _self.addNewMedicine = function() {
            _self.medikitFormData = angular.copy(medikitFormModel);
            _self.isEditMedicine = false;
        }



        var showSnackBar = function(msg) {
            _self.snackMsg = msg;
            // Get the snackbar DIV
            var x = document.getElementById("snackbar")
            x.className = "show";
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
        }


    }

    homeControllerFunction.$inject = ['$scope', 'homeService', 'prompt'];

})();

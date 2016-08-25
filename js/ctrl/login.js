var jwt_decode = require('jwt-decode');

export default function(cacaoApp) {
    cacaoApp.controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$location', '$mdLoginToast',
        function($scope, $http, $localStorage, $location, $mdLoginToast) {
            $scope.userData = {};

            //$scope.show = function() {
            //};

            $scope.saveData = function() {
                if ($scope.loginForm.$valid) {
                    $http.post('http://localhost:8000/api-token-auth/', $scope.userData)
                        .success(function(data) {
                            $localStorage.jwtToken = data.token;
                            $localStorage.jwtData = jwt_decode(data.token);
                            $scope.nav.userData = $localStorage.jwtData;
                            $mdLoginToast.show('Success');
                            $location.path('/');
                        })
                        .error(function() {
                            $mdLoginToast.show('Invalid Login');
                        });
                }
                if ($scope.loginForm.$invalid) {
                     console.log("invalid");
                }
            };
    }]);
}

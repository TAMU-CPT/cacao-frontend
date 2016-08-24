var jwt_decode = require('jwt-decode');

export default function(cacaoApp) {
    cacaoApp.controller('LoginCtrl', ['$scope', '$http', '$localStorage', '$location',
        function($scope, $http, $localStorage, $location) {
            $scope.userData = {};
            $scope.saveData = function() {
                if ($scope.loginForm.$valid) {
                    $http.post('http://localhost:8000/api-token-auth/', $scope.userData)
                        .success(function(data) {
                            $localStorage.jwtToken = data.token;
                            $localStorage.jwtData = jwt_decode(data.token);
                            $scope.nav.userData = $localStorage.jwtData;
                            $location.path('/');
                        })
                        .error(function() {
                        });
                }
                if ($scope.loginForm.$invalid) {
                     console.log("invalid");
                }
            };
    }]);
}

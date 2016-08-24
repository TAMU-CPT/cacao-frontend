export default function(cacaoApp) {
    cacaoApp.controller('NavCtrl', ['$scope', '$mdSidenav', '$localStorage', '$location', 'CacaoBackend', 'NotificationBackend',
        function ($scope, $mdSidenav, $localStorage, $location, CacaoBackend, NotificationBackend) {

            $scope.nav = {}
            $scope.nav.userData = $localStorage.jwtData;

            $scope.go = function(route){
                if (route == '/teams/') {
                    CacaoBackend.one('users', $scope.nav.userData.user_id).get().then(function(data) {
                        $location.path(route + data.group[0].id);
                    });
                }
                else if (route == '/users/') {
                    $location.path(route + $scope.nav.userData.user_id);
                }
                else { $location.path(route); }
            };

            $scope.get_notifications = function() {
                NotificationBackend.all('inbox').getList().then(function(data) {
                    if (data.plain().length > 0) {
                        $scope.nav.notifications = data;
                    } else {
                        $scope.nav.notifications = null;
                    }
                });
            };
    }]);
}

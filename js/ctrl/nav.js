export default function(cacaoApp) {
    cacaoApp.controller('NavCtrl', ['$scope', '$mdSidenav', '$localStorage', '$location', 'CacaoBackend', 'NotificationBackend', '$interval', '$http', 'DRF_URL', 'REMOTE_USER',
        function ($scope, $mdSidenav, $localStorage, $location, CacaoBackend, NotificationBackend, $interval, $http, DRF_URL, REMOTE_USER) {
            $scope.nav = {}
            $scope.nav.userData = $localStorage.jwtData;

            $scope.$on('$locationChangeStart', function(event) {
                if ($location.path() == '/login') {
                    $scope.nav.show_login_button = false;
                } else { $scope.nav.show_login_button = true; }
            });

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

            // If remote user mode is turned on and there is no JWT token
            if(REMOTE_USER && $localStorage.jwtToken !== undefined){
                // Then we make a quick request to check who we are
                $http.get(DRF_URL + 'api-token-auth-whoami/')
                    .success(function(data){
                        // Which, if it succeeds, means we are auth'd under REMOTE_USER
                        $localStorage.jwtToken = 'REMOTE_USER';
                        // And we can just set our data.
                        $localStorage.jwtData = {
                            username: data.username,
                            user_id: data.id,
                            email: data.username,
                            exp: null
                         };
                        $scope.nav.userData = $localStorage.jwtData;
                    });
            }

            $scope.get_notifications = function() {
                NotificationBackend.all('inbox').getList().then(function(data) {
                    if (data.plain().length > 0) {
                        $scope.nav.notifications = data;
                    } else {
                        $scope.nav.notifications = null;
                    }
                });
            };

            $scope.get_notifications_wrapper = function() {
                $scope.get_notifications();
                $interval($scope.get_notifications, 30000);
            };

            $scope.showNav = true;
            if($location.search().hideNav){
                $scope.showNav = false;
            }

    }]);
}

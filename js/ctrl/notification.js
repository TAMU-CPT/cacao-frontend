export default function(cacaoApp){
    cacaoApp.controller('NotificationCtrl', ['$scope', 'NotificationBackend', '$http', 'DRF_URL',
        function($scope, NotificationBackend, $http, DRF_URL) {
            NotificationBackend.all('inbox').getList().then(function(data) {
                $scope.notifications = data;
                if (data.plain().length > 0) {
                    $scope.nav.notifications = data;
                } else {
                    $scope.nav.notifications = null;
                }
            });

            $scope.markRead = function(index) {
                var url = "inbox/" + $scope.notifications[index].id + "/read";
                NotificationBackend.all(url).post({})
                .then(function(idk) {
                    $scope.notifications.splice(index, 1);
                    if ($scope.notifications.length == 0) {
                        $scope.nav.notifications = null;
                    }
                });
            };

            $scope.markAllRead = function() {
                $http.post(DRF_URL + 'mark_all_read/', '')
                    .success(function(data) {
                        $scope.notifications.splice(0, $scope.notifications.length);
                        $scope.nav.notifications = null;
                    })
                    .error(function() {
                    });
            };
    }]);
}

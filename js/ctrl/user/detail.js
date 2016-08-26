var moment = require('moment');
export default function(cacaoApp) {
    cacaoApp.controller('UserDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
        function($scope, $routeParams, CacaoBackend) {
            $scope.date_process = function(date) {
                return moment(date).fromNow();
            };

            $scope.ordering="date";

            $scope.promise = $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                    console.log(page);
                $scope.query.ordering = $scope.ordering;
                CacaoBackend.all('gafs').getList($scope.query).then(function(data) {
                    $scope.data = data;
                });
            };

            // previous annotations with same go id
            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            CacaoBackend.one('users', $routeParams.userID).get().then(function(data) {
                $scope.user = data;
                $scope.query = {
                    limit: 5,
                    page: 1,
                    owner: data.id,
                    ordering: $scope.ordering,
                };

                $scope.updateData($scope.query.ordering);
            });
    }]);
}

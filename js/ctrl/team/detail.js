export default function(cacaoApp) {
    cacaoApp.controller('TeamDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
        function($scope, $routeParams, CacaoBackend) {
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

            CacaoBackend.one('groups', $routeParams.teamID).get().then(function(data) {
                $scope.team = data;
                $scope.query = {
                    limit: 5,
                    page: 1,
                    team: data.id,
                    ordering: $scope.ordering,
                };
                $scope.updateData($scope.query.ordering);
            });
    }]);
}

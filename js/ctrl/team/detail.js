export default function(cacaoApp) {
    cacaoApp.controller('TeamDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
        function($scope, $routeParams, CacaoBackend) {
            var team_usernames = [];

            $scope.updateData = function(page) {
                $scope.query.page = page;
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
                };

                $scope.updateData(1);
            });
    }]);
}

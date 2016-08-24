export default function(cacaoApp) {
    cacaoApp.controller('UserDetailCtrl', ['$scope', '$routeParams', 'CacaoBackend',
        function($scope, $routeParams, CacaoBackend) {

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


            CacaoBackend.one('users', $routeParams.userID).get().then(function(data) {
                $scope.user = data;

                $scope.query = {
                    limit: 5,
                    page: 1,
                    owner: data.id,
                };

                $scope.updateData(1);
            });
    }]);
}

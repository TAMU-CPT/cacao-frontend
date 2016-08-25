export default function(cacaoApp) {
    cacaoApp.controller('UserListCtrl', ['$scope', 'CacaoBackend',
        function($scope, CacaoBackend) {
            $scope.ordering="username";
            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                $scope.query.ordering = $scope.ordering;
                $scope.promise = CacaoBackend.all('users').getList($scope.query).then(function(data) {
                    $scope.users = data;
                });
            };

            $scope.options = {
                limitSelect: true,
                pageSelect: true
            };

            $scope.query = {
                limit: 5,
                page: 1,
                ordering: $scope.ordering,
            };

            $scope.updateData(1);
    }]);
}

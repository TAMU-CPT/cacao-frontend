export default function(cacaoApp) {
    cacaoApp.controller('GAFListCtrl', ['$scope', 'CacaoBackend',
        function($scope, CacaoBackend) {
            $scope.ordering = "-date";

            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                $scope.query.ordering = $scope.ordering;

                $scope.promise = CacaoBackend.all('gafs').getList($scope.query);
                $scope.promise.then(function(data) {
                    $scope.data = data;
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

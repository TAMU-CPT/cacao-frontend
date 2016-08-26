export default function(cacaoApp) {
    cacaoApp.controller('TeamListCtrl', ['$scope', 'CacaoBackend', '$location',
        function($scope, CacaoBackend, $location) {
            $scope.go = function(id) {
                console.log(id);
                $location.path('/teams/' + id);;
            };

            $scope.ordering="name";

            $scope.updateData = function(page) {
                if(!isNaN(parseInt(page))){
                    $scope.query.page = page;
                }
                $scope.query.ordering = $scope.ordering;
                $scope.promise = CacaoBackend.all('groups').getList($scope.query).then(function(data) {
                    $scope.teams = data;
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

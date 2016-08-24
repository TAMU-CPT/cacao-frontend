export default function(cacaoApp) {
    cacaoApp.controller('UserListCtrl', ['$scope', 'CacaoBackend',
        function($scope, CacaoBackend) {
            CacaoBackend.all('users').getList().then(function(data) {
                $scope.users = data;
            });
    }]);
}

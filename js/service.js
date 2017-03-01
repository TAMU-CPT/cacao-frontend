export default function(cacaoApp) {
    cacaoApp.service('$mdLoginToast', ['$mdToast', function($mdToast) {
        return {
            show: function(content) {
            return $mdToast.show(
              $mdToast.simple()
                .content(content)
                .position('top right')
                .hideDelay(2000)
            )}
        };
    }]);
}

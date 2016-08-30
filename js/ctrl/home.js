export default function(cacaoApp) {
    cacaoApp.controller('HomeCtrl', ['$scope','$mdDialog', '$location',
        function($scope, $mdDialog, $location) {
            $scope.home = [
                {
                    title: "CACAO",
                    url: "#/about",
                    description: "Welcome to CACAO! Here you will annotate proteins with Gene Ontology Terms. Yay!",
                    button_title: "Get excited!",
                },
                {
                    title: "Users",
                    url: "#/users",
                    description: "Browse users registered in the CACAO System",
                },
                {
                    title: "Teams",
                    url: "#/teams",
                    description: "Check out the competition!",
                },
                {
                    title: "Review",
                    url: "#/review",
                    description: "Review student annotations.",
                    button_title: "I am an admin",
                },
                {
                    title: "GAF Create",
                    url: "#/gaf/create",
                    description: "Submit a new Annotation",
                },
                {
                    title: "GAF List",
                    url: "#/gaf/list",
                    description: "See other annotations.",
                },
            ];

            $scope.choice_popup = function(ev) {
                $mdDialog.show({
                    contentElement: '#search_by',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                });
            };

            $scope.cancel = function() {
                $mdDialog.cancel();
            };

            $scope.search_by_gene = function() {
                $scope.cancel();
                $location.path('/search/gene');
            };

            $scope.search_by_organism = function() {
                $scope.cancel();
                $location.path('/search/organism');
            };
    }]);
}

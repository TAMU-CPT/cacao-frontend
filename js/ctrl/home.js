export default function(cacaoApp) {
    cacaoApp.controller('HomeCtrl', ['$scope','$mdDialog',
        function($scope, $mdDialog) {
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
                {
                    title: "PMID #1",
                    url: "#/pmid/1",
                },
                {
                    title: "GO:0000001",
                    url: "#/goid/GO:0000001"
                },
                {
                    title: "Testing",
                    url: "#/test",
                    description: "Here be dragons",
                    button_title: "I have been warned",
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
    }]);
}

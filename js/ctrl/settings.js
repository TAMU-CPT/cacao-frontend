export default function(cacaoApp) {
	cacaoApp.controller('SettingsCtrl', ['$scope', 'CacaoBackend', 'DRF_URL',
		function ($scope, CacaoBackend, DRF_URL) {
			$scope.DRF_URL = DRF_URL;

			$scope.refresh = function(){
				CacaoBackend.oneUrl('api-token-auth-api/').post().then(
					function(success) {
						$scope.nav.userData.token = success.token;
					},
					function(fail) {
						//$scope.bad_go_id = $routeParams.GOID;
					}
				);
			}
		}
	]);
}

export default function(cacaoApp) {
    cacaoApp.factory('NotificationBackend', function(Restangular, DRF_URL) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(DRF_URL + 'api');
            RestangularConfigurer.setRequestSuffix('/');
        });
    });

    cacaoApp.factory('CacaoBackend', function(Restangular, DRF_URL) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(DRF_URL);
            RestangularConfigurer.setRequestSuffix('/');
            RestangularConfigurer.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
                var extractedData;
                // .. to look for getList operations
                if (operation === "getList") {
                // .. and handle the data and meta data
                    extractedData = data.results;
                    extractedData.meta = {
                        'count': data.count,
                        'next': data.next,
                        'previous': data.previous
                    }
                } else {
                    extractedData = data;
                }
                return extractedData;
            });
        });
    });
}

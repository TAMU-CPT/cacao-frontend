export default function(cacaoApp) {
    cacaoApp.factory('NotificationBackend', function(Restangular) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('http://localhost:8000/api');
            RestangularConfigurer.setRequestSuffix('/');
        });
    });

    cacaoApp.factory('CacaoBackend', function(Restangular) {
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('http://localhost:8000/');
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

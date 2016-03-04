var app = angular.module("MyApp");

app.service('ContainerService', function($http, $log) {
  this.getContainers = function() {
      return $http.get("/api/containers").then(function(response) {
        // $log.info( response );
        return response.data;
      });
  };
});

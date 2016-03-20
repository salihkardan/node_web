var app = angular.module("MyApp");

app.service('ContainerService', function($http, $log) {
  this.getContainers = function() {
      return $http.get("/api/containers").then(function(response) {
        // $log.info( response );
        return response.data;
      });
  };
});


app.service('HotelService', function($http, $log) {
  this.getHotels = function() {
      return $http.get("/service/authenticate/getHotels").
        then(function(response) {
          return response.data;
        });
  };
});

app.service('BookService', function($http, $log) {
  this.getBooks = function() {
      return $http.get("/api/books").then(function(response) {
        // $log.info( response );
        return response.data;
      });
  };
});

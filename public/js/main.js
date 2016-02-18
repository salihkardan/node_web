var app = angular.module("MyApp", [
	'ui.router',
	'ui.bootstrap',
	'angular-rickshaw'
]);

app.config(function($stateProvider, $httpProvider) {
	$stateProvider
		.state('machines', {
			url: "/machines",
			templateUrl: "partials/machines.html",
			controller: "MachinesController",
        })
        .state('hello', {
			url: "/hello",
			templateUrl: "partials/hello.html",
			controller: "HelloController",
		})
        .state('login', {
			url: "/login",
			templateUrl: "partials/login.html",
			controller: "LoginController",
		})
        
    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    //Remove the header used to identify ajax call  that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
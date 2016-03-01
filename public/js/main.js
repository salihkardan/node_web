var app = angular.module("MyApp", [
	'ui.router',
	'ui.bootstrap',
  'angular-rickshaw',
  'ngWebSocket'
]);

app.config(function($stateProvider, $httpProvider) {
	$stateProvider
		.state('machines', {
			url: "/machines",
			templateUrl: "partials/machines.html",
			controller: "MachinesController",
    })
    .state('ws', {
			url: "/ws",
			templateUrl: "partials/websocket.html",
			controller: "WSController",
    })
    .state('hello', {
			url: "/hello",
			templateUrl: "partials/hello.html",
			controller: "HelloController",
    })
    .state('containers', {
			url: "/containers",
			templateUrl: "partials/containers.html",
			controller: "DockerController",
    })
    .state('signup', {
			url: "/signup",
			templateUrl: "partials/signup.html",
			controller: "SignupController",
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


app.run(function($rootScope, $location, $state) {
    $state.go("login");
	if ( localStorage.token ){
		$rootScope.token = localStorage.token;
	}

	$rootScope.logout = function() {
    console.log("logout")
		delete localStorage.token;
		$rootScope.token = null;
		$state.go("login");
	}

	// $rootScope.$on('$stateChangeStart',
	// 	function(event, toState, toParams, fromState, fromParams) {
	// 		// Check tostate
    //     var whitelist  = ["signup", "login"];
	// 		if (!$rootScope.token) {
	// 			if ( !whitelist.indexOf(toState)){
	// 				$state.go("login")
	// 				event.preventDefault();
	// 			}
	// 		}
	// 	});
})

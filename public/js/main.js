	var app = angular.module("MyApp", [
	'ui.router',
	'ui.bootstrap',
  'angular-rickshaw',
  'ngWebSocket',
	'ngAnimate',
]);

app.config(function($stateProvider, $httpProvider) {
	$stateProvider
		.state('machines', {
			url: "/machines",
			templateUrl: "partials/machines.html",
			controller: "MachinesController",
    })
		.state('books', {
			url: "/books",
			templateUrl: "partials/books.html",
			controller: "BooksController",
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

		// HTTP Interceptor for config
		$httpProvider.interceptors.push('APIInterceptor');

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

app.factory('APIInterceptor', function($q, $rootScope) {
	return {
		// optional method
		'request': function(config) {
			// TODO: Check paths for api endpoints
			// TODO: Check if login , not redirect to login
			// TODO: Don't check token on login
			// TODO: Not all 401s mean login required
			if ($rootScope.token) {
				config.headers['x-access-token'] = $rootScope.token;
				// config.headers['Authorization'] = 'Bearer ' + $rootScope.token;
			}
			return config;
		},

		// optional method
		'requestError': function(rejection) {
			// do something on error
			return $q.reject(rejection);
		},


		// optional method
		'response': function(response) {
			// do something on success
			return response;
		},

		// optional method
		'responseError': function(rejection) {
			// do something on error
			return $q.reject(rejection);
		}
	};
});

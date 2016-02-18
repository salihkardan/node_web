var app = angular.module("MyApp");

app.controller("MachinesController", function ($scope) {
    console.log("hello")
	$scope.machines = [{
		hostname: "demo-server1",
		ip: "192.168.1.4",
		uptime: "10 minutes",
		incidents: "4"
	}];
});

app.controller("HelloController", function ($scope) {
    console.log("hello")
});


app.controller("LoginController", function($scope, $http, $rootScope, $state) {
    $scope.form = {};
    $scope.login = function() {
        $http.post("/api/login", {
            email: $scope.form.email,
            password: $scope.form.password
        }).then(function success(resp) {
            $state.go("machines");
            $scope.error = false;
        }, function error(resp) {
            $scope.error = true;
        });
    }
});



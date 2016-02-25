var app = angular.module("MyApp");

app.controller("MachinesController", function ($scope, $state, $rootScope) {  
    if ($rootScope.token) {
        $scope.machines = [{
            hostname: "demo-server1",
            ip: "192.168.1.4",
            uptime: "10 minutes",
            incidents: "4"
        }];
    } else {
        $state.go("login");
    }
});

app.controller("HelloController", function ($scope, $state) {
    console.log("helooooooooo");
});

app.controller("DockerController", function ($http, $scope, $rootScope, $state) {
    $scope.containers = [];
     if ($rootScope.token) {
        $http.get("/api/containers").then(function success(resp) {
            $scope.containers = resp.data;
        });
    } else {
        $state.go("login");
    }
});

app.controller("SignupController", function ($scope, $http, $rootScope, $state) {
    
    $scope.signup = function() {
        $http.post("/api/signup", {
            email: $scope.email,
            password: $scope.pw1,
            password_check: $scope.pw2
        }).then(function success(resp) {
            console.log(resp.data.token);
            $state.go("login");
            $scope.error = false;
        }, function error(resp) {
            $state.go("signup");
            $scope.error = true;
        });
    }
});

app.controller("LoginController", function ($scope, $http, $rootScope, $state) {
    if ($rootScope.token) {
        $state.go("machines");
    } else {
        $scope.form = {};
        $scope.login = function() {
            $http.post("/api/login", {
                email: $scope.email,
                password: $scope.pw1
            }).then(function success(resp) {
                console.log(resp.data.token);
                $rootScope.token = resp.data.token;
                localStorage.token = resp.data.token;
                $state.go("machines");
                $scope.error = false;
            }, function error(resp) {
                $state.go("login");
                $scope.error = true;
            });
        }
    }    
});



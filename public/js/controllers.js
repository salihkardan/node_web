var app = angular.module("MyApp");

app.controller("MachinesController", function ($scope, $state, $rootScope, BookService) {
    if ($rootScope.token) {
        $scope.machines = [{
            hostname: "demo",
            ip: "192.168.1.4",
            uptime: "10 mins",
            incidents: "4"
        },
        {
            hostname: "demo2",
            ip: "192.168.1.3",
            uptime: "40 mins",
            incidents: "4"
        },
        {
            hostname: "demo3",
            ip: "192.168.1.3",
            uptime: "40 mins",
            incidents: "4"
        },
        {
            hostname: "demo4",
            ip: "192.168.1.3",
            uptime: "40 mins",
            incidents: "4"
        },
        {
            hostname: "demo5",
            ip: "192.168.1.3",
            uptime: "40 mins",
            incidents: "4"
        }];
    } else {
        $state.go("login");
    }

    $scope.selected = null;
    $scope.books = [];
    $scope.selectRow = function(machine){
      $scope.selected = true;
      BookService.getBooks().then(function(books){
        $scope.books = books;
      });
    }
    $scope.clear = function(){
      $scope.selected = false;
    }
    $scope.myModel = {
      myRadio : true
    };
});


app.controller("BooksController", function ($scope, $state, BookService) {
    $scope.books = [];
    BookService.getBooks().then(function(books){
      $scope.books   = books;
    });
});

app.controller("HelloController", function ($scope, $state) {
    console.log("helooooooooo");
});


app.controller("WSController", function ($http, $scope, $rootScope, $state, $websocket) {
    var containerId = "498da2d418a2"
    var url = "ws://localhost:2375/v1.22/containers/" + containerId + "/attach/ws?logs=1&stdin=1&stderr=1&stdout=1&stream=1";
    console.log(url)
    var ws = $websocket(url);

    ws.onOpen( function(){
      console.log("opened")
    });

    $scope.command = "ls "
    $scope.sendCommand = function() {
      var command = $scope.command + "\n";
      console.log( "sending " + command );
      ws.send(command)

      ws.onMessage(function(message) {
        console.log( message.data  )
        var array = [];
        array = message.data;
        console.log (array);
        $scope.output = String(array);
      });
    }
});


// app.controller("WSController", function ($http, $scope, $rootScope, $state, $websocket) {
//     $scope.messages = [];
//     var dataStream = $websocket('ws://localhost:8080/echo');
//     dataStream.send('ping');  // send a message to the websocket server
//     dataStream.onMessage(function (message) {
//         console.log( message.data )
//         $scope.messages.unshift(JSON.parse(message.data));
// 		if ($scope.messages.length > 15)
//             $scope.messages = $scope.messages.slice(0, 15);
// 	});
// });

app.controller("DockerController", function ($http, $scope, $uibModal, $log, $rootScope, $state, ContainerService) {
    $scope.containers = [];
    if ($rootScope.token) {
        // use ContainerService to get all containers
        ContainerService.getContainers().then(function(containers){
          $scope.containers = containers;
        });

        $scope.animationsEnabled = true;
        $scope.container;
        $scope.open = function (Id) {
          for (var i = 0; i < $scope.containers.length; i++) {
            if ( $scope.containers[i].Id == Id ){
              $scope.container = $scope.containers[i];
            }
          }
          $scope.fillHere = $scope.container;
          var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'MyCtrl',
            resolve: {
                titleText: function() {return $scope.container; },
            }
          });

          modalInstance.result.then(function (result) {}, function () {
            $log.info('Modal dismissed at: ' + new Date());
          });
        };

    } else {
        $state.go("login");
    }
});

app.controller("LoginController", function ($scope, $http, $uibModal, $rootScope, $state, $log) {
    if ($rootScope.token) {
        $state.go("machines");
    } else {
        $scope.form = {};
        $scope.login = function() {
            $http.post("/api/login", {
                email: $scope.email,
                password: $scope.pw1
            }).then(function success(resp) {
                $rootScope.token = resp.data.token;
                localStorage.token = resp.data.token;
                $state.go("machines");
                $scope.error = false;
            }, function error(resp) {
                $state.go("login");
                $scope.error = true;
            });
        }

        $scope.animationsEnabled = true;

        $scope.open = function (size) {
          var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'partials/modals/signupModal.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
              email: function () { return $scope.email; },
              password: function () { return $scope.pw1; },
              password_check: function () { return $scope.pw2; }
            }
          });

          modalInstance.result.then(function (result) {
            $http.post("/api/signup", {
                email: result.email,
                password: result.password,
                password_check: result.password_check
            }).then(function success(resp) {
                $state.go("login");
                $scope.error = false;
            }, function error(resp) {
                $state.go("login");
                $scope.error = true;
            });

          }, function () {
            $log.info('Modal dismissed at: ' + new Date());
          });
        };

    }
});

app.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
  $scope.ok = function () {
    $uibModalInstance.close({'email':$scope.email, 'password':$scope.pw1, 'password_check': $scope.pw2});
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

app.controller('MyCtrl', function ($scope, $uibModalInstance, titleText) {
  $scope.fillHere = JSON.stringify(titleText, undefined, 2);
  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

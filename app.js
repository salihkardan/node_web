// Express module.
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    mysql = require('mysql'),
    jwt = require('express-jwt'),
    uuid = require('uuid'),
    nJwt = require('njwt');
    
var Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

var signingKey = uuid.v4(); // For example purposes

var claims = {
  iss: "http://localhost/",  // The URL of your service
  sub: "salih",    // The UID of the user in your system
  scope: "self, admins"
}

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'siem'
});

connection.connect();

// Authentication module.
var auth = require('http-auth');
var basic = auth.basic({
	realm: "Simon Area.",
	file: "pass.txt"
});

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}


// Application setup.
var app = express();
app.use(auth.connect(basic));

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.bodyParser());
app.use(express.logger('dev'))  
app.use(stylus.middleware(
    { 
        src: __dirname + '/public',
        compile: compile
    }
))
app.use(express.static(__dirname + '/public'))

// Setup route.
app.get('/', function (req, res) {
    res.render('index')
})

// app.get('/protected',
//   jwt({secret: 'shhhhhhared-secret'}),
//   function(req, res) {
//     if (!req.user.admin) return res.sendStatus(401);
//     res.sendStatus(200);
//   });
  
app.post('/api/login', function (req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    res.setHeader('Content-Type', 'application/json');
    var queryStr = 'select * from users where username=\"' + email + '\" and password=\"' + pass + "\"";
    console.log(queryStr);
    var token = nJwt.create(claims,signingKey)
    connection.query(queryStr, function (err, result, fields) {
        if (err) {
            throw err;
        }
        if (result.length > 0) {
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
        else {  
            res.status(400).send() 
        }     
    });
});


app.get('/api/containers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    docker.listContainers(function (err, containers) {
        res.json(containers);
    });
});

app.get("/partials/*", function(req, res) {
	// TODO: Directory traversal attack
	var template = req.params[0].replace(".html", "");
	res.render("partials/" + template);
});


// Start server.
app.listen(8080);

// Log URL.
console.log("Server running at http://127.0.0.1:8080/");
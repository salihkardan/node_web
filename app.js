// Express module.
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    jwt = require('express-jwt'),
    uuid = require('uuid'),
    nJwt = require('njwt'),
    Docker = require('dockerode'),
    Sequelize = require('sequelize');
    
    
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
var sequelize = new Sequelize('siem', 'root', 'root', {
    host: "127.0.0.1",
    dialect: 'mysql',
    define: {
        timestamps: false, // disables createdAt and some other extra fields
    }
});

// user model
var User = sequelize.define('users', {
    username: Sequelize.STRING,
    password: Sequelize.STRING
});

var signingKey = uuid.v4(); // For example purposes

var claims = {
  iss: "http://localhost/",  // The URL of your service
  sub: "salih",              // The UID of the user in your system
  scope: "self, admins"
}

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
    var token = nJwt.create(claims, signingKey)
    User.findOne({ where: { username: email, password: pass } }).then(function (user) {
        if (user != null) {
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed!'
            });
        }
    })
});


app.post('/api/signup', function (req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    var pass_check = req.body.password_check;
   
    res.setHeader('Content-Type', 'application/json');
    if (pass != pass_check) {
        res.status(400).send() 
        return;
    }
    
    var user = User.build({ username: email, password: pass });
    var ok = true;
    user.save().catch(function (error) {
        ok = false;
        res.status(400).send();
    })
    
    if (ok) {
            res.json({
            success: true,
            message: 'Signup successful!'
        }); 
    }
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
// Express module.
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    uuid = require('uuid'),
    Docker = require('dockerode'),
    Sequelize = require('sequelize'),
    redis = require("redis"),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    bodyParser  = require('body-parser'),
    config = require('./config'),
    randomstring = require("randomstring"),
    sleep = require('sleep');


var WebSocketServer = require('websocket').server;
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
var sequelize = new Sequelize(config.database, config.username, config.password, {
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


// // Authentication module.
// var auth = require('http-auth');
// var basic = auth.basic({
// 	realm: "Simon Area.",
// 	file: "pass.txt"
// });

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}


// Application setup.
var app = express();
var expressWs = require('express-ws')(app);

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(express.bodyParser());
// app.use(express.logger('dev'))
app.use(morgan('dev'));
app.set('superSecret', config.secret)
app.use(stylus.middleware(
    {
        src: __dirname + '/public',
        compile: compile
    }
))
app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
    res.render('index')
})

app.post('/api/login', function (req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    // res.setHeader('Content-Type', 'application/json');

    User.findOne({ where: { username: email, password: pass } }).then(function (user) {
        if (user != null) {
            var token = jwt.sign({user: email}, app.get('superSecret'), { expiresIn: 360 });
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


app.get("/partials/*", function(req, res) {
	// TODO: Directory traversal attack
	var template = req.params[0].replace(".html", "");
	res.render("partials/" + template);
});


app.ws('/echo', function(ws, req) {
    ws.on('message', function (msg) {
        for (var index = 0; index < 20 ; index++) {
            var mymsg = { time: new Date().toISOString(), message: randomstring.generate() };
            ws.send(JSON.stringify(mymsg));
        }
    });
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    // decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                return res.status(400).json({ success: false, message: 'Failed to authenticate token.' });
				// return res.status(400).json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
                req.decoded = decoded;
                console.log("decoded: " + decoded.exp);
				next();
			}
		});
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

apiRoutes.get('/containers', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    docker.listContainers(function (err, containers) {
        res.json(containers);
    });
});

app.use('/api', apiRoutes);

app.listen(8080);
console.log('Server running at http://localhost:' + 8080);

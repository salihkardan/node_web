// Express module.
var express = require('express')  
    , stylus = require('stylus')
    , nib = require('nib')
    , mysql = require('mysql');
    
    
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

app.post('/api/login', function (req, res) {
    console.log(req.body.email);
    console.log(req.body.password);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ a: 1 }));
    connection.query('SELECT * from users', function (err, rows, fields) {
        if (err)
            throw err;
        console.log('The solution is: ', rows[0]);
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
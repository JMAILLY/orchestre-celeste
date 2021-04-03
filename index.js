
var app = require('express')();
var http = require('http').Server(app)

var io = require ('socket.io')(http)

// Pages
app.get('/', function(req,res) {
    res.sendFile(__dirname + '/index.html')
})
app.get('/universe', function(req,res) {
    res.sendFile(__dirname + '/universe.html')
})
app.get('/control', function(req,res) {
    res.sendFile(__dirname + '/control.html')
})

// Controls Resources
app.get('/css/style.css', function(req,res) {
    res.sendFile(__dirname + '/css/style.css')
})
app.get('/js/script.js', function(req,res) {
    res.sendFile(__dirname + '/js/script.js')
})
app.get('/sketch.js', function(req,res) {
    res.sendFile(__dirname + '/sketch.js')
})
app.get('/img/hand.svg', function(req,res) {
    res.sendFile(__dirname + '/img/hand.svg')
})

// Universe Resources
app.get('/universe/sketch.js', function(req,res) {
    res.sendFile(__dirname + '/universe/sketch.js')
})
app.get('/universe/music.js', function(req,res) {
    res.sendFile(__dirname + '/universe/music.js')
})
app.get('/img/sun2.png', function(req,res) {
    res.sendFile(__dirname + '/img/sun2.png')
})
app.get('/img/logo-w.png', function(req,res) {
    res.sendFile(__dirname + '/img/logo-w.png')
})

app.get('/api', (req, res) => {
    res.end(`Hello!`)
})
app.get('/api/universe', (req, res) => {
    res.end(`Hello 2!`)
})

io.on('connection', function(socket) {
    // console.log('User connected')
    
    socket.on('bpm', function(data) {
        io.emit('bpm', data)
    })
    socket.on('pitch', function(data) {
        io.emit('pitch', data)
    })
    socket.on('scale', function(data) {
        io.emit('scale', data)
    })
    socket.on('action2', function(data) {
        io.emit('action3', data)
    })
    socket.on('touch', function(data) {
        console.log(data);
    })
})

/* Control téléphone */

http.listen(3000, function() {
    console.log('listening on *:3000')
})
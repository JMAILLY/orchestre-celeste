var screenConst // Const defined to resize sketch depending on screen size
var objects = []
var bpm = 120
var time = 0
var drawOn = false

var socket = io();
var ball;
var isAlive = false;
var particles = [];
var listBall= [];
var ballList = [];

socket.on('action3', function(data) {    
    var ballYechelle = windowHeight/data.wheight;
    var ballXechelle = windowWidth/data.wwidth;
    var ballXpos = (data.xpos - ((windowWidth/2) / ballXechelle)) * ballXechelle;
    var ballYpos = (data.ypos - ((windowHeight/2) / ballYechelle)) * ballYechelle;

    if (data.yspeed >= 15){
        data.xspeed = 15;
    }else if(data.yspeed <= -15){
        data.yspeed = -15;
    }else if(data.xspeed >= 15){
        data.xspeed = 15;
    }else if(data.xspeed <= -15){
        data.xspeed = -15;
    }
    var b = ball = new Ball(data.yspeed, data.xspeed, ballXpos, ballYpos, data.direction);
    ballList.push(b)
});

socket.on('bpm', function(data) {
    bpm = data
});

/*
 * Objects
 */

function Star(posX, posY, width, color, index) {
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.image = loadImage('img/sun2.png')
    
    this.drawImg = function() {
        noStroke()
        noFill()
        var variableWidth = this.width - (sin(millis()/(bpm/10))*(screenConst));
        variableWidth = variableWidth * 1.7;
        image(this.image, this.posX-(variableWidth/2), this.posY-(variableWidth/2), variableWidth, variableWidth)
    }
    this.draw = function() {
        noStroke()
        fill(255)
        var variableWidth = ( this.width - (sin(millis()/(bpm/10))*(screenConst)) ) / 5
        circle(this.posX, this.posY, variableWidth)
    }
}

function Planet(axisX, axisY, width, timeDivision, orbitHeight, orbitWidth, orbitStrokeColor, index) {
    this.planetX = axisX;
    this.planetY = axisY;
    this.axisX = axisX;
    this.axisY = axisY;
    
    this.width = width;
    this.interactionCircle = width;
    this.interactionOpacity = 0;
    this.interactionOn = false;
    
    this.timeDivision = timeDivision;
    this.index = index;
    
    this.orbitHeight = orbitHeight;
    this.orbitWidth = orbitWidth;
    this.orbitStrokeColor = orbitStrokeColor;
    
    this.notePlayedFront = false;
    this.notePlayedback = false;
    this.position = 0
    
    this.drawPlanet = function(time, inFront) {
        noStroke()
        
        /*
         * Compute planets
         */
        
        this.position += time / this.timeDivision
        
        // If planet has completed rotation, reset position counter
        if (this.position > 360 ) {
            // console.log('rotation done ' + this.index)
            this.position = this.position - 360
        }
        
        this.planetX = this.axisX * cos( this.position + 67.5*this.index )
        this.planetY = this.axisY * sin( this.position + 67.5*this.index )
        
        /*
         * Trigger music
         */
        
        var isFront = this.planetX < 0 && this.planetY > 0 && !this.notePlayedFront;
        var isBack = this.planetX > 0 && this.planetY < 0 && !this.notePlayedBack;
        
        if (ballList.length > 0){
            for (let b = 0; b < ballList.length; b++) {
                var pdist = dist(this.planetX, this.planetY, ballList[b].xpos, ballList[b].ypos);
                if (pdist <= this.width * 2){
                    $(document).trigger('sound', [this.index, bpm, true]);
                    this.interactionOn = true;
                    this.interactionOpacity = 120;
                    if ((this.planetX - ballList[b].xpos) < 0){
                        ballList[b].xpos = ballList[b].xpos - 1;
                        ballList[b].v_speed_x = ballList[b].v_speed_x - 1;
                    }else if ((this.planetX - ballList[b].xpos) > 0){
                        ballList[b].xpos = ballList[b].xpos + 1;
                        ballList[b].v_speed_x = ballList[b].v_speed_x + 1;
                    }else if ((this.planetY - ballList[b].ypos) < 0){
                        ballList[b].ypos = ballList[b].ypos + 1;
                        ballList[b].v_speed = ballList[b].v_speed + 1;
                    }else if ((this.planetY - ballList[b].ypos) > 0){
                        ballList[b].ypos = ballList[b].ypos + 1;
                        ballList[b].v_speed = ballList[b].v_speed + 1;
                    }
                }
            }
        }
        
        if ( isFront || isBack) {
            $(document).trigger('sound', [this.index, bpm, false])
            this.interactionOn = true;
            this.interactionOpacity = 120;
            
            if (isFront) {
                this.notePlayedFront = true;
            }
            else if (isBack) {
                this.notePlayedBack = true;
            }
            
        }
        else if ( this.planetX < 0 && this.planetY < 0 && this.notePlayedFront ) {
            this.notePlayedFront = false;
            // console.log('this.noteNotPlayed ' + this.index)
        }
        else if ( this.planetX > 0 && this.planetY > 0 && this.notePlayedBack ) {
            this.notePlayedBack = false;
            // console.log('this.noteNotPlayed ' + this.index)
        }
        
        /*
         * Interaction circle
         */
        
        if (this.interactionOn) {
            
            this.interactionCircle = this.width*2
            this.interactionOpacity -= 5
            
            if (this.interactionOpacity === 0) {
                this.interactionCircle = this.width
                this.interactionOn = false
            }
        }
        
        
        /*
         * Draw planets
         */
        
        if (this.planetY >= 0 || !inFront ) {
            
            // Define lighting effect
            var overlayColor
            var overlayOpacity
            var sunWidth = objects[0].width/5 + 30*screenConst
            
            // Darken if on front
            if (this.planetY > 0) {
                overlayColor = '0,0,0'
                opacityConst = .4
            }
            // Lighten if on back
            else if (this.planetY < 0) {
                overlayColor = '255,240,220';
                opacityConst = 2;
            }
            
            // Verify if planet is near the sun
            if (this.planetX > -sunWidth/2 || this.planetX < sunWidth/2) {
                
                // Adjust for small orbits
                if (this.orbitWidth < sunWidth*3) {
                    // console.log(this.index)
                    sunWidth = this.orbitWidth/4;
                }
                
                overlayOpacity = ( sunWidth - abs(this.planetX/2) - abs(this.planetY/2) )/sunWidth;
                overlayOpacity = overlayOpacity * 1.4;
                overlayOpacity = ( Math.round(overlayOpacity *100)/100 ) * opacityConst;
                
                if (overlayOpacity > 1) {
                    overlayOpacity = 1;
                }
                else if (overlayOpacity < 0) {
                    overlayOpacity = 0;
                }
            }
            else {
                overlayOpacity = 0
            }
            
            // Draw planet shapes
            
            // Interaction Circle
            
            var interactionColor
            if (inFront && this.index < 4) {
                interactionColor = 0
            }
            else {
                interactionColor = 255
            }
            
            fill(interactionColor,interactionColor,interactionColor, this.interactionOpacity)
            circle(this.planetX, this.planetY, this.interactionCircle)
            
            fill(240)
            circle(this.planetX, this.planetY, this.width)
            
            fill('rgba(0,0,0,.3)')
            circle(this.planetX, this.planetY, this.width)
            
            fill(240)
            circle(this.planetX + ((this.width * .15) / 3), this.planetY - ((this.width * .15) / 3), this.width - (this.width * .15))
            
            // Lighting effect
            fill('rgba('+overlayColor+','+ overlayOpacity +')')
            circle(this.planetX, this.planetY, this.width)
        }
        
    }
    this.drawOrbit = function() {
        noFill()
        strokeWeight(1)
        stroke(this.orbitStrokeColor)
        ellipse(0,0, this.orbitWidth, this.orbitHeight)
    }
}

/*
 * Methods
 */

function createObjects() {
    
    var sun = new Star(0, 0, 600*screenConst, 'rgb(255,200,0)')
    objects.push(sun)
    
    var planetNumber = 8
    var widthParam = 100*screenConst
    var heightParam = 40*screenConst
    
    /*
     * Create Time Divisions for planets rythm
     */
    
    var timeDivisions = []
    var timeDivision = 2 // min division
    var dottedTimeDivision = timeDivision + timeDivision/2 // dotted note
    
    for (var n = 0; n < planetNumber/2; n++) {
        timeDivisions.push(timeDivision)
        timeDivisions.push(dottedTimeDivision)
        timeDivision += timeDivision
        dottedTimeDivision = timeDivision + timeDivision/2
    }
    
    /*
     * Planets creation
     */
    
    for (var i = 1; i <= planetNumber; i++ ) {
        
        var randomSpace = random(0, 1)
        if (i === 0) {
            randomSpace = 0;
        }
        var startPosition = 1
        if (i % 2 === 0) {
            startPosition = -1
        }
        var sizeStep = 5*screenConst
        var orbitWidth = widthParam + widthParam*i + exp(i/1.6) + (sizeStep*(i-1)) + randomSpace*(widthParam/2)
        var orbitHeight = heightParam*i + exp(i/2) + (sizeStep*(i-1)) + randomSpace*(heightParam/2)
        
        var orbitOpacity = 0.1 + (0.07*i)
        var orbitStrokeColor = 'rgba(255,255,255,'+ orbitOpacity +')'
        
        var axisX = orbitWidth/2 * startPosition
        var axisY = orbitHeight/2 * startPosition
        
        var planetTimeDivision = timeDivisions[i-1]
        
        var width
        if (i < 4) {
            width = random(20*screenConst, 30*screenConst)
        } else if (i >= 4 && i < 7) {
            width = random(30*screenConst, 50*screenConst)
        } else {
            width = random(25*screenConst, 40*screenConst)
        }
        
        var planet = new Planet(axisX, axisY, width, planetTimeDivision, orbitHeight, orbitWidth, orbitStrokeColor, i)
        objects.push(planet)
    }
}

function Ball(ballYspeed, ballXspeed, ballXpos, ballYpos, ballDir) {
    
    
    this.diameter = 10 * screenConst;
    this.v_speed = ballYspeed;
    this.v_speed_x = ballXspeed;
    this.gravity = 1;
    
    if  (ballDir == 'top'){
        this.ypos = windowHeight/2;
        this.xpos = ballXpos;
    }else if (ballDir == 'right'){
        this.ypos = ballYpos;
        this.xpos = -windowWidth/2;
    }else if (ballDir == 'bottom'){
        this.ypos = -windowHeight/2;
        this.xpos = ballXpos;
    }else if (ballDir == 'left'){
        this.ypos = ballYpos;
        this.xpos = windowWidth/2;
    }
    
    
    this.onBall = function(x, y) {
        let dx = x - this.xpos;
        let dy = y - this.ypos;
        let dist = Math.sqrt(dx*dx, dy*dy)
        return dist <= this.diameter/2;
    }
    
    this.update = function() {
        
        
        this.minY = this.diameter/2;
        this.maxY = height-this.diameter/2;
        this.minX = this.diameter/2;
        this.maxX = width-this.diameter/2;
        
        this.ypos = this.ypos + this.v_speed;
        this.xpos = this.xpos + this.v_speed_x;
        
    }
    
    this.show = function(){
        fill(255);
        ellipse(this.xpos, this.ypos, this.diameter);
    }
}

class Particle {
    
    constructor(xpos, ypos) {
        this.x = xpos;
        this.y = ypos;
        this.vx = random(-1, 1);
        this.vy = random(0, 2);
        this.alpha = 255;
        this.hue = 200;
    }
    
    finished() {
        return this.alpha < 0;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= 5;
        this.hue += 5;
    }
    
    colorless(){
        return this.hue > 360;
    }
    
    show() {
        noStroke();
        //stroke(255);
        colorMode(HSL, 360);
        fill(this.hue, 255, 255, this.alpha);
        ellipse(this.x, this.y, 7 * screenConst);
    }
    
}

/*
 * Actions
 */

function setup() {
    
    screenConst = windowWidth/1800
    
    createCanvas(windowWidth, windowHeight)
    // background(0)
    noStroke()
    angleMode(DEGREES)
    
    createObjects()
    frameRate(30);
}

function draw() {
    if (drawOn) {
        clear()
        push()
        translate(windowWidth/2, windowHeight/2) // Move origin to center
        // rotate(5)
        
        for (var i = objects.length - 1; i >= 1; i--) {
            
            objects[i].drawOrbit()
        }
        
        // Bar
        noStroke()
        fill(0)
        var barWidth =  10*screenConst
        var barHeight =  600*screenConst
        rect(-barWidth/2,-barHeight/2, barWidth, barHeight)
        
        // Sun bg
        objects[0].drawImg()
        
        for (var i = objects.length - 1; i >= 1; i--) {
            
            objects[i].drawPlanet(time, false)
        }
        
        // Sun
        objects[0].draw()
        
        for (var i = 1; i < objects.length; i++) {
            objects[i].drawPlanet(time, true)
        }
        
        if (ballList.length > 0) {
            for (let b = 0; b < ballList.length; b++) {
                ballList[b].update();
                ballList[b].show();
                for (let i = 0; i < 5; i++) {
                    let p = new Particle(ballList[b].xpos, ballList[b].ypos);
                    particles.push(p);
                }
                for (let i = particles.length - 1; i >= 0; i--) {
                    particles[i].update();
                    particles[i].show();
                    if (particles[i].finished()) {
                        // remove this particle
                        particles.splice(i, 1);
                    }
                    if (particles[i].colorless()) {
                        // remove this particle
                        this.hue = 0;
                    }
                }
                
                if (ballList[b].direction =="top" && ballList[b].ypos > windowHeight * 2 || ballList[b].xpos > windowWidth * 2 || ballList[b].xpos < -windowWidth * 2){
                    ballList.splice(b, 1);
                }else if(ballList[b].direction =="right" && ballList[b].xpos > windowWidth * 2 || ballList[b].ypos < -windowHeight * 2 || ballList[b].ypos > windowHeight * 2){
                    ballList.splice(b, 1);
                }else if (ballList[b].direction =="bottom" && ballList[b].ypos < -windowHeight * 2 || ballList[b].xpos > windowWidth * 2 || ballList[b].xpos < -windowWidth * 2){
                    ballList.splice(b, 1);
                }else if(ballList[b].direction =="left" && ballList[b].xpos < -windowWidth * 2 || ballList[b].ypos < -windowHeight * 2 || ballList[b].ypos > windowHeight * 2){
                    ballList.splice(b, 1);
                }
                if (ballList[b]){
                    if (ballList[b].v_speed <= 1 && ballList[b].v_speed >= -1 && ballList[b].v_speed_x <= 1 && ballList[b].v_speed_x >= -1 ){
                        ballList.splice(b, 1);
                    }
                }
            }
        }
        
        // Time
        time = bpm / 60
        
        pop()
    }
    
}

function keyPressed() {
    if (keyCode === DOWN_ARROW ) {
        bpm-=50
        if (bpm <= 40) {
            bpm = 20
        }
        console.log(bpm)
    }
    else if (keyCode === UP_ARROW ) {
        bpm+=50
        console.log(bpm)
    }
}

$(document).ready(function() {
    
    $('button.start').on('click', function() {
        $('body').removeClass('not-started')
        drawOn = true;
    })
})


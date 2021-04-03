var socket = io()

function Ball() {
    
    this.diameter = 20;
    this.v_speed = 0;
    this.gravity = 1;
    this.ypos = height/2 - 100;
    this.xpos = width/2;
    this.drag = false;
    this.v_speed_x = 0;
    this.direction = 0;
    this.astre = new Object()
    
    this.onBall = function(x, y) {
        let dx = x - this.xpos;
        let dy = y - this.ypos;
        let dist = Math.sqrt(dx*dx, dy*dy)
        return dist <= this.diameter/2;
    }
    
    this.startDrag = function() {
        this.drag = true;
        this.mousex = mouseX;
        this.mousey = mouseY;
    }
    
    this.endDrag = function() {
        this.drag = false;
    }
    
    this.update = function() {
        
        this.minY = this.diameter/2;
        this.maxY = height-this.diameter/2;
        this.minX = this.diameter/2;
        this.maxX = width-this.diameter/2;
        
        if (this.drag) {
            
            this.xpos = Math.max(this.minX, Math.min(this.maxX, mouseX));
            this.ypos = mouseY;
            this.v_speed_x = this.v_speed_x/2 + (mouseX - this.mousex);
            this.v_speed   = this.v_speed/2 + (mouseY - this.mousey);
            this.mousex = mouseX;
            this.mousey = mouseY;
            
        } else {
            
            this.ypos = this.ypos + this.v_speed;
            
            if(this.ypos <= 0 || this.ypos >= windowHeight || this.v_speed <= 1 && this.v_speed >= -1 && this.v_speed_x <= 1 && this.v_speed_x >= -1 || this.xpos <= 0 || this.xpos >= windowWidth){
                isAlive = false
            }
            if(this.ypos <= 0){
                this.direction = 'top'
                this.astre.direction = this.direction;
                this.astre.yspeed = this.v_speed;
                this.astre.xspeed = this.v_speed_x;
                this.astre.xpos = this.xpos;
                this.astre.ypos = this.ypos;
                this.astre.wheight = windowHeight;
                this.astre.wwidth = windowWidth;
                console.log(this.astre)
                socket.emit('action2', this.astre)
            }else if(this.ypos >= windowHeight){
                this.direction = 'bottom'
                this.astre.direction = this.direction;
                this.astre.yspeed = this.v_speed;
                this.astre.xspeed = this.v_speed_x;
                this.astre.xpos = this.xpos;
                this.astre.ypos = this.ypos;
                this.astre.wheight = windowHeight;
                this.astre.wwidth = windowWidth;
                console.log(this.astre)
                socket.emit('action2', this.astre)
                
                
            }else if(this.xpos <= 0){
                this.direction = 'left'
                this.astre.direction = this.direction;
                this.astre.yspeed = this.v_speed;
                this.astre.xspeed = this.v_speed_x;
                this.astre.xpos = this.xpos;
                this.astre.ypos = this.ypos;
                this.astre.wheight = windowHeight;
                this.astre.wwidth = windowWidth;
                console.log(this.astre)
                socket.emit('action2', this.astre)
                
                
            }else if(this.xpos >= windowWidth){
                this.direction = 'right'
                this.astre.direction = this.direction;
                this.astre.yspeed = this.v_speed;
                this.astre.xspeed = this.v_speed_x;
                this.astre.xpos = this.xpos;
                this.astre.ypos = this.ypos;
                this.astre.wheight = windowHeight;
                this.astre.wwidth = windowWidth;
                console.log(this.astre)
                socket.emit('action2', this.astre)
                
                
            }
            
            // calculate side movement
            
            this.xpos = this.xpos + this.v_speed_x;
            
        }
    }
    
    this.show = function(){
        ellipse(this.xpos, this.ypos, this.diameter);
        fill(255);
    }
}

var ball;
var isAlive = false;

function touchStarted() {
    
    if ($('.nav-link:first-child').hasClass('active')) {
        
        if (isAlive == false && mouseY >= 0) {
            ball = new Ball();
            ball.startDrag();
            isAlive = true
        } else if (isAlive == true && mouseY >= 0 && !ball.v_speed && !ball.v_speed_x) {
            isAlive = false
        }
    }
}

function touchEnded() {
    ball.endDrag();
    return false
}

function setup() {
    var canvas = createCanvas(windowWidth, windowHeight);
    img = loadImage('img/hand.svg');
    canvas.parent('canvas-thrower');
}
var old_touch = 0;
function draw() {
    clear()
    if (isAlive){
        ball.update();
        ball.show();
    }else{
        image(img, windowWidth/2.3, windowHeight/2.2 - 70, img.width / 4, img.height / 4);
    }
    if (old_touch == 1 && touches.length == 0){
        touchEnded();
    }
    old_touch = touches.length;
}
"use strict";

console.info("Up and running!");

const ENGINE_CONSTANTS = {
    RADIANT_0_DEGREES: 0,
    RADIANT_90_DEGREES: Math.PI/2,
    RADIANT_180_DEGREES: Math.PI,
    RADIANT_360_DEGREES: 2 * Math.PI,
    BACKGROUND_COLOR: "white",
    RENDER_INTERVAL: 30
};

const AMBIENT_CONSTANTS = {
    HORIZONTAL_DRAG_QUOTIENT: 0.95, 
    VERTICAL_DRAG_QUOTIENT: -0.65,
    GRAVITY: 0.02
};

const PARTICLE_CONSTANTS = {
    COLOR: "black",
    CLEAR_SIZE: 12,
    SIZE: 10,
    MAX_PARTICLES: 20
};

var Engine = {
    Events:{
        touchZones:[],
        createEventZones: function(){
            const RADIUS = 100;
            this.touchZones=[
                {
                    name: "left top",
                    x: Engine.border,
                    y: Engine.border,
                    radius: RADIUS,
                    action: function(touch){
                        if(!this.wasClicked){
                            document.documentElement.webkitRequestFullScreen();
                            this.wasClicked = true;
                        }
                    }
                },
                {
                    name: "left buttom",
                    x: Engine.border,
                    y: Engine.height + Engine.border,
                    radius: RADIUS,
                    action: function(touch){
                        const ARROW_LENGTH = 200;

                        var angle = calculateAngleForVector(
                            touch.clientX - this.x,
                            touch.clientY - this.y
                        );

                        var endPointX = Math.cos(angle) * ARROW_LENGTH;
                        var endPointY = Engine.height + Engine.border - Math.sin(angle) * ARROW_LENGTH;

                        var vectorX = endPointX - Engine.Particle.emitPoint.x;
                        var vectorY = endPointY - Engine.Particle.emitPoint.y;

                        var minMultiplicator = Math.min(
                            Math.abs(vectorX),
                            Math.abs(vectorY)
                        );

                        Engine.Particle.currentVector.x = vectorX / minMultiplicator;
                        Engine.Particle.currentVector.y = vectorY / minMultiplicator;

                        Engine.drawLine(
                                Engine.border, 
                                Engine.height + Engine.border, 
                                endPointX, 
                                endPointY
                        );
                        Engine.drawArrow(
                                Engine.border, 
                                Engine.height + Engine.border, 
                                endPointX, 
                                endPointY, 
                                true
                        );  
                    } 
                },
                {
                    name: "right buttom",
                    x: Engine.width + Engine.border,
                    y: Engine.height + Engine.border,
                    radius: RADIUS,
                    action: function(touch){
                        Engine.Particle.emitParticle({
                            x: Engine.Particle.emitPoint.x + PARTICLE_CONSTANTS.SIZE * 2,
                            y: Engine.Particle.emitPoint.y - PARTICLE_CONSTANTS.SIZE * 2,
                            vectorX: Engine.Particle.currentVector.x,
                            vectorY: Engine.Particle.currentVector.y,
                            speed: 5,
                            isRunning: true
                        }); 
                    } 
                }
            ];
        },
        isTouchInEventZone: function(touch){
            const RADIUS = 100;
            return this.touchZones.find(
                z => {
                    return calculateVectorLength(
                        touch.clientX - z.x, 
                        touch.clientY - z.y
                        ) < RADIUS;
            });
        },
        handleTouchEvents: function(event){
            for(var idx = 0; idx < event.touches.length; idx++){
                var touch = event.touches[idx];
                var selectedZone = this.isTouchInEventZone(touch);

                if(selectedZone){
                    selectedZone.action(touch);
                }
            }
        }
    },
    Particle:{
        emitPoint: {x:0 , y:0},
        currentVector: {x:0, y:0}, 
        particles: [],
        clearStoppedParticles: function(){
            this.particles = this.particles.filter(
                p => p.isRunning 
            );
        },
        emitParticle: function(particle){
            if(this.particles.length > PARTICLE_CONSTANTS.MAX_PARTICLES){
                return;
            }
            this.particles.push(particle);
        },
        isOutOfView: function(particle, left, top, width, height){
            return  (particle.x - PARTICLE_CONSTANTS.SIZE > width);
        },
        stopParticle: function(particle){
            particle.isRunning = false;
        },
        tryToEmitParticle: function(particle){
            var particleWasEmitted = false;
            if(this.particles.length<PARTICLE_CONSTANTS.MAX_PARTICLES){
                this.particles.push(particle);
                particleWasEmitted = true;
            }
            return particleWasEmitted;
        }
    },
    _drawFilledCircle: function(x, y, size, style){
        this.context.fillStyle = style;
        this.context.beginPath();
        this.context.arc(
            x, 
            y, 
            size, 
            ENGINE_CONSTANTS.RADIANT_0_DEGREES, 
            ENGINE_CONSTANTS.RADIANT_360_DEGREES
        );
        this.context.closePath();
        this.context.fill();
    },
    init: function(options){
        this.context = options.context;

        this.border = options.border;
        this.calculatedBorder = options.border * 2;
        
        this.width = options.width - this.calculatedBorder;
        this.height = options.height - this.calculatedBorder;

        this.Events.createEventZones();

        this.Particle.emitPoint.x = 0;
        this.Particle.emitPoint.y = this.height + this.border;
    },
    drawHud: function(){
        const RADIUS = 100;

        this.context.beginPath();
        this.context.arc(
            this.border, 
            this.height + this.border, 
            RADIUS, 
            ENGINE_CONSTANTS.RADIANT_0_DEGREES, 
            -ENGINE_CONSTANTS.RADIANT_90_DEGREES, 
            true
        );
        this.context.stroke();

        this.context.beginPath();
        this.context.arc(
            this.width + this.border,
            this.height + this.border,
            RADIUS, 
            -ENGINE_CONSTANTS.RADIANT_90_DEGREES, 
            -ENGINE_CONSTANTS.RADIANT_180_DEGREES, 
            true
        );
        this.context.stroke();

        this.context.beginPath();
        this.context.rect(this.border, this.border, this.width, this.height);
        this.context.stroke();
        this.context.beginPath();
        this.context.rect(0, 0, this.width + this.calculatedBorder, this.height + this.calculatedBorder);
        this.context.stroke();
    },
    drawParticle: function(x, y){
        this._drawFilledCircle(x, y, PARTICLE_CONSTANTS.SIZE, PARTICLE_CONSTANTS.COLOR);
    },
    clearParticle: function(x, y){
        this._drawFilledCircle(x, y, PARTICLE_CONSTANTS.CLEAR_SIZE, ENGINE_CONSTANTS.BACKGROUND_COLOR);
    },
    drawArrow: function (fromx, fromy, tox, toy, fullarrow) {
        const ARROW_SIZE  = 10;

        var vx = tox - fromx;
        var vy = toy - fromy;
        
        var theta = Math.acos(vx / calculateVectorLength(vx, vy)); 
        
        var gamma = 30 * Math.PI / 180;
        var deltaAngle = (Math.PI - gamma);
        
        var x1 = -ARROW_SIZE * Math.cos(gamma + theta);
        var y1 = ARROW_SIZE * Math.sin(gamma + theta);
        
        var x2 = ARROW_SIZE * Math.cos(deltaAngle + theta);
        var y2 = ARROW_SIZE * Math.sin(deltaAngle + theta);
        
        if(fromy <= toy) {
            var helpVar = x1;
        
            x1 = x2; 
            x2 = helpVar;
        
            helpVar = -y1;
            y1 = y2;
            y2 = helpVar;
        } 
        else if(fromy > toy) {
            x2 = x2;
            y2 = -y2;
        } 
        
        this.context.beginPath();
        this.context.moveTo(tox + x2, toy + y2);
        this.context.lineTo(tox, toy);
        this.context.lineTo(tox + x1 , toy + y1);
        
        if(fullarrow){
            this.context.fillStyle = "white";
            this.context.closePath();
            this.context.fill();
        }
        this.context.stroke();
    },
    drawLine: function(fromx, fromy, tox, toy){
        this.context.beginPath();
        this.context.moveTo( fromx, fromy );
        this.context.lineTo( tox, toy );
        this.context.stroke();
    },
    render: function(){
        this.drawHud();
        Helper.render();
        this.Particle.clearStoppedParticles();
        for(var idx = 0; idx < this.Particle.particles.length; idx++){
            var currentParticle = this.Particle.particles[idx];
            if(this.Particle.isOutOfView(currentParticle, 0, 0, this.width, this.height)){
                this.Particle.stopParticle(currentParticle);
            }
            this.clearParticle(currentParticle.x, currentParticle.y);

            currentParticle.x += currentParticle.vectorX * currentParticle.speed;
            currentParticle.y += currentParticle.vectorY * currentParticle.speed;
            currentParticle.vectorY += AMBIENT_CONSTANTS.GRAVITY;
    
            if( currentParticle.y + currentParticle.vectorY > this.height - 5 ){
                currentParticle.vectorX *= AMBIENT_CONSTANTS.HORIZONTAL_DRAG_QUOTIENT;
                currentParticle.vectorY *= AMBIENT_CONSTANTS.VERTICAL_DRAG_QUOTIENT;
                currentParticle.y = this.height - PARTICLE_CONSTANTS.SIZE;
            }

            if(currentParticle.vectorX < 0.3 && currentParticle.vectorY < 0.5){
                this.Particle.stopParticle(currentParticle);
            }

            this.drawParticle(currentParticle.x, currentParticle.y);        
            // TESTER
            Helper.wasZoneHit(currentParticle);
        }
    },
    startRenderLoop: function(){
        this.renderLoopId = setInterval(
            () => { Engine.render(); },
            ENGINE_CONSTANTS.RENDER_INTERVAL
        );
    }
};

var Helper = {
    hitZones:[],
    init: function(options){
        this.context = options.context;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.hitZoneCount = options.hitZoneCount;
        this.createRandomHitZones();
    },
    createRandomHitZones: function(){
        var randomNumberGenerator = maxValue => {
            return parseInt(Math.random()*10000 % maxValue);
        };
        for(var idx = 0;idx< this.hitZoneCount;idx++){
            var x = randomNumberGenerator(this.width);
            var y = randomNumberGenerator(this.height);
            this.hitZones.push({x:x, y:y, width:20,height:20});
        }
    },
    render: function(){
        for(var idx=0; idx<this.hitZones.length;idx++){
            var hitZone = this.hitZones[idx];
            this.context.fillStyle = hitZone.wasHit?"green":"red";
            this.context.fillRect(hitZone.x, hitZone.y, hitZone.width, hitZone.height);
        }
    },
    wasZoneHit: function(particle){
        for(var idx=0; idx < this.hitZones.length; idx++){
            var hitZone = this.hitZones[idx];
            var distance = PARTICLE_CONSTANTS.SIZE + Math.sqrt(2*Math.pow((hitZone.width/2),2));
            
            var vx = hitZone.x + hitZone.width/2 - particle.x;
            var vy = hitZone.y + hitZone.width/2 - particle.y;

            if(calculateVectorLength(vx, vy)<= distance){
                hitZone.wasHit = true;
                console.info(" WAS HIT ");
            }else{
                console.info(" NO HIT ");
            }
        }
    }
};

function calculateVectorLength (x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function calculateAngleForVector(vx, vy){
    return Math.abs( Math.atan( vy / vx ) );
}

function convertRadiantToDegrees(radangleinradiant){
    return  angleinradiant * 180 / Math.PI;
}

window.onload = function (){
    console.info("what");
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    canvas.width = screen.width;
    canvas.height = screen.height;

    Engine.init({
        context: context,
        width: canvas.width,
        height: canvas.height,
        border: 5
    });

    Helper.init({
        context: context,
        x:5,
        y:5,
        width: canvas.width - 10,
        height: canvas.height - 10,
        hitZoneCount:10
    });

    Engine.startRenderLoop();

    document.addEventListener("touchstart", (e)=>{
        Engine.Events.handleTouchEvents(e);
    });

     document.addEventListener("touchmove", (e)=>{
        Engine.Events.handleTouchEvents(e);
    });
};




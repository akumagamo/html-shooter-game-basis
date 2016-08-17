"use strict";

console.info("Up and running!");

const ENGINE_CONSTANTS = {
    RADIANT_0_DEGREES: 0,
    RADIANT_90_DEGREES: 1/2 * Math.PI,
    RADIANT_180_DEGREES: 1 * Math.PI,
    RADIANT_270_DEGREES: 3/2 * Math.PI,
    RADIANT_360_DEGREES: 2 * Math.PI,
    BACKGROUND_COLOR: "white",
    RENDER_INTERVAL: 30
};

const AMBIENT_CONSTANTS = {
    HORIZONTAL_DRAG_QUOTIENT: 0.95, 
    VERTICAL_DRAG_QUOTIENT: -0.65,
    GRAVITY: 0.1
};

const PARTICLE_CONSTANTS = {
    COLOR: "black",
    CLEAR_SIZE: 12,
    SIZE: 10,
    MAX_PARTICLES: 20,
    MAX_SPEED: 20
};

var Engine = {
    Events:{
        touchZones:[],
        createEventZones: function(){
            const RADIUS = 200;
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

                        const ARROW_LENGTH = 150;

                        var angle = calculateAngleForVector(
                            touch.clientX - this.x,
                            touch.clientY - this.y
                        );

                        Engine.HUD.arrowEndPointX = Math.cos(angle) * ARROW_LENGTH;
                        Engine.HUD.arrowEndPointY = Engine.height + Engine.border - Math.sin(angle) * ARROW_LENGTH;

                        var vectorX = Engine.HUD.arrowEndPointX - Engine.Particle.emitPoint.x;
                        var vectorY = Engine.HUD.arrowEndPointY - Engine.Particle.emitPoint.y;

                        var minMultiplicator = Math.min(
                            Math.abs(vectorX),
                            Math.abs(vectorY)
                        );

                        Engine.Particle.currentVector.x = vectorX / minMultiplicator;
                        Engine.Particle.currentVector.y = vectorY / minMultiplicator;

                    } 
                },
                {
                    name: "right buttom",
                    x: Engine.width + Engine.border,
                    y: Engine.height + Engine.border,
                    radius: RADIUS,
                    action: function(touch, eventtype){
                        Engine.PowerGauge.isLoading = true;
                        Engine.Events.endTouchAction = this.endAction; 
                    },
                    endAction: function(){
                        Engine.Particle.emitParticle({
                            x: Engine.Particle.emitPoint.x + PARTICLE_CONSTANTS.SIZE * 2,
                            y: Engine.Particle.emitPoint.y - PARTICLE_CONSTANTS.SIZE * 2,
                            vectorX: Engine.Particle.currentVector.x,
                            vectorY: Engine.Particle.currentVector.y,
                            speed: PARTICLE_CONSTANTS.MAX_SPEED * Math.abs(Engine.PowerGauge.value-1.1),
                            isRunning: true
                        });
                        Engine.PowerGauge.isLoading = false; 
                        Engine.PowerGauge.value = 1;
                    } 
                }
            ];
        },
        isTouchInEventZone: function(touch){
            const RADIUS = 200;
            return this.touchZones.find(
                z => {
                    return calculateVectorLength(
                        touch.clientX - z.x, 
                        touch.clientY - z.y
                        ) < RADIUS;
            });
        },
        handleTouchEvents: function(event){
             switch(event.type){
                 case "touchstart":
                 case "touchmove":
                    if(Engine.Events.endTouchAction){
                        delete Engine.Events.endTouchAction;
                    }
                    for(var idx = 0; idx < event.touches.length; idx++){
                        var touch = event.touches[idx];
                        var selectedZone = this.isTouchInEventZone(touch);

                        if(selectedZone){
                            selectedZone.action(touch);
                        }
                    }
                    break;
                case "touchend":
                    if(Engine.Events.endTouchAction){
                        Engine.Events.endTouchAction();
                    } 
                    break;
             }
        }
    },
    HUD: {
        arrowEndPointX: 0,
        arrowEndPointY: 0,
        messageBoard: "",
        score:0
    },
    PowerGauge:{
        value: 0,
        isLoading: false
    },
    Particle:{
        emitPoint: {x:0, y:0},
        currentVector: {x:0, y:0}, 
        particles: [],
        updateParticlesList: function(){
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
    _drawPowerGauge: function(){
        const RADIUS = 150;
        var x = this.width + this.border;
        var y = this.height + this.border;

        this.context.strokeStyle = "white";
        this.context.lineWidth= 21;
        this.context.beginPath();
        this.context.arc(
            x ,
            y,
            RADIUS ,
            Math.PI, 
            -Math.PI/2);
        this.context.stroke();

        if(Engine.PowerGauge.isLoading){
            Engine.PowerGauge.value =
            Engine.PowerGauge.value <= 0 ?
            1 : Engine.PowerGauge.value - 0.05;

            var powerGaugeGradient = this.context.createLinearGradient(x - RADIUS, y + RADIUS , x +  RADIUS, y - RADIUS);
            powerGaugeGradient.addColorStop(0, 'rgb(28,   255, 54)');
            powerGaugeGradient.addColorStop(0.5, 'rgb(0, 255, 0)');
            powerGaugeGradient.addColorStop(0.75, 'rgb(255, 0, 0)');
            powerGaugeGradient.addColorStop(1, 'rgb(255, 0, 0)');

            this.context.strokeStyle = powerGaugeGradient;
            this.context.lineCap = "round";
            this.context.lineWidth= 20
            this.context.beginPath();
            
            this.context.arc(
                x,
                y,
                RADIUS ,
                ENGINE_CONSTANTS.RADIANT_180_DEGREES, 
                ENGINE_CONSTANTS.RADIANT_180_DEGREES + ENGINE_CONSTANTS.RADIANT_90_DEGREES * Math.abs(.99 - this.PowerGauge.value));

            this.context.stroke();
        }
    },
    _drawArrow: function(){
        this.context.strokeStyle = "black";
        this.context.lineWidth = 1;
        Engine.drawLine(
            Engine.border, 
            Engine.height + Engine.border, 
            Engine.HUD.arrowEndPointX, 
            Engine.HUD.arrowEndPointY
        );
        Engine.drawArrow(
            Engine.border, 
            Engine.height + Engine.border, 
            Engine.HUD.arrowEndPointX, 
            Engine.HUD.arrowEndPointY, 
            true
        );  
    },
    _drawMessageBoard: function(){
        this.context.font = "24px";
        this.context.fillStyle = "black";
        this.context.fillText(this.HUD.messageBoard, this.calculatedBorder+2, this.calculatedBorder + 10);
        this.context.fillText(`Score: ${Engine.HUD.score}`, this.calculatedBorder, this.calculatedBorder + 20);
        
    },
    drawHud: function(){
        const RADIUS = 100;

        this.context.beginPath();
        this.context.arc(
            this.border, 
            this.height + this.border, 
            RADIUS, 
            ENGINE_CONSTANTS.RADIANT_270_DEGREES, 
            ENGINE_CONSTANTS.RADIANT_0_DEGREES
        );
        this.context.stroke();

        this._drawPowerGauge();

        this._drawArrow();

        this.context.strokeStyle = "black";

        this.context.lineCap = "default";
        this.context.lineWidth= 1;

        this.context.beginPath();
        this.context.rect(this.border, this.border, this.width, this.height);
        this.context.stroke();
        this.context.beginPath();
        this.context.rect(0, 0, this.width + this.calculatedBorder, this.height + this.calculatedBorder);
        this.context.stroke();

        this._drawMessageBoard();
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
    _clearCanvas: function(){
        this.context.clearRect(0, 0, this.width + this.calculatedBorder, this.height + this.calculatedBorder);
    },
    render: function(){
        this._clearCanvas();
        this.drawHud();
        Helper.render();
        this.Particle.updateParticlesList();
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
            this.HUD.messageBoard = "x: " + currentParticle.x +" y: "+ currentParticle.y;        
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
            if(!hitZone.wasHit){
                var distance = PARTICLE_CONSTANTS.SIZE + Math.sqrt(2*Math.pow((hitZone.width/2),2));
                
                var vx = hitZone.x + hitZone.width/2 - particle.x;
                var vy = hitZone.y + hitZone.width/2 - particle.y;

                if(calculateVectorLength(vx, vy)<= distance){
                    hitZone.wasHit = true;
                    Engine.HUD.score++;
                }    
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

    canvas.addEventListener("touchstart", function (e){
        console.info("TOUCH START");
        Engine.Events.handleTouchEvents(e);
    });

    canvas.addEventListener("touchend", function (e){
        console.info("TOUCH END");
        Engine.Events.handleTouchEvents(e);
    });

    canvas.addEventListener("touchmove", function (e){
         console.info("TOUCH MOVE");
        Engine.Events.handleTouchEvents(e);
    });
};




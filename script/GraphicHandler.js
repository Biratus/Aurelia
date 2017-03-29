function GraphicHandler(type) {
    this.type=type;

    this.layers=[];
    this.modules=[];
    this.bubble_timeout;
    this.spawn_param={interval:2000,range:300};
    let radius=game.world.width/20;
    let y_pos=-radius;
    this.reSize_coef=0.31*game.world.height/242;
    this.groups={
        bg:game.add.group(),
        rocks:game.add.group(),
        raycast:new RayCast(game.world.width/2,y_pos,radius,{"distance":game.world.height*0.8,
            "color":"rgba(255,255,150,0.3)",
            "diffuse":0.5,
            "radius":5,
            "samples":7
        },14,0.5,5),
        sand:game.add.group(),
        bubbles:game.add.group(),
        plant:game.add.group()
    };
    this.bubbles=this.groups.bubbles.children;//reference to all bubbles
    /*

     */
    this.proba_sand=new RandomGenerator({
        left:0,
        middle:60,
        right:40,
        noth:0
    });
    this.proba_plant=new RandomGenerator({
        left:0,
        middle:60,
        right:40,
        noth:0
    });
    this.layers=[
        {
            speed_coef:0,
            nb:1,
            src:"background",
            display:[]
        },
        {
            speed_coef:0.25,
            nb:2,
            src:"rocks",
            display:[],
            parent:this,
            generate:function(){
                let s=50;
                if(this.display.length>0) s=(this.display[this.display.length-1].id==1)?70:30;
                let number=((Math.random()*100)>s)?1:2;
                let ox=Math.floor(Math.random()*(game.world.width/9));
                let start_x=(this.display.length>0)?this.display[this.display.length-1].x+this.display[this.display.length-1].width:0;
                let img=game.add.image(start_x+ox,game.world.height*0.95,"rocks_"+number);
                img.anchor.setTo(0,1);
                //his.parent.reSize_coef=(game.world.height/2)/img.height;
                img.width*=this.parent.reSize_coef;
                img.height*=this.parent.reSize_coef;
                img.id=number;
                this.display.push(img);
            }
        },
        {
            speed_coef:0.66,
            nb:3,
            src:"sand",
            display:[],
            proba:this.proba_sand
        },
        {
            speed_coef:0.75,
            nb:3,
            src:"plant",
            display:[],
            proba:this.proba_plant
        }
    ];
    //this.reSize_coef=1;
    for (var i in this.layers) {
        switch(this.layers[i].nb) {
            case 1:
                var img=game.add.image(0,game.world.height,this.layers[i].src);
                //this.reSize_coef=game.world.width/img.width;
                //this.reSize_coef=1;
                img.anchor.setTo(0,1);
                img.height=game.world.height;
                img.width=game.world.width;
                this.layers[i].display.push(img);
                this.groups.bg.add(this.layers[i].display[0]);
                break;
            case 2:
                do {
                    this.layers[i].generate();
                    this.groups.rocks.add(this.layers[i].display[this.layers[i].display.length-1]);
                }while(this.layers[i].display[this.layers[i].display.length-1].x+this.layers[i].display[this.layers[i].display.length-1].width<game.world.width+10);
                break;
            case 3:
                var img=game.add.image(0,game.world.height,this.layers[i].src+"_left");
                img.anchor.setTo(0,1);
                img.width*=this.reSize_coef;
                img.height*=this.reSize_coef;
                this.layers[i].display.push(img);
                this.groups[this.layers[i].src].add(this.layers[i].display[0]);
                do {
                    var last_r=this.layers[i].display[this.layers[i].display.length-1].x+this.layers[i].display[this.layers[i].display.length-1].width;
                    this.layers[i].display.push(this.generateWithThree(this.layers[i].src,last_r));
                    this.groups[this.layers[i].src].add(this.layers[i].display[this.layers[i].display.length-1]);
                }while(last_r<game.world.width+10);
        }
    }
    let e=game.add.emitter(game.world.width*0.35,game.world.height,40);
    e.width=game.world.width/15;
    e.makeParticles('bubble');
    e.ignoreChildInput=true;
    e.gravity=-1;
    e.minParticleSpeed.set(-5, -170);
    e.maxParticleSpeed.set(5, -220);
    e.minRotation=0;
    e.maxRotation=0;
    e.minParticleScale=game.world.height*0.01/64;//100=bubble width
    e.maxParticleScale=game.world.height*0.07/64;
    this.groups.bubbles.add(e);
    this.bubbles[this.bubbles.length-1].start(false,0,700);

    e=game.add.emitter(game.world.width*0.77,game.world.height,40);
    e.width=game.world.width/15;
    e.makeParticles('bubble');
    e.ignoreChildInput=true;
    e.gravity=-1;
    e.minParticleSpeed.set(-5, -170);
    e.maxParticleSpeed.set(5, -220);
    e.minRotation=0;
    e.maxRotation=0;
    e.minParticleScale=game.world.height*0.01/64;//100=bubble width
    e.maxParticleScale=game.world.height*0.07/64;

    this.groups.bubbles.add(e);
    this.bubbles[this.bubbles.length-1].start(false,0,700);
}

GraphicHandler.prototype.update=function(levelstate) {
    //move layers
    for(var i=1;i<this.layers.length;i++){
        var first=this.layers[i].display[0].getBounds();
        var last=this.layers[i].display[this.layers[i].display.length-1].getBounds();
        if(last.right<game.world.width+10) {
            if(this.layers[i].nb==2) this.layers[i].generate();
            else if(this.layers[i].nb==3) this.layers[i].display.push(this.generateWithThree(this.layers[i].src,last.right));
            this.groups[this.layers[i].src].add(this.layers[i].display[this.layers[i].display.length-1]);
        }
        if(first.right<0) this.layers[i].display.shift();

        for(var j in this.layers[i].display) {
            this.layers[i].display[j].x-=levelstate.current_speed*this.layers[i].speed_coef;//move images
        }
    }
    //move plant modules
    for(var i in this.modules) {
        this.modules[i].x-=levelstate.current_speed;
        if(this.modules[i].getBounds().right<0) this.modules.splice(i,1);
    }
    //move bubble emitters
    for(var i in this.bubbles) {
        this.bubbles[i].emitX-=levelstate.current_speed;
        this.bubbles[i].forEachAlive(function(child,speed){
           child.x-=speed;
        },this,levelstate.current_speed);
        if(this.bubbles[i].getBounds().right<0) this.bubbles.splice(i,1);
    }
    this.groups.raycast.update();
}
GraphicHandler.prototype.generateWithThree=function(src,last_r) {
    var p=(src=='plant')?this.proba_plant:this.proba_sand;
    var side,ox=0;
    do {
        side=p.getRandomObj();
        if(side=='left' || side=='middle') {
            p.manag.add('right',40);
            p.manag.add('middle',60);
            p.manag.add('noth',0);
            p.manag.add('left',0);
        }
        else if(side=="right") {
            p.manag.add('right',0);
            p.manag.add('middle',0);
            p.manag.add('noth',60);
            p.manag.add('left',40);
        }
        else if(side=="noth") {
            p.manag.add('right',0);
            p.manag.add('middle',0);
            p.manag.add('noth',20);
            p.manag.add('left',80);
            ox+=Math.floor(Math.random()*game.world.width);
        }
    }while(side=='noth');

    let img=game.add.image(last_r+ox,game.world.height,src+"_"+side);
    img.anchor.setTo(0,1);
    img.width*=this.reSize_coef;
    img.height*=this.reSize_coef;
    return img;
}

GraphicHandler.prototype.generatePlantModule=function(npc) {
    let img=game.add.image(npc.centerX,game.world.height,"plant_mod_"+game.rnd.integerInRange(1,7));
    img.anchor.setTo(0.5,1)
    img.width*=this.reSize_coef;
    img.height*=this.reSize_coef;
    this.modules.push(img);
}

GraphicHandler.prototype.start=function() {
    let t=game.rnd.integerInRange(-this.spawn_param.range,this.spawn_param.range);
    this.bubble_timeout=new Timer(function(t){
        t.spawnBubble();
    },this.spawn_param.interval+t,this);
}

GraphicHandler.prototype.pause=function() {if(this.bubble_timeout) this.bubble_timeout.pause();};
GraphicHandler.prototype.resume=function() {if(this.bubble_timeout) this.bubble_timeout.resume();};

GraphicHandler.prototype.spawnBubble=function() {
    let e=game.add.emitter(game.world.width*1.15,game.world.height,40);
    e.width=game.world.width/15;
    e.makeParticles('bubble');
    e.ignoreChildInput=true;
    e.gravity=-1;
    e.minParticleSpeed.set(-5, -170);
    e.maxParticleSpeed.set(5, -220);
    e.minRotation=0;
    e.maxRotation=0;
    e.minParticleScale=game.world.height*0.01/64;//100=bubble width
    e.maxParticleScale=game.world.height*0.07/64;

    this.groups.bubbles.add(e);
    this.bubbles[this.bubbles.length-1].start(false,0,700);

    //set the next timeout
    let t=game.rnd.integerInRange(-this.spawn_param.range,this.spawn_param.range);
    this.bubble_timeout=new Timer(function(t){
        t.spawnBubble();
    },this.spawn_param.interval+t,this);
}
/*
    Returns an array of indexes containing the @param obj
 */

Object.defineProperty(Array.prototype, "indexesOf", {
    enumerable: false,
    value: function(obj) {
        var ret=[];
        this.forEach(function(val,index){
            if(val==obj) ret.push(index);
        });
        return ret;
    }
});
/*
RayCast is an object created using phaser-illuminated and illuminated.js
It creates a sun-like ray casting object, the parameters speak for themselves
lamp_config e.g. : {
 "distance":game.world.height,
 "color":"rgba(255,255,150,0.3)",
 "diffuse":0.8,
 "radius":10,
 "samples":10 -> "quality" of the light
}
 */


function RayCast(x_pos,y_pos,radius,lamp_config,ray_nb,speed,poly_length) {
    this.lamp=game.add.illuminated.lamp(x_pos,y_pos,lamp_config);
    this.speed=speed;
    //costs too much memory
    var my_obj=[];
    var a=0;
    for(var i=0;i<ray_nb;i++){
        my_obj.push(game.add.illuminated.polygonObject([
            {x:x_pos+Math.cos(game.math.degToRad(a))*radius,
                y:-Math.sin(game.math.degToRad(a))*radius+y_pos},

            {x:x_pos+Math.cos(game.math.degToRad(a+poly_length))*radius,
                y:-Math.sin(game.math.degToRad(a+poly_length))*radius+y_pos},

            {x:x_pos+Math.cos(game.math.degToRad(a-poly_length))*radius,
                y:-Math.sin(game.math.degToRad(a-poly_length))*radius+y_pos}
        ],1));
        a-=360/ray_nb;
    }
    this.lamp.createLighting(my_obj);
}
RayCast.prototype.update=function() {
    this.lamp.refresh();
    this.lamp.rotation+=game.math.degToRad(this.speed);
}
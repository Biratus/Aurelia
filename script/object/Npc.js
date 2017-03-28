function Npc(name,state) {
    this.name=name;
    this.lvlstate=state;
    Phaser.Sprite.call(this,game,0,0,name);
    this.onCollide=function() {
        //console.log('COLLIDE WITH : '+this.name);
        this.lvlstate.end();
    }
    if(name=="boat") Npc.Boat.apply(this);
    else if(name=="cuttle") Npc.Cuttle.apply(this);
    else if(name=="sting") Npc.Stingray.apply(this);
    else if(name=="sea_turtle") Npc.SeaTurtle.apply(this);
    else if(name=="plastic_ring") Npc.PlasticRing.apply(this);
    else if(name=="coin") Npc.Coin.apply(this);
    state.npc_grp.add(this);
    this.my_init();
}
Npc.prototype = Object.create(Phaser.Sprite.prototype);
Npc.prototype.constructor = Npc;


var rand_gen=new RandomGenerator({
		harpoon:40,
		nothing:20,
		net:40
});

Npc.Boat=function() {
    this.my_init=function() {
        this.height*=(game.world.width/2)/this.width;
        this.width=game.world.width/2;
        this.x-=(this.width-1);
        var toX=game.world.width-this.width;
        this.animations.add('idle',[0,1,2,3,2,1],20,true);
        var t=game.add.tween(this).to({x:toX},3500,Phaser.Easing.Cubic.Out,true);
        t.onComplete.add(function(boat) {
            boat.weaponize();
        });
        this.animations.play('idle');
        this.lvlstate.audio.boat.loopFull(0.8);
    }
    this.update=function() {
        if((this.children[0] && this.children[0].engaged) ||(game.time.now-this.weapon_start>2000 && this.weapon=='nothing')) this.x-= this.lvlstate.current_speed;
    }

    this.weaponize=function() {
        this.weapon=rand_gen.getRandomObj();
        this.lvlstate.audio.boat.stop();
        if(this.weapon=="harpoon") {
            var h = game.add.sprite(this.x+this.width/2, this.bottom + 15, 'harpoon');
            h.anchor.setTo(0.1,0.5);
            h.scale.setTo(0.7);
            h.angle=new Phaser.Point(h.x,h.y).angle(new Phaser.Point(this.lvlstate.jellyfish.my_body().right,this.lvlstate.jellyfish.y),true);
            h.jelly=this.lvlstate.jellyfish;
            h.boat=this;
            h.onCollide=function() {
                this.anchor.setTo(0.5);
                this.body.setZeroVelocity();
                this.body.y=this.boat.lvlstate.jellyfish.y;
                this.body.x=this.boat.lvlstate.jellyfish.x;
                this.boat.lvlstate.end();
            }
            h.update=function(){
                if(game.time.now-this.boat.weapon_start>3000 && !this.engaged) {
                    //Throw harpoon
                    this.engaged = true;
                    this.boat.lvlstate.audio.harpoon.play();
                    var r=this.rotation;
                    game.physics.p2.enable(this,true);
                    this.body.collideWorldBounds=false;
                    this.body.rotation=r;
                    this.body.setCollisionGroup(this.boat.lvlstate.collision_grp);
                    this.body.collides(this.boat.lvlstate.collision_grp,this.onCollide,this);
                }
                else if(!this.engaged) {
                    //Rotate harpoon = find jellyfish
                    var r=game.math.rotateToAngle(this.rotation,game.physics.arcade.angleToXY(this,this.jelly.my_body().right,this.jelly.y));
                    this.rotation=(Math.sin(r)>0)?r:Math.PI;
                }
                if(this.engaged) {
                    this.body.x+=Math.cos(this.rotation)*12;
                    this.body.y+=Math.sin(this.rotation)*12;
                }
            }
            this.children.push(h);
        }
        else if(this.weapon=="net") {
            var n=game.add.sprite(this.x+this.width/2,this.y,'net');
            n.boat=this;
            n.dest_y=game.rnd.integerInRange(game.world.height*0.2,game.world.height*0.8);
            n.update=function() {
                if(this.centerY>this.dest_y) {
                    this.y=this.dest_y-this.height/2;
                    this.engaged=true;
                }
                else if(this.centerY<this.dest_y) this.y+=6;
                else if(this.centerY==this.dest_y) this.x-=this.boat.lvlstate.current_speed;
            }
            n.onCollide=function(){
                this.anchor.setTo(0.5);
                this.x=this.boat.lvlstate.jellyfish.body.x;
                this.y=this.boat.lvlstate.jellyfish.body.y;
                this.boat.lvlstate.end();
            }
            this.children.push(n);
        }
        this.weapon_start=game.time.now;
    }
}

Npc.Cuttle=function() {
    this.my_init=function() {
        this.x=game.world.width;
        this.width*=game.world.height*0.1/this.height;
        this.height=game.world.height*0.1;
        this.y=game.world.height-this.height-game.world.height*0.01;

        this.lvlstate.graphicHandler.generatePlantModule(this);
    }
    this.update=function() {
        this.x-=this.lvlstate.current_speed;
        if(game.physics.arcade.distanceBetween(this.lvlstate.jellyfish,this)<this.lvlstate.jellyfish.my_body().height) {
            this.x=this.lvlstate.jellyfish.body.x;
            this.y=this.lvlstate.jellyfish.body.y;
        }
    }
}

Npc.Stingray=function() {
    this.my_init=function() {
        this.height*=game.world.width*0.4/this.width;
        this.width=game.world.width*0.4;
        this.anchor.setTo(0,0.5);
        this.x=game.world.width;
        var tenPct=game.world.height*0.1;
        this.y=game.rnd.integerInRange(this.height+tenPct,game.world.height-this.height-tenPct);//random in the middle of the screen
        this.amp=game.rnd.integerInRange(tenPct,game.world.height*0.3);
        this.direction=(this.y<game.world.height/2)?1:-1;
        this.initY=this.y;
        if((this.height*0.5+this.y+this.amp/2)>game.world.height*0.95) this.initY=game.world.height*0.95-this.height*0.5-this.amp/2;
        else if((this.height*0.5-this.y-this.amp/2<tenPct)) this.initY=tenPct+this.height*0.5+this.amp/2;

        this.animations.add('move');
        this.animations.play('move',56,true);
        
    };
    this.update=function() {
        this.x-=this.lvlstate.current_speed;
        let val=(Math.abs(this.y-this.initY)>=0.85*this.amp/2)?1:2;
        this.y+=this.direction*val;
        if(Math.abs(this.y-this.initY)>=this.amp/2) {
            this.y=this.initY+this.direction*this.amp/2;
            this.direction*=-1;
        }
    }
}

Npc.SeaTurtle=function() {
    this.my_init=function() {
        this.width*=game.world.height*0.3/this.height;
        this.height=game.world.height*0.3;
        this.x=game.world.width;
        var tenPct=game.world.height*0.1;
        this.amp=game.rnd.integerInRange(game.world.height*0.2,game.world.height*0.6);
        this.y=game.rnd.integerInRange(tenPct,game.world.height*0.8-this.height);//random in the middle of the screen
        this.direction=(this.y<game.world.height/2)?1:-1;
        this.initY=this.y;
        if((this.height*0.5+this.y+this.amp/2)>game.world.height*0.95) this.initY=game.world.height*0.95-this.height*0.5-this.amp/2;
        else if((this.height*0.5-this.y-this.amp/2<tenPct)) this.initY=tenPct+this.height*0.5+this.amp/2;

        //this.body.immovable=true;
    };
    this.update=function() {
        this.x-=this.lvlstate.current_speed;
        let val=(Math.abs(this.y-this.initY)>=0.85*this.amp)?1:2;
        this.y+=this.direction*val;
        if(Math.abs(this.y-this.initY)>=this.amp) {
            this.y=this.initY+this.direction*this.amp;
            this.direction*=-1;
        }
    };
    this.onCollide=function(){}
}

Npc.PlasticRing=function() {
    this.my_init=function() {
        this.width*=game.world.height*0.1/this.height;
        this.height=game.world.height*0.1;
        this.x=game.world.width;
        this.y=game.rnd.integerInRange(game.world.height*0.2,game.world.height*0.7);
    }
    this.update=function() {
        this.x-=this.lvlstate.current_speed;
    }
}

Npc.Coin=function() {
    this.my_init=function() {
        this.x=game.world.width;
        this.width*=game.world.height*0.1/this.height;
        this.height=game.world.height*0.1;
        this.y=game.world.height-this.height/2-game.world.height*0.01;
        this.anchor.setTo(0.5);
        this.state="hidden";
        this.amp=game.world.height*0.1;
        this.direction=game.rnd.pick([-1,1]);

		this.lvlstate.graphicHandler.generatePlantModule(this);
    }
    this.update=function() {
        if(this.state=="hidden") {
            this.x-=this.lvlstate.current_speed;
            if((game.physics.arcade.distanceToXY(this,this.lvlstate.jellyfish.my_body().right,this.lvlstate.jellyfish.my_body().bottom)<this.height
                || game.physics.arcade.distanceBetween(this,this.lvlstate.jellyfish)<this.lvlstate.jellyfish.my_body().height)) {
                this.state=null;
                /*this.children.add(game.add.bitmapData());
                this.bmp=this.children[this.children.length-1];
                this.bmp.addToWorld();*/
                this.my_tween = game.add.tween(this).to({
                    x: [this.x, this.x+this.width*2, game.world.width-this.width, game.world.width-this.width],
                    y: [this.y, this.y, this.y-this.height, game.rnd.realInRange(0.2,0.7)*game.world.height],
                }, 1500,Phaser.Easing.Linear.In,true).interpolation(function(v, k){
                    return Phaser.Math.bezierInterpolation(v, k);
                });
                this.my_tween.onComplete.add(function(coin){
                    coin.state="swim";
                    coin.initY=coin.y;
                });
            }
        }
        else if(this.state=="swim") {
            this.x-=this.lvlstate.current_speed*0.5;
            let val=(Math.abs(this.y-this.initY)>=0.85*this.amp)?1:2;
            this.y+=this.direction*val;
            if(Math.abs(this.y-this.initY)>=this.amp) {
                this.y=this.initY+this.direction*this.amp;
                this.direction*=-1;
            }
        }
  //      if(this.bmp) {}
    }
    this.onCollide=function() {
        this.lvlstate.coins++;
        this.lvlstate.audio.coin.play();
        this.destroy();
    }
}
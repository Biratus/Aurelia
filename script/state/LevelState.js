function LevelState() {
    Phaser.State.call(this);
}

LevelState.REEF=1;
LevelState.WILD_SEA=0;
LevelState.BEACH=1;
LevelState.FISH=2;

LevelState.prototype.init=function() {
    game.plugins.add(Phaser.Plugin.PhaserIlluminated);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);

    this.pointer=game.input.pointer1;
    this.graphicHandler=new GraphicHandler();
    
    this.npc_grp=game.add.group();
    this.collision_grp=game.physics.p2.createCollisionGroup();
    game.physics.p2.updateBoundsCollisionGroup();
    

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.time.desiredFps=60;
    this.jellyfish=new Jellyfish();
    var g=this.game.add.group();
    g.add(this.jellyfish);
    this.jellyfish.body.setCollisionGroup(this.collision_grp);
    this.jellyfish.body.collides(this.collision_grp);

    this.coins=0;
    this.distance=0;
    //this.dis_text=game.add.text(10,10,"distance: "+this.distance);
    this.current_speed=4;
    this.environment=LevelState.WILD_SEA;
    this.taponce=false;
        
    this.npcGenerator=new NPCGenerator(LevelState.REEF,this);
    this.npcs=this.npc_grp.children;
    game.input.onTap.addOnce(function(){
        console.log('start');
        this.audio.menu.stop();
        this.audio.game.loopFull(0.6);
        this.audio.ambience.loopFull(1);
        this.tap_start.tween.stop();
        this.tap_start.kill();
        this.taponce=true;
        this.npcGenerator.start();
        this.graphicHandler.start();
        this.jellyfish.start();
    },this);
    this.npcGenerator.onSpawn.add(function(name) {
        //if(this.hasNpc(name) && one_on_screen.indexOf(name)>=0) {this.npc_wait_q.push(name);console.log('add in wait '+name);}
        this.npc_grp.add(new Npc(name,this));
    },this);
    this.tint_img=game.add.image(-1,0,'mask');
    this.tint_img.width=game.world.width+2;
    this.tint_img.height=game.world.height;

    this.tap_start=game.add.image(game.camera.width/2,game.camera.height/2,'tap_start');
    this.tap_start.anchor.setTo(0.5);
    this.tap_start.height*=game.camera.width*0.7/this.tap_start.width;
    this.tap_start.width=game.camera.width*0.7;
    this.tap_start.tween=game.add.tween(this.tap_start).to({'alpha':0.1},2000,Phaser.Easing.Circular.Out,true,0,false,true);

    this.ended=false;
    this.audio={
        "menu":game.add.audio('menu'),
        "game":game.add.audio('game_music'),
        "ambience":game.add.audio('ambience'),
        'boat':game.add.audio('boat'),
        'coin':game.add.audio('coin'),
        "harpoon":game.add.audio('harpoon')
    }
    this.audio.menu.loopFull(0.6);
}

LevelState.prototype.paused=function() {
    this.npcGenerator.rnd.pause();
    this.graphicHandler.pause();
}

LevelState.prototype.resumed=function() {
    this.npcGenerator.rnd.resume();
    this.graphicHandler.resume();
}

LevelState.prototype.stopGeneratingNpc=function() {this.npcGenerator.rnd.resetTimeouts();}

LevelState.prototype.update=function() {
    if(!this.taponce || this.ended) return;

    //graphics
    this.graphicHandler.update(this);
    //control
    if(this.pointer.isDown) this.jellyfish.moveTo(this.pointer.worldY);
    else if (this.pointer.isUp) this.jellyfish.body.setZeroVelocity();
    //npc
    for (var i in this.npcs) {
        //if(!this.npcs[i].alive) this.npcs.splice(i,1);
        if(this.npcs[i].right<0) this.npcs[i].destroy();
    }
    //checkCollision
    for(var i in this.npcs) {
        var n=this.npcs[i];
        if(Phaser.Rectangle.intersects(n,this.jellyfish.my_body())) n.onCollide();
        if(n.children.length>0) {
            if(!n.children[0].body && Phaser.Rectangle.intersects(n.children[0],this.jellyfish.my_body()))  n.children[0].onCollide();
        }
    }

    var a=Math.floor(this.distance)%50==0;
    this.distance+=this.current_speed/30;
    if(!a && Math.floor(this.distance)%500==0){
        var e=this.environment;
        while(e==this.environment) {
            e=game.rnd.integerInRange(0,2);
        }
        this.environment=e;
        console.log('changeEnv');
        this.npcGenerator.changeEnvironment(e);
    }
    //this.dis_text.text="distance: "+Math.floor(this.distance/10)+" coin: "+this.coins;

    this.current_speed+=0.002;
    //if(this.current_speed===Math.round(this.current_speed)) console.log("speed: "+this.current_speed);
}

LevelState.prototype.render=function() {
    //game.debug.body(this.jellyfish,'red',false);

    //game.debug.spriteBounds(this.jellyfish,'red',false);
    /*for(var i in this.npcs) {
        if(this.npcs[i].name=="coin"){// && this.npcs[i].weapon=="harpoon") {
            game.debug.spriteBounds(this.npcs[i],'red',false);
        }
    }*/
    //game.debug.spriteBounds(this.jellyfish,'red',false);
    //game.debug.geom(this.jellyfish.my_body(),"#e23b24");
    game.debug.text("distance: "+Math.round(this.distance), 20, 20, "#ffffff");
    game.debug.text("coins: "+this.coins, 20, 50, "#000000");
    game.debug.text(game.time.fps || '--', game.world.width-20, 20, "#00ff00");
}

LevelState.prototype.end=function() {
    console.log('LOSE !!');
    this.ended=true;
    this.current_speed=0;
    this.audio.game.stop();
    this.audio.ambience.stop();
    this.stopGeneratingNpc();
    var c=parseInt(localStorage.getItem('coin'))+this.coins || this.coins;
    localStorage.setItem('coin',c);
    setTimeout(function(){game.state.restart(true,false,LevelState.REEF)},2000);
}
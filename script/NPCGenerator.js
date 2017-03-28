function NPCGenerator(type,lvlstate) {
    this.type=type;
    this.environment=lvlstate.environment;
    this.rnd=new RandomSpawn();

    this.onSpawn=new Phaser.Signal();
    this.rnd.onSpawn.add(function(n,t){this.onSpawn.dispatch(n,t)},this);

    //set spawning interval values on the random generator
    for(var i in NPCProba) {
        this.rnd.addObj(i,NPCProba[i].interval[lvlstate.environment],NPCProba[i].range);
    }
    this.start=function(timeout) {
        timeout=timeout || 0;
        setTimeout(function(t) {t.rnd.start()},timeout,this);
    }
}

NPCGenerator.prototype.changeEnvironment=function(env) {
    for(var i in NPCProba) {
            this.rnd.setInterval(i,NPCProba[i].interval[env]);
        }
    this.environment=env;
}
/*
    Change the interval or range of a NPC:
    @name: name (string) of NPC
    @object: either "interval" or "range"
    @operation: either "+" or "-"
    @value: the value to @operation the @object (int)
*/

/*NPCGenerator.prototype.changeValue=function(name,object,operation,value) {
    if(operation=="+") {
        this.rnd.increase
    }
}*/

var NPCProba={
    sea_turtle:{interval:[18,27,27],range:1},
    coin:{interval:[9,10.8,13.5],range:1},
    boat:{interval:[18,10.8,9],range:1},
    cuttle:{interval:[10.8,13.5,18],range:1},
    sting:{interval:[13.5,18,18],range:1},
    plastic_ring:{interval:[10.8,9,9],range:1},
}
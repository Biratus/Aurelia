/*
	------------------------------

	HOW TO USE RANDOM SPAN OBJECT:

	------------------------------
*/

/*var timestart,rnd,obj={
	turtle:[],
	boat:[],
	coin:[]
};
var moy;
$(document).ready(function(){
	rnd=new RandomSpawn();
	rnd.addObj('turtle',2,0.5);
	rnd.addObj('boat',3,0.5);
	rnd.addObj('coin',2,0.5);
	rnd.onSpawn(function(name,t) {
		obj[name].push(t);
	});
	rnd.onResetTimeout(function(){
		moy={
			turtle:0,
			boat:0,
			coin:0
		};
		for(var i in obj) {
			for(var j in obj[i]) {
				moy[i]+=obj[i][j]/1000;
			}
		}
		for (var i in moy) {
			moy[i]/=obj[i].length;
		}
		console.log('1.5 < TURTLE < 2.5  : '+moy.turtle);
		console.log('2.5 < BOAT < 3.5  : '+moy.boat);
		console.log('1.5 < COIN < 2.5  : '+moy.coin);
	});
	console.log('TO START SIMULATION:  rnd.start()');
});*/


function RandomSpawn() {
    this.obj={};
    this.timeouts={};
    //interval and range are in seconds
    //the range is the regularity of the repetition
    this.addObj=function(name,interval,range) {this.obj[name]={interval:interval*1000,range:range*1000};}
    //val is in seconds
    this.addToRange=function(name,val) {this.obj[name].range+=val*1000;}
    this.addToInterval=function(name,val) {this.obj[name].interval+=val*1000;}
    this.setRange=function(name,val){this.obj[name].range=val*1000;}
    this.setInterval=function(name,val){this.obj[name].interval=val*1000;}

    this.start=function() {
        for (var i in this.obj) {
            var r=Math.random()*this.obj[i].range*2-this.obj[i].range;
            this.timeouts[i]=new Timer(function(rds,i,t){rds.spawn(i,t);},(r+this.obj[i].interval),this,[i,(r+this.obj[i].interval)]);
        }
    }

    this.onResetTimeout=new Phaser.Signal();
    this.resetTimeouts=function() {
        for (var i in this.timeouts) this.timeouts[i].pause();
        this.timeouts={};
        this.onResetTimeout.dispatch();
    }
    this.pause=function() {for(var i in this.timeouts) this.timeouts[i].pause();}
    this.resume=function() {for(var i in this.timeouts) this.timeouts[i].resume();}
    //can have 2 arg, name:name of the object, time: time elapsed since last spawn of this object in ms
    this.onSpawn=new Phaser.Signal();
    //t is the time elapsed since last spawn of this object
    this.spawn=function(arg) {
        var name=arg[0],t=arg[1];
        var r=Math.random()*this.obj[name].range*2-this.obj[name].range;
        this.timeouts[name].remaining=r+this.obj[name].interval;
        this.timeouts[name].arg[1]=r+this.obj[name].interval;
        this.timeouts[name].isRunning=false;
        this.timeouts[name].resume();
        this.onSpawn.dispatch(name,t);
    }
}

//Taken from: http://stackoverflow.com/questions/3969475/javascript-pause-settimeout
//Allows to pause/resume timeouts events
//not the original version

//Function use to create a timer
function Timer(callback, delay,ctx,arg) {
    this.timerId, this.start, this.remaining = delay;
    this.ctx=ctx,this.arg=arg,this.callback=callback,this.isRunning=false;

    this.pause = function() {
        clearTimeout(this.timerId);
        this.isRunning=false;
        this.remaining = this.remaining-(new Date().getTime() - this.start);
    };
    this.resume = function() {
        if(this.isRunning) return;
        this.start = new Date().getTime();
        this.timerId = setTimeout(this.callback, this.remaining,this.ctx,this.arg);
        this.isRunning=true;
    };
    this.timeRemaining=function() {
        return this.remaining-(new Date().getTime() - this.start);//this.start+this.remaining-new Date().getTime();
    }
    this.resume();
    this.isRunning=true;
}
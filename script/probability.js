/*
	-------------------------------------------------------------------

	THIS PART WAS DONE FOR THE HARPOON/NET/NOTHING RANDOM GENERATION
	PART 2: RANDOM GENERATION

	-------------------------------------------------------------------
*/

function RandomGenerator(param) {
	this.manag=new ProbaMana();
	for(var i in param) this.manag.add(i,param[i]);
	this.getRandomObj=function() {
		var n=Math.random();
		var count=0;
		for(var i in this.manag.proba) {
			count+=this.manag.proba[i]/100;
			if(n<=count) return i;
		}
	}
	/*this.getXRandom=function (x) {
		var prob={};
		for (var i in this.manag.proba) prob[i]=0;
		for (var i=0;i<x;i++) {
			prob[this.getRandomObj()]+=1;
		}
		var str1='';
		var str2='';
		for(var i in prob) {
			str1+="|  "+i+"  |";
			str2+="|  "+prob[i]+"  |";
		}
		console.log("  ----  PROBABILITY CHECK  ----");
		console.log(str1);
		console.log(str2);
	}*/
}
/*
	//Execution sample:
	var rand_gen=new RandomGenerator({
		harp:25,
		noth:50,
		net:25
	});
	console.log("rand_gen.getXRandom(100):");
	rand_gen.getXRandom(100);
	console.log("rand_gen.manag.increase('harp',25):");
	rand_gen.manag.increase('harp',25);
	console.log("rand_gen.getXRandom(100):");
	rand_gen.getXRandom(100);
*/
/*
	-----------------------------------------------------------------

	THIS PART WAS DONE FOR THE HARPOON/NET/NOTHING RANDOM GENERATION
	PART 1: PROBABILITY MANAGER

	-----------------------------------------------------------------
*/

function ProbaMana() {
	this.proba={};
	this.add=function(name,pourc) {this.proba[name]=pourc;};
	this.increase=function(name,inc) {
		this.proba[name]+=inc;
		if(this.size()>100) {
			var dif=this.size()-100;
			var l=this.length()-1;
			for(var i in this.proba) {
				if(i!=name) this.proba[i]-=dif/l;
			}
		}
		else console.warn('IF NOT IN INITIALIZATION -> ERROR !!!');
		};
	this.decrease=function(name,inc) {
		var s=this.size();
		this.proba[name]-=inc;
		if(s==100 && this.size()<100) {
			var dif=100-this.size();
			var l=this.length()-1;
			for (var i in this.proba) {
				if(i!=name) this.proba[i]+=dif/l;
			}
		}
		else console.warn('IF NOT IN INITIALIZATION -> ERROR !!!');
	};
	this.size=function() {
		var s=0;
		for (var i in this.proba) {
			s+=this.proba[i];
		}
		if(Math.floor(s)==100 || Math.ceil(s)==100) return 100;
		else return s;
	};
	this.length=function() {
		var l=0;
		for(var i in this.proba) l++;
		return l;
	};
}
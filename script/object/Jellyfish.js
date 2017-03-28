function Jellyfish() {
    Phaser.Sprite.call(this,game,0,0,'jellyfish');

    this.anchor.setTo(0.5);
    this.x=50;
    this.y=game.world.height/2;
    let coef=(game.world.height/4)/this.height;
    this.height=game.world.height/4;
    this.width*=coef;
    this.frame=0;
    this.animations.add('move',null,15,true);
    this.rotation=Math.PI/2;
    
    //CHANGE SPEED ?
    this.speed=4;
    
    game.physics.p2.enable(this);
    this.body.setRectangle(this.width*0.75,this.height*0.9);
    this.my_body=function(){
        return new Phaser.Rectangle(this.x-this.height*0.45,this.y-this.width*0.375,this.height*0.9,this.width*0.75);
    }
    this.body.rotation=Math.PI/2;
}
var negFrame=[3,4,5,6,7];//frames where the jelly goes backwards

Jellyfish.prototype = Object.create(Phaser.Sprite.prototype);
Jellyfish.prototype.constructor = Jellyfish;

Jellyfish.prototype.update=function() {
    //this.graph=this.graph||game.add.graphics(0,0);
    var coef=(this.x<game.world.width/5)?2:1;
    if(this.animations.currentAnim.isPlaying && negFrame.indexOf(this.animations.currentFrame.index)>=0) this.body.moveLeft(50);
    else if(this.animations.currentAnim.isPlaying) this.body.moveRight(coef*50);
}

Jellyfish.prototype.moveTo=function(y) {
    if(y<this.my_body().y-5 && this.my_body().y-this.speed>=10) this.body.moveUp(this.speed*50);
    else if(y>this.my_body().y+5 && this.my_body().bottom+this.speed<=game.world.height-5) this.body.moveDown(this.speed*50);
    else this.body.velocity.y=0;
}

Jellyfish.prototype.start=function() {
    this.animations.play('move');

}
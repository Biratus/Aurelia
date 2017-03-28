function LoadState() {
    Phaser.State.call(this);
}
LoadState.prototype.init=function(data) {
    this.datas=data;
}

LoadState.prototype.preload=function() {
    //load images
    for(var i in this.datas.assets.image) {
        this.load.image(i,this.datas.assets.image[i]);
    }
    for(var i in this.datas.assets.audio) {
        this.load.audio(i,this.datas.assets.audio[i]);
    }
    var c;
    for (var i in this.datas.assets.spritesheet) {
        c=this.datas.assets.spritesheet[i];
        this.load.spritesheet(i,c.src,c.fW,c.fH);
    }
    console.log('load img finish');
}

LoadState.prototype.create=function() {
    game.scale.scaleMode=game.scale.SHOW_ALL;
    game.scale.pageAlignHorizontally=true;
    game.scale.pageAlignVertically=true;
    game.scale.forceOrientation(true,false);
    game.state.start('MenuState');
}


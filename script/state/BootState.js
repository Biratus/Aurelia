function BootState() {
    Phaser.State.call(this);
}

BootState.prototype.preload=function() {
    game.time.advancedTiming = true;
    this.load.text("assets","assets.json");
}

BootState.prototype.create=function() {
    var assets=JSON.parse(this.game.cache.getText("assets"));
    game.state.start("LoadState",true,false,assets);
}
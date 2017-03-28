function MenuState() {
    Phaser.State.call(this);
}

MenuState.prototype.create=function() {
    game.state.start('LevelState',true,false,LevelState.REEF);
}

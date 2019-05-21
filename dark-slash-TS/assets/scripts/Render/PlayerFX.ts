import Game from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerFX extends cc.Component 
{
    @property(cc.Animation)
    private introAnim: cc.Animation = null;

    @property(cc.Animation)
    private reviveAnim:cc.Animation = null;

    game: Game;


    init(game: Game)
    {
        this.game = game;
        this.introAnim.node.active = false;
        this.reviveAnim.node.active = false;
    }

    playIntro(): void
    {
        this.introAnim.node.active = true;
        this.introAnim.play('start');
    }

    introFinish(): void
    {
        this.introAnim.node.active = false;
        this.game.playerReady();
    }

    playRevive(): void
    {
        this.reviveAnim.node.active = true;
        this.reviveAnim.node.setPosition(this.game.player.node.position);
        this.reviveAnim.play('revive');
    }

    reviveKill(): void
    {
        this.game.clearAllEnemy();    
    }

    revivieFinish(): void
    {
        this.game.playerReviveReady();
        this.reviveAnim.node.active = false;
    }
}
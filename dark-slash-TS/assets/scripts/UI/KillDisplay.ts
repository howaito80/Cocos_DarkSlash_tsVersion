const {ccclass, property} = cc._decorator;

@ccclass
export default class KillDisplay extends cc.Component
{
    @property(cc.Label)
    private killsLable: cc.Label = null;

    @property(cc.Animation)
    private anim: cc.Animation = null;

    showKills(kills: number): void
    {
        this.node.active = true;
        this.anim.play('kill-pop');
        this.killsLable.string = kills.toString();
    }
    
    hide(): void
    {
        this.node.active = false;
    }
}
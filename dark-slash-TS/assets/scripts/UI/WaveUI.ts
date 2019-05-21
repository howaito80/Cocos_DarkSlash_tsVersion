const {ccclass, property} = cc._decorator;

@ccclass
export default class WaveUI extends cc.Component {

    @property(cc.Label)
    waveLabel: cc.Label = null;

    @property(cc.Animation)
    anim: cc.Animation = null;

    show(num: number): void
    {
        this.waveLabel.string = num.toString();
        this.anim.play('wave-pop');
    }

    hide()
    {
        this.node.active = false;
    }


}

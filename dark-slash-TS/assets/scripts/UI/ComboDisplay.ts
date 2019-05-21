const {ccclass, property} = cc._decorator;

@ccclass
export default class ComboDisplay extends cc.Component
{
    @property(cc.Label)
    private comboLabel: cc.Label = null;

    @property(cc.Sprite)
    private spFlare: cc.Sprite = null;

    @property([cc.Color])
    private comboColor: cc.Color[] = []

    @property(cc.Animation)
    private anim: cc.Animation = null;

    @property
    private showDuation: number = 0;

    private comboCount: number;
    private timer: number;

    init(): void
    {
        this.node.active = false;
        this.comboCount = 0;
        this.timer = 0;
    }

    doCombo(): void
    {
        this.comboCount += 1;
        this.node.active = true;
        let colorIdx = Math.min(Math.floor(this.comboCount / 10), this.comboColor.length  - 1);
        this.spFlare.node.color = this.comboLabel.node.color = this.comboColor[colorIdx];
        this.comboLabel.string = this.comboCount.toString();

        this.anim.play('combo-pop');
        this.timer = 0;
    }   

    private hide(): void
    {
        this.comboCount = 0;
        this.node.active = false;
    }

    update(dt: number): void
    {
        if(!this.node.active)
        {
            return;
        }

        this.timer += dt;
        if(this.timer >= this.showDuation)
        {
            this.hide();
        }
    }
}
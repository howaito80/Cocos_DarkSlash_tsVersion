import WaveManage from "../Actors/WaveManage";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WaveProgress extends cc.Component
{
    @property(cc.Node)
    private head: cc.Node = null;

    @property(cc.ProgressBar)
    private bar: cc.ProgressBar = null;

    @property
    private lerpDuration: number = 0;

    private curProgress: number;
    private destProgress: number;
    private timer: number;
    private isLerping: boolean;

    init(): void
    {
        this.bar.progress = 0;
        this.curProgress = this.destProgress = 0;
        this.timer = 0;
        this.isLerping = false;
    }


    updateProgress(progress: number): void
    {
        this.curProgress = this.bar.progress;
        this.destProgress = progress;
        this.isLerping = true;
        this.timer = 0;
    }

    update(dt: number): void
    {
        if(!this.isLerping)
        {
            return;
        }

        this.timer += dt;
        if(this.timer >= this.lerpDuration)
        {
            this.isLerping = false;
            this.timer = this.lerpDuration;
        }

        if(this.lerpDuration == 0)
        {
            cc.error('zero divider');
        }
        this.bar.progress = cc.misc.lerp(this.curProgress, this.destProgress, this.timer / this.lerpDuration);
        let headPosX = this.bar.barSprite.node.width * this.bar.progress;
        this.head.x = headPosX;

    }
}
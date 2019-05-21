const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeUI extends cc.Component 
{

    @property(cc.Animation) //  类似unity中的Animator组件, 单个动画序列则是cc.AnimationClip
    menuAnim : cc.Animation = null;

    @property(cc.ParticleSystem)
    menuParticle : cc.ParticleSystem = null;

    @property(cc.Node)
    btnGroups : cc.Node = null;


    start ():void
    {
        // 教程中为停用的接口cc.eventManager.pauseTarget(this.btnGroup, true);
        this.btnGroups.pauseSystemEvents(true);

        // 延时执行一次回调 
        this.scheduleOnce((()=>{
            this.menuAnim.play();
            this.menuParticle.enabled = false;
        }).bind(this), 2);
    }

    // 在动画中被事件帧调用
    showParticle():void
    {
        this.menuParticle.enabled = true;
    }

    // 在动画中被事件帧调用
    enableBtns(): void
    {
        this.btnGroups.resumeSystemEvents(true);
    }

    startGame(): void
    {
        this.btnGroups.pauseSystemEvents(true);
        cc.director.loadScene("PlayGame");
    }
}

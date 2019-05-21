const {ccclass, property} = cc._decorator;

@ccclass
export default class ShowMask extends cc.Component 
{

    // 游戏开始时显示遮罩(在editor中隐藏以便编辑)
    start () : void
    {
        this.getComponent(cc.Sprite).enabled = true;
    }
}

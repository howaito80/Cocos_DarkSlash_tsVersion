const {ccclass, property} = cc._decorator;

@ccclass
export default class SortManage extends cc.Component
{
    private frameCount: number = 0;

    init(): void
    {
        this.frameCount = 0;
    }

    update(dt: number): void
    {
        if(++this.frameCount % 6 == 0)
        {
            this.sortChildrenByY();
        }
    }

    private sortChildrenByY(): void
    {
        let sortList = this.node.children.slice();
        sortList.sort((a, b)=>{return b.y - a.y;});
        for (let i = 0; i < sortList.length; i++) 
        {
            let node = sortList[i];
            if(node.active)
            {
                node.setSiblingIndex(i);
            }
        }
    }
}
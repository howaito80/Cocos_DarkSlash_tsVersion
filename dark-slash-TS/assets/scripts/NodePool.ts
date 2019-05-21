const {ccclass, property} = cc._decorator;

// 单个对象池
// 自定义类型若要显示在面板上，必须写成@ccclass('xxx')用于序列化
@ccclass('NodePool')
export default class NodePool
{
    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    @property(cc.Integer)
    size: number = 0;
    
    idx : number;
    initList: cc.Node[];
    list: cc.Node[];

    constructor()
    {
        this.idx = 0;
        this.initList = [];
        this.list = [];
    }

    init() : void
    {
        for(let i = 0; i < this.size; i++)
        {
            let obj = cc.instantiate(this.prefab);
            this.initList[i] = obj;
            this.list[i] = obj;
        }

        this.idx = this.size - 1;
    }

    // 回到初始化状态
    reset() : void
    {
        for(let i = 0; i < this.size; i++)
        {
            let obj = this.initList[i];
            this.list[i] = obj;
            if(obj.active)
            {
                obj.active = false;
            }
            if(obj.parent)
            {
                // removeFromParent从父节点移除结点但不从内存释放，不同于destory
                obj.removeFromParent();
            }

            this.idx = this.size - 1;
        }
    }

    // 获取
    request() : cc.Node
    {
        if(this.idx < 0)
        {
            cc.log("no enough free item in pool.")
            return null;
        }

        let obj = this.list[this.idx--];

        if(obj)
        {
            obj.active = true;
        }
        return obj;
    }

    // 回收
    return(obj : cc.Node) : void
    {
        if(this.idx >= this.size - 1)
        {
            cc.log("can't return obj to a full pool");
            return;
        }

        obj.active = false;
        if(obj.parent)
        {
            obj.removeFromParent();
        }

        this.list[++this.idx] = obj;
    }
}

import NodePool from "./NodePool";
import {types} from "./Types";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PoolManage extends cc.Component {

    @property([NodePool])
    private enemyPools: NodePool[] = [];

    @property([NodePool])
    private projectilePools: NodePool[] = []; // 投掷物

    init() : void
    {
        for (let i = 0; i < this.enemyPools.length; i++) 
        {
            this.enemyPools[i].init();
        }

        for (let i = 0; i < this.projectilePools.length; i++) 
        {
            this.projectilePools[i].init();
        }
    }

    requestEnemy(type: types.EnemyType): cc.Node
    {
        let pool = this.enemyPools[type];
        return pool.request();
    }

    returnEnemy(type: types.EnemyType, obj: cc.Node) : void
    {
        let pool = this.enemyPools[type];
        pool.return(obj);
    }


    requestProjectile(type: types.ProjectileType): cc.Node
    {
        let pool = this.projectilePools[type];
        return pool.request();
    }

    returnProjectile(type: types.ProjectileType, obj: cc.Node) : void
    {
        let pool = this.projectilePools[type];
        pool.return(obj);
    }
}

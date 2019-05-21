const {ccclass, property} = cc._decorator;
import {types} from '../Types';
import PoolManage from '../PoolManage';

@ccclass('Spawner')
export default class Spawner
{
    @property({
        type: cc.Enum(types.EnemyType)
    })
    private enemyType: types.EnemyType = types.EnemyType.Enemy0;

    @property()
    total: number = 0;

    @property()
    spawnInterval: number = 0;

    @property()
    isCompany: boolean = false; // ?

    spawned: number = 0;
    //finished: boolean = false;

    constructor()
    {
        this.init();
    }

    init()
    {
        this.spawned = 0;
    }

    spawn(poolMng: PoolManage): cc.Node
    {
        if(this.spawned >= this.total)
        {
            return null;
        }
        let newEnemy = poolMng.requestEnemy(this.enemyType);
        if(newEnemy)
        {
            this.spawned += 1;
            return newEnemy;
        }
        else
        {
            return null;
        }
    }

    isFinished(): boolean
    {
        return this.spawned >= this.total;
    }
}
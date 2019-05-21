import Spawner from "./Spawner";
import {types} from '../Types'
import Game from "../Game";
import Player from "./Player";
import Enemy from "./Enemy";
import Projectile from "./Projectile";
import WaveProgress from "../UI/WaveProgress";

const {ccclass, property} = cc._decorator;

@ccclass('Wave')
class Wave
{
    @property([Spawner])
    spawners: Spawner[] = []

    @property({
        type: cc.Enum(types.BossType)
    })
    private bossType: types.BossType = types.BossType.Demon;

    totalEnemy: number;
    spawnIdx: number;

    init(): void
    {
        this.totalEnemy = 0;
        this.spawnIdx = 0;
        for (let i = 0; i < this.spawners.length; i++) 
        {
            if(!this.spawners[i].isCompany)
            {
                this.totalEnemy += this.spawners[i].total;
            }
        }
    }

    getNextSpawn(): Spawner
    {
        this.spawnIdx += 1;
        if(this.spawnIdx < this.spawners.length)
        {
            return this.spawners[this.spawnIdx];
        }
        else
        {
            return null;
        }
    }
}


@ccclass
export default class WaveManage extends cc.Component
{
    @property([Wave])
    waves: Wave[] = [];

    @property
    startWaveIdx: number = 0;

    @property
    private spawnMargin: number = 0;

    @property
    private _killedEnemy = 0;


    get killedEnemy()
    {
        return this._killedEnemy;
    }
    set killedEnemy(value)
    {
        this._killedEnemy = value;
        if(value >= this.waveTotalEnemy)
        {
            this.endWave();
        }
        let ratio = Math.min(this.killedEnemy / this.waveTotalEnemy, 1);
        this.waveProgress.updateProgress(ratio);

    }
    
    @property(WaveProgress)
    private waveProgress: WaveProgress = null;

    // @property(cc.Node)
    // bossProgress: cc.Node = null;

    game: Game = null;
    player: Player = null;
    enemyGroup: cc.Node = null;
    
    curWave: Wave = null;
    private waveIdx: number;

    curSpawn: Spawner = null;
    private spawnIdx: number;

    private waveTotalEnemy: number;


    init(game: Game)
    {
        this.game = game;
        this.player = game.player;
        this.enemyGroup = game.enemyGroup;
        
        this.waveIdx = this.startWaveIdx;
        this.spawnIdx = 0;
        this.curWave = this.waves[this.waveIdx];

        this.waveProgress.init();
    }

    startWave(): void
    {
        this.unschedule(this.spawnEnemy);
        this.curWave.init();

        this.waveTotalEnemy = this.curWave.totalEnemy;
        this.killedEnemy = 0;
        this.curSpawn = this.curWave.spawners[this.curWave.spawnIdx];
        //this.curSpawn.init();
        this.startSpawn();
        this.game.inGameUI.showWave(this.waveIdx + 1);
    }

    private startSpawn(): void
    {
        this.schedule(this.spawnEnemy, this.curSpawn.spawnInterval);
    }

    private spawnEnemy(): void
    {
        if(this.curSpawn.isFinished())
        {
            this.endSpawn();
            return;
        }

        let newEnemy = this.curSpawn.spawn(this.game.poolMng);
        if(newEnemy)
        {
            this.enemyGroup.addChild(newEnemy);
            newEnemy.setPosition(this.getNewPosition());
            let enemy: Enemy = newEnemy.getComponent('Enemy');
            enemy.init(this);
        }
    }

    private endSpawn(): void
    {
        this.unschedule(this.spawnEnemy);
        let nextSpawner: Spawner = this.curWave.getNextSpawn();
        if(nextSpawner)
        {
            this.curSpawn = nextSpawner;
            this.startSpawn();
            // if(nextSpawner.isCompany)
            // {
            //     // this.startBoss();
            // }
        }
    }

    private endWave(): void
    {
        // this.bossProgress.hide();
        // this.game.bossMng.endBoss();
        if(this.waveIdx < this.waves.length - 1)
        {
            this.curWave = this.waves[++this.waveIdx]
            this.startWave();
        }
        else
        {
            this.game.scheduleOnce(this.game.gameOver, 1);
        }
    }

    spawnProjectile(type: types.ProjectileType, pos: cc.Vec2, dir: cc.Vec2): void
    {
        let newProj = this.game.poolMng.requestProjectile(type);
        if(newProj)
        {
            this.enemyGroup.addChild(newProj);
            newProj.setPosition(pos);
            let proj: Projectile = newProj.getComponent("Projectile");
            proj.init(this, dir);
        }
        else
        {
            cc.log("projectile pool is full.")
        }
    }

    despawnEnemy(enemy: Enemy): void
    {
        this.game.poolMng.returnEnemy(enemy.enemyType, enemy.node);
    }

    despawnProjectile(proj: Projectile): void
    {
        this.game.poolMng.returnProjectile(proj.type, proj.node);
    }

    private getNewPosition(): cc.Vec2
    {
        let randX = (Math.random() - 0.5) * 2 * (this.enemyGroup.width - this.spawnMargin)/2;
        let randY = (Math.random() - 0.5) * 2 * (this.enemyGroup.height - this.spawnMargin)/2;
        return cc.v2(randX, randY);
    }

    killEnemy(): void
    {
        this.killedEnemy += 1;
    }


}
import Player from "./Actors/Player";
import PoolManage from "./PoolManage";
import WaveManage from "./Actors/WaveManage";
import PlayerFX from "./Render/PlayerFX";
import SortManage from "./SortManage";
import InGameUI from "./UI/InGameUI";
import GameOverUI from "./UI/GameOverUI";
import DeathUI from "./UI/DeathUI";
import Enemy from "./Actors/Enemy";
import Projectile from "./Actors/Projectile";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component 
{
    @property(Player)
    player: Player = null;

    @property(PlayerFX)
    playerFX: PlayerFX = null;

    @property(cc.Node)
    enemyGroup: cc.Node = null;

    @property(InGameUI)
    inGameUI: InGameUI = null;

    @property(DeathUI)
    deathUI: DeathUI = null;

    @property(GameOverUI)
    gameOverUI: GameOverUI = null;

    @property(cc.Animation)
    cameraRoot: cc.Animation = null;

    poolMng: PoolManage = null;
    waveMng: WaveManage = null;
    //bossMng: BossManage = null;
    sortMng: SortManage = null;

    onLoad(): void
    {
        this.player.init(this);
        this.player.node.active = false;

        this.playerFX.init(this);

        this.poolMng = this.getComponent("PoolManage");
        this.poolMng.init();
        
        this.waveMng = this.getComponent("WaveManage");
        this.waveMng.init(this);

        //this.bossMng =
        this.sortMng = this.enemyGroup.getComponent('SortManage');
        this.sortMng.init();
    }

    start(): void
    {
        this.playerFX.playIntro();
        this.inGameUI.init();
        this.deathUI.init(this);
        this.gameOverUI.init(this);
    }

    pauseSpawn(): void
    {
        let scheduler = cc.director.getScheduler();
        scheduler.pauseTarget(this.waveMng);
        this.sortMng.enabled = false;
    }

    pauseGame(): void
    {
        cc.director.pause();
    }

    resume(): void
    {
        let scheduler = cc.director.getScheduler();
        scheduler.resumeTarget(this.waveMng);
        this.sortMng.enabled = true;
    }

    death(): void
    {
        this.deathUI.show();
        this.pauseSpawn();
    }

    revive(): void
    {
        this.deathUI.hide();
        this.playerFX.playRevive();
        this.player.revive();
    }

    clearAllEnemy(): void
    {
        let nodeList = this.enemyGroup.children;
        for (let i = 0; i < nodeList.length; i++) 
        {
            let enemy: Enemy = nodeList[i].getComponent("Enemy");
            if(enemy)
            {
                enemy.dead();
                continue;
            }
            let proj: Projectile = nodeList[i].getComponent("Projectile");
            if(proj)
            {
                proj.broke();
            }
        }
    }

    playerReady(): void
    {
        this.resume();
        this.player.node.active = true;
        this.player.ready();
        this.waveMng.startWave();
    }

    playerReviveReady()
    {
        this.resume();
        this.player.node.active = true;
        this.player.ready();
    }

    gameOver(): void
    {
        this.gameOverUI.show();
    }

    restart(): void
    {
        cc.director.loadScene('PlayGame');
    }
}

import WaveManage from "./WaveManage";
import {types} from "../Types";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Projectile extends cc.Component
{
    @property({
        type: cc.Enum(types.ProjectileType)
    })
    type: types.ProjectileType = types.ProjectileType.Arrow;

    @property(cc.Sprite)
    private sprite: cc.Sprite = null;

    @property(cc.Animation)
    private fxBroken: cc.Animation = null;

    @property
    private moveSpeed: number = 0;

    @property
    private canBreak: boolean = true;
    

    private waveMng: WaveManage;
    private player: Player;
    private dir: cc.Vec2;
    private isMoving: boolean;

    init(mng: WaveManage, dir: cc.Vec2): void
    {
        this.waveMng = mng;
        this.player = this.waveMng.player;
        let deg = cc.misc.radiansToDegrees(cc.v2(0, 1).signAngle(dir));
        
        this.sprite.enabled = true;
        this.sprite.node.angle = deg;
        this.dir = dir;
        this.isMoving = true;
    }

    broke(): void
    {
        this.isMoving = false;
        this.sprite.enabled = false;
        this.fxBroken.node.active = true;
        this.fxBroken.play('arrow-break');
    }

    private hitPlayer(): void
    {
        this.isMoving = false;
        this.onBrokenFXFinished();
    }

    onBrokenFXFinished(): void
    {
        this.fxBroken.node.active = false;
        this.waveMng.despawnProjectile(this);
    }

    update(dt: number): void
    {
        if(!this.isMoving)
        {
            return;
        }

        let dist = this.player.node.position.sub(this.node.position).mag();
        if(dist < this.player.hurtRadius && this.player.isAlive)
        {
            if(this.canBreak && this.player.isAttacking)
            {
                this.broke();
                return;
            }
            else
            {
                this.hitPlayer();
                this.player.dead();
                return;
            }
        }

        this.node.x += this.moveSpeed * this.dir.x * dt;
        this.node.y += this.moveSpeed * this.dir.y * dt;
        if(Math.abs(this.node.x) > this.waveMng.enemyGroup.width / 2 ||
            Math.abs(this.node.y) > this.waveMng.enemyGroup.height / 2)
        {
            this.onBrokenFXFinished();
        }        
    }
}
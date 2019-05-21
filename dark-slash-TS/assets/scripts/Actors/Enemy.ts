const {ccclass, property} = cc._decorator;

import {types} from "../Types"
import Player from "./Player"
import Move from "./Move"
import WaveManage from "./WaveManage";

enum AttackType
{
    Melee,
    Range
}

@ccclass
export default class Enemy extends cc.Component 
{
    @property({type: cc.Enum(types.EnemyType)})
    enemyType: types.EnemyType = types.EnemyType.Enemy0;

    @property({type: cc.Enum(AttackType)})
    private atkType: AttackType = AttackType.Melee;

    @property({type: cc.Enum(types.ProjectileType)})
    private projectileType: types.ProjectileType = types.ProjectileType.Arrow;

    @property(cc.SpriteFrame)
    private sfAtkDirs: cc.SpriteFrame[] = [];

    @property(cc.ParticleSystem)
    private fxSmoke: cc.ParticleSystem = null;
    @property(cc.Animation)
    private fxBlood: cc.Animation = null;
    @property(cc.Animation)
    private fxBlade: cc.Animation = null;

    @property
    private hitPoint: number = 0;
    @property
    private hurtRadius: number = 0;
    @property
    private atkRange: number = 0;
    @property
    private atkDist: number = 0;
    @property
    private atkDuration: number = 0;
    @property
    private atkStun: number = 0;
    @property
    private atkPerpTime: number = 0;
    @property
    private corpseDuration: number = 0;

    private player: Player;
    private waveMng: WaveManage;

    private anim: cc.Animation;
    private spEnemy: cc.Sprite;

    private bloodDuration: number;
    // hitpouint: number;
    private isAlive: boolean;
    private isInvincible: boolean;
    private isAttacking: boolean;
    private isMoving: boolean;

    init(waveMng: WaveManage)
    {
        this.waveMng = waveMng;
        this.player = waveMng.player;

        let move: Move = this.getComponent('Move');
        this.anim = move.anim;
        this.spEnemy = this.anim.getComponent(cc.Sprite);

        this.bloodDuration = this.fxBlood.getAnimationState('blood').clip.duration;
        this.isAlive  = true;
        this.isInvincible = false;
        this.isAttacking = false;
        this.isMoving = false;
        // this.hp = this.hitPoint;
        this.fxBlood.node.active = false;
        this.fxBlade.node.active = false;

        if(this.anim.getAnimationState('born'))
        {
            this.anim.play('born');
        }
        else // need animhelper
        {
            this.ready();
        }

    }

    private ready()
    {
        // this.isAlive = true;
        this.isMoving = true;
        this.fxSmoke.resetSystem();
    }

    update(dt: number): void
    {
        if(!this.isAlive)
        {
            return;
        }

        let dirToPlayer = this.player.node.position.sub(this.node.position);
        let distToPlayer = dirToPlayer.mag();
        if(this.player.isAttacking && !this.isInvincible)
        {
            if(distToPlayer < this.hurtRadius)
            {
                this.dead();
                return;
            }
        }

        // if(!this.player.isAttacking && this.isAttacking && this.isAlive)
        if(this.isAttacking && this.isAlive)
        {
            if(distToPlayer < this.player.hurtRadius)
            {
                this.player.dead();
                return;
            }
        }

        if(this.player && this.isMoving)
        {
            //let deg = cc.misc.radiansToDegrees(cc.v2(0,1).signAngle(dirToPlayer));
            if(distToPlayer < this.atkRange)
            {
                this.prepAtk(dirToPlayer);
                return;
            }
            this.node.emit("update-dir", dirToPlayer.normalize());
        }
    }

    private prepAtk(dir: cc.Vec2): void
    {
        let animName = '';
        if(Math.abs(dir.x) >= Math.abs(dir.y))
        {
            animName = 'pre_atk_right';
        }
        else
        {
            if(dir.y > 0)
            {
                animName = 'pre_atk_up';
            } 
            else
            {
                animName = 'pre_atk_down';
            }
        }

        this.node.emit('freeze');
        this.anim.play(animName);
        this.isMoving = false;
        this.scheduleOnce(this.attack, this.atkPerpTime); // scheduleOnece无法带参数?
    }

    private attack(): void
    {
        if(this.isAlive == false)
        {
            // 攻击可能因死亡而中断
            return;
        }
        this.anim.stop();
        let atkDir = this.player.node.position.sub(this.node.position);

        let targetPos = null;
        if(this.atkType == AttackType.Melee)
        {
            targetPos = this.node.position.add(atkDir.normalize().mul(this.atkDist));
        }
        this.attackOnTarget(atkDir, targetPos);

    }
    
    private attackOnTarget(dir: cc.Vec2, targetPos: cc.Vec2): void
    {
        let deg = cc.misc.radiansToDegrees(cc.v2(0, 1).signAngle(dir));
        let absDeg = Math.abs(deg);

        this.anim.node.scaleX = deg <= 0 ? 1: -1;

        this.spEnemy.spriteFrame = this.getAtkSf(absDeg);
        let atkDelay = cc.delayTime(this.atkStun);
        let callback = cc.callFunc(this.onAtkFinished, this);

        if(this.atkType == AttackType.Melee)
        {
            let moveAction = cc.moveTo(this.atkDuration, targetPos).easing(cc.easeQuarticActionOut());
            this.node.runAction(cc.sequence(moveAction, atkDelay, callback));
            this.isAttacking = true;
        }
        else
        {
            if(this.projectileType == types.ProjectileType.None)
            {
                return;
            }

            this.waveMng.spawnProjectile(this.projectileType, this.node.position, dir.normalize());
            this.node.runAction(cc.sequence(atkDelay, callback));
        }
        
    }

    private getAtkSf(deg: number): cc.SpriteFrame
    {
        let angleDivider = [0, 45, 135, 180];
        let atkSf = null;
        for (let i = 0; i < angleDivider.length; i++) 
        {
            let left = angleDivider[i];
            let right = angleDivider[i + 1];
            if(deg <= right && deg > left)
            {
                atkSf = this.sfAtkDirs[i];
                return atkSf;
            }
        }

        if(atkSf == null)
        {
            cc.error('cannot find enemy atk sprite frame of deg: ' + deg);
            return null;
        }
    }
    

    private onAtkFinished(): void
    {
        this.isAttacking = false;
        if(this.isAlive)
        {
            this.isMoving = true;
        }
    }

    dead(): void
    {
        this.node.emit('freeze');

        this.isMoving = false;
        this.isAttacking = false;
        this.anim.play('dead');
        this.fxBlood.node.active = true;
        this.fxBlood.node.scaleX = this.anim.node.scaleX;
        this.fxBlood.play('blood');
        this.fxBlade.node.active = true;
        this.fxBlade.node.angle = (Math.random() - 0.5) * 80;
        this.fxBlade.play('blade');

        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
       // this.waveMng.hitEnemy();
        this.player.addKills();
    
        this.isAlive = false;
        this.scheduleOnce(this.corpse, this.bloodDuration);
        this.waveMng.killEnemy();
    }

    private corpse(): void
    {
        this.anim.play('corpse');
        this.fxBlood.node.active = false;
        this.scheduleOnce(this.recycle, this.corpseDuration);
    }

    private recycle(): void
    {
        this.waveMng.despawnEnemy(this);
    }
}
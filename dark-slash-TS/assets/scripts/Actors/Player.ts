import Game from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component 
{
    @property(cc.ParticleSystem)
    private fxTrail: cc.ParticleSystem = null;

    @property(cc.Node)
    private spArrow: cc.Node = null;

    @property(cc.SpriteFrame)
    private sfAtkDirs: cc.SpriteFrame[] = [];

    @property(cc.Vec2)
    private attachPoints: cc.Vec2[] = [];

    @property(cc.SpriteFrame)
    private sfPostAtks: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    private spPlayer: cc.Sprite = null;

    @property(cc.Sprite)
    private spSlash: cc.Sprite = null;

    @property
    hurtRadius: number = 0;
    
    @property // 判定发生hold的时间阈值
    private touchThreshold: number = 0;

    @property // 判定发生move的距离阈值
    private touchMoveThreshold: number = 0;

    @property
    private atkDist: number = 0;

    @property
    private atkDuration: number = 0;

    @property
    private atkStun: number = 0;

    @property
    private invincible: boolean = false;


    private game: Game;
    private inputEnabled: boolean;
    isAttacking: boolean;
    isAlive: boolean;
    private hasMoved: boolean;
    private nextPoseSF: cc.SpriteFrame;
    private atkTargetPos: cc.Vec2; // in node space
    private slashPos: cc.Vec2;
    private isAtkGoingOut: boolean; // 攻击是否超出移动范围
    private validAtkRect: cc.Rect; // 玩家移动范围
    private oneSlashKills: number;

    private touchBeganLoc: cc.Vec2;
    private moveToPos: cc.Vec2;
    private touchStartTime: number;
    private anim: cc.Animation;

    // start(): void // test
    // {
    //     this.init(null);
    //     this.ready();
    // }

    init(game: Game) : void
    {
        this.game = game;
        this.anim = this.getComponent('Move').anim;
        this.inputEnabled = false;
        this.isAttacking = false;
        this.isAlive = true;
        this.nextPoseSF = null;
        this.registerInput();
        this.spArrow.active = false;
        this.atkTargetPos = cc.v2(0,0);
        this.isAtkGoingOut = false;
        this.validAtkRect = cc.rect(25, 25, (this.node.parent.width - 50), (this.node.parent.height - 50));
        this.oneSlashKills = 0;
    }

    ready(): void
    {
        this.fxTrail.resetSystem();
        this.node.emit('stand');
        this.inputEnabled = true;
        this.isAlive = true;
    }

    private registerInput(): void
    {
        this.node.parent.on('touchstart', this.onTouchStart, this);
        this.node.parent.on('touchmove', this.onTouchMove, this);
        this.node.parent.on('touchend', this.onTouchEnd, this);
    }
    private onTouchStart(event: cc.Event.EventTouch):void
    {
        if(this.inputEnabled == false)
            return;

        let touchLoc = event.getLocation();
        this.touchBeganLoc = touchLoc;
        this.moveToPos = this.node.parent.convertToNodeSpaceAR(touchLoc);
        this.touchStartTime = Date.now();
    }

    private onTouchMove(event: cc.Event.EventTouch): void
    {
        if(this.inputEnabled == false)
            return;
        let touchLoc = event.getLocation();
        this.spArrow.active = true;
        this.moveToPos = this.node.parent.convertToNodeSpaceAR(touchLoc);
        if(this.touchBeganLoc.sub(touchLoc).mag() > this.touchMoveThreshold)
            this.hasMoved = true;
    }

    private onTouchEnd(event: cc.Event.EventTouch): void
    {
        if(this.inputEnabled == false)
            return;
        this.spArrow.active = false;
        this.moveToPos = null;
        this.node.emit('update-dir',null);

        let isHold = this.isTouchHold(); // 根据touch的duration判断是否长按
        if(!this.hasMoved && !isHold) // 非长按且非拖拽(即轻触)，则发动攻击
        {
            let touchLoc = event.getLocation();
            let atkPos = this.node.parent.convertToNodeSpaceAR(touchLoc);
            let atkDir = atkPos.sub(this.node.position);
            
            this.atkTargetPos = this.node.position.add(atkDir.normalize().mul(this.atkDist));
            let atkTartgetWorldPos = this.node.parent.convertToWorldSpaceAR(this.atkTargetPos);

            this.isAtkGoingOut = !this.validAtkRect.contains(atkTartgetWorldPos);
            this.node.emit('freeze');
            this.oneSlashKills = 0;
            this.attackOnTarget(atkDir);
        }
        this.hasMoved = false;
    }

    private isTouchHold(): boolean
    {
        let duration = Date.now() - this.touchStartTime;
        return duration >= this.touchThreshold;
    }

    // 根据攻击方向与x的夹角确定攻击动作的sprite frame(持剑角度不同)
    private getAtkSf(deg: number): cc.SpriteFrame
    {
        let angleDivider: number[] = [0, 12, 35, 56, 79, 101, 124, 146, 168, 180];
        let atkSf = null;
        for (let i = 0; i < angleDivider.length - 1; i++) 
        {
            let left = angleDivider[i];    
            let right = angleDivider[i + 1];    
            if(deg >= left && deg < right)
            {
                atkSf = this.sfAtkDirs[i];
                this.nextPoseSF = this.sfPostAtks[Math.floor(i / 3)]; // 结束攻击后需指定一个动作
                this.slashPos = this.attachPoints[i];
                return atkSf;
            }
        }

        cc.error('can not find a attack pos of deg: ' + deg);
        return null;
    }

    private attackOnTarget(atkDir: cc.Vec2/*, targetNodeSpacePos: cc.Vec2 */): void
    {
        // atkDir和y轴夹角
        let deg = cc.misc.radiansToDegrees(cc.v2(0,1).signAngle(atkDir));
        let absDeg = Math.abs(deg);
        console.log(deg);
        this.spPlayer.node.scaleX = (deg <= 0)? 1: -1;
        this.spPlayer.spriteFrame = this.getAtkSf(absDeg);

        // action
        let moveAct = cc.moveTo(this.atkDuration, this.atkTargetPos).easing(cc.easeQuinticActionOut());
        let delay = cc.delayTime(this.atkStun); // 硬直
        let callback = cc.callFunc(this.onAtkFinished, this);
    
        this.node.runAction(cc.sequence(moveAct, delay, callback));
        this.spSlash.enabled = true;
        this.spSlash.node.position = this.slashPos;
        this.spSlash.node.rotation = absDeg;
        this.spSlash.getComponent(cc.Animation).play("slash");

        this.inputEnabled = false;
        this.isAttacking = true;
    }

    private onAtkFinished()
    {
        if(this.nextPoseSF)
        this.spPlayer.spriteFrame = this.nextPoseSF;
        this.inputEnabled = true;
        this.isAttacking = false;
        this.isAtkGoingOut = true;
        this.spSlash.enabled = false;
        if(this.oneSlashKills >= 3)
        {
            this.game.inGameUI.showKills(this.oneSlashKills);
        }
    }

    private shouldStopAttacking(): boolean
    {
        let rect = this.validAtkRect;
        let curPos = this.node.parent.convertToNodeSpaceAR(this.node.position);
        let targetPos = this.node.parent.convertToNodeSpaceAR(this.atkTargetPos);

        if((curPos.x < rect.xMin && targetPos.x < rect.xMin) ||
            (curPos.x > rect.xMax && targetPos.x > rect.xMax) ||
            (curPos.y < rect.yMin && targetPos.y < rect.yMin) ||
            (curPos.y > rect.yMax && targetPos.y > rect.yMax))
        {
            return true;
        }

        return false;
    }

    update (dt: number): void 
    {
        if(this.isAlive == false)
            return;

        // 边界检测（玩家在攻击途中若越界，则停止攻击）
        if(this.isAttacking)
        {
            if(this.isAtkGoingOut && this.shouldStopAttacking())
            {
                this.node.stopAllActions();
                this.onAtkFinished();
            }
        }

        // move
        if(this.inputEnabled && this.moveToPos && this.isTouchHold())
        {
            let dir = this.moveToPos.sub(this.node.position);
            let deg = cc.misc.radiansToDegrees(cc.v2(0,1).signAngle(dir));
            this.spArrow.angle = deg;

            this.node.emit('update-dir', dir.normalize());
        }
    }

    addKills()
    {
        this.oneSlashKills += 1;
        this.game.inGameUI.doCombo();
    }

    revive()
    {
        // do nothing
    }

    dead(): void
    {
        if(this.invincible || !this.isAlive)
        {
            return;
        }
        this.isAlive = false;
        this.isAttacking = false;
        this.inputEnabled = false;

        this.node.emit('freeze');
        this.anim.play('dead');
    }

    corpse(): void
    {
        this.anim.play('corpse');
        this.scheduleOnce(this.death, 0.7);
    }

    private death(): void
    {
        this.game.death();
    }
}

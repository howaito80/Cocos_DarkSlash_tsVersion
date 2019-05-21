const {ccclass, property} = cc._decorator;
enum MoveState
{
    None,
    Idle,
    Up,
    Right,
    Down,
    Left
}

@ccclass
export default class Move extends cc.Component {

    @property
    private moveSpeed: number = 0;

    @property(cc.Animation)
    anim: cc.Animation = null;

    private state: MoveState;

    private moveDir: cc.Vec2 = null;

    onLoad(): void
    {
        this.moveDir = null;

        this.state = MoveState.Idle;

        this.node.on('stand', this.idle, this);
        this.node.on('freeze', this.stop, this)
        this.node.on('update-dir', this.updateDir, this);
        this.node.on('update-dir',this.updateDir, this);
    }

    private idle(): void
    {
        if(this.state != MoveState.Idle)
        {
            this.state = MoveState.Idle;
            this.anim.play("stand");
        }
    }


    private stop(): void
    {
        this.state = MoveState.None;
        this.moveDir = null;
        this.anim.stop();
    }

    private moveUp(): void
    {
        if (this.state != MoveState.Up) {
            this.anim.play('run_up');
            this.anim.node.scaleX = 1;
            this.state = MoveState.Up;
        }
    }

    private moveDown(): void
    {
        if (this.state != MoveState.Down) {
            this.anim.play('run_down');
            this.anim.node.scaleX = 1;
            this.state = MoveState.Down;
        }
    }

    private moveRight(): void
    {
        if (this.state != MoveState.Right) {
            this.anim.play('run_right');
            this.anim.node.scaleX = 1;
            this.state = MoveState.Right;
        }
    }

    private moveLeft(): void
    {
        if (this.state != MoveState.Left) {
            this.anim.play('run_right');
            this.anim.node.scaleX = -1;
            this.state = MoveState.Left;
        }
    }

    // 如果事件的监听者明确需要n个参数，但是发布者在emit时没有发送n个事件参数？
    private updateDir(dir: cc.Vec2): void
    {
        this.moveDir = dir;
    }

    update (dt: number): void
    {
        if (this.moveDir != null) 
        {
            this.node.x += this.moveSpeed * this.moveDir.x * dt;
            this.node.y += this.moveSpeed * this.moveDir.y * dt;
            let deg = cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x));
            if (deg >= 45 && deg < 135) 
            {
                this.moveUp();
            } 
            else if (deg >= 135 || deg < -135) 
            {
                this.moveLeft();
            } 
            else if (deg >= -45 && deg < 45) 
            {
                this.moveRight();
            }
            else
            {
                this.moveDown();
            }
        }
        else if (this.state != MoveState.None) 
        {
            this.idle();
        }
    }
}

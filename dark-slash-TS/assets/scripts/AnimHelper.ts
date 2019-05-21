const {ccclass, property} = cc._decorator;

@ccclass
export default class AnimHelper extends cc.Component 
{
    @property(cc.Component.EventHandler)
    private finishHandler: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    private fireHandler: cc.Component.EventHandler = null;

    @property(cc.ParticleSystem)
    private particle: cc.ParticleSystem = null;

    playParticle(): void
    {
        if(this.particle)
        {
            this.particle.resetSystem();
        }
    }

    fire(): void
    {
        cc.Component.EventHandler.emitEvents([this.fireHandler]);
    }

    finish(): void
    {
        cc.Component.EventHandler.emitEvents([this.finishHandler]);
    }
}

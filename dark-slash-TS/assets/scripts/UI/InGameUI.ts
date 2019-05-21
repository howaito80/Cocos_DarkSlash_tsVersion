const {ccclass, property} = cc._decorator;
import WaveUI from './WaveUI'
import KillDisplay from './KillDisplay';
import ComboDisplay from './ComboDisplay';
import Game from '../Game';

@ccclass
export default class InGameUI extends cc.Component
{
    @property(WaveUI)
    private waveUI: WaveUI = null;
    @property(KillDisplay)
    private killDisplay: KillDisplay = null;
    @property(ComboDisplay)
    private comboDisplay: ComboDisplay = null;

    init(): void
    {
        this.waveUI.node.active = false;
        this.killDisplay.node.active = false;
        this.comboDisplay.init();
    } 

    showWave(num: number): void
    {
        this.waveUI.node.active = true;
        this.waveUI.show(num);
    }

    showKills(num: number): void
    {
        this.killDisplay.showKills(num);
    }

    doCombo(): void
    {
        this.comboDisplay.doCombo();
    }

    


}
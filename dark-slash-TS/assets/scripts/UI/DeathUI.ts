import Game from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DeathUI extends cc.Component {

    private game: Game = null;

    init(game: Game): void
    {
        this.game = game;
        this.hide();
    }

    show(): void
    {
        this.node.setPosition(0,0);
    }

    hide(): void
    {
        this.node.x = 3000;
    }

    revive(): void
    {
        this.game.revive();
    }

    gameover()
    {
        this.game.gameOver();
    }
}

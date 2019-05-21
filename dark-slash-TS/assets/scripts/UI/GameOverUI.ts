import Game from "../Game";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOverUI extends cc.Component {

    private game: Game = null;

    init(game: Game): void
    {
        this.game = game;
        this.hide();
    }

    show () 
    {
        this.node.setPosition(0, 0);
    }

    hide () 
    {
        this.node.x = 3000;
    }

    restart () 
    {
        this.game.restart();
    }
}

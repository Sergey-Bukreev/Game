class Game {
    #settings = {
        gridSize:{
            width:4,
            height:4
        },
        googleJumpInterval: 2000
    }
    #gameStatus = "pending"
    #player1
    #player2
    #google
    #googleSetIntervalId
    #score = {
        1: {points : 0},
        2: {points : 0}
    }

    constructor() {}
    #createUnits() {
        const player1Position = new Position(
            Position.getNotCrossedPosition(
                [],
                this.#settings.gridSize.width,
                this.#settings.gridSize.height
            )
        )

        const player2Position = new Position(
            Position.getNotCrossedPosition(
                [player1Position],
                this.#settings.gridSize.width,
                this.#settings.gridSize.height
            )
        )

        this.#player1 = new Player(player1Position, 1)


        this.#player2 = new Player(player2Position, 2)
        //
        // const googlePosition = new Position(
        //     Position.getNotCrossedPosition(
        //         [player1Position, player2Position],
        //         this.#settings.gridSize.width,
        //         this.#settings.gridSize.height
        //     )
        // )
        const googlePosition = this.#moveGoogleToRandomPosition(true)

        this.#google = new Google(googlePosition)
    }
    #checkBorder (player, delta) {
        if ( delta.x) {
            return player.position.x + delta.x >this.#settings.gridSize.width || player.position.x + delta.x < 1
        }
        if(delta.y) {
            return player.position.y + delta.y >this.#settings.gridSize.height || player.position.y + delta.y < 1
        }
        return false
    }
    #checkOtherPlayer (movingPlayer, otherPlayer, delta) {
        if(delta.x) {
            return movingPlayer.position.x + delta.x === otherPlayer.position.x
        }
        if(delta.y) {
            return movingPlayer.position.y + delta.y === otherPlayer.position.y
        }
        return false
    }
    #checkGoogleCatching (player) {
        if(this.google.position.equal(player.position)) {
            this.#score[player.playerId].points++
            this.#moveGoogleToRandomPosition()
        }
    }
    #movePlayer (movingPlayer, otherPlayer, delta) {

        const isBorder = this.#checkBorder(movingPlayer, delta)
        const isOtherPlayer = this.#checkOtherPlayer(movingPlayer, otherPlayer, delta)
        if(isBorder || isOtherPlayer) {
            return
        }
        if ( delta.x) {
            movingPlayer.position.x = movingPlayer.position.x + delta.x
        } else {
            movingPlayer.position.y = movingPlayer.position.y + delta.y
        }


        this.#checkGoogleCatching(movingPlayer)
    }
    movePlayer1Right () {
       const  delta = {x:1}
        this.#movePlayer(this.#player1, this.#player2, delta)
        this.#checkGoogleCatching(this.#player1)
    }
    movePlayer1Left () {
        const delta = {x:-1}
        this.#movePlayer(this.#player1, this.#player2, delta)
        this.#checkGoogleCatching(this.#player1)
    }
    movePlayer2Right () {
       const  delta = {x:1}
        this.#movePlayer(this.#player2, this.#player1, delta)
        this.#checkGoogleCatching(this.#player2)
    }
    movePlayer2Left () {
        const delta = {x:-1}
        this.#movePlayer(this.#player2, this.#player1, delta)
        this.#checkGoogleCatching(this.#player2)
    }
    movePlayer1Down () {
        const delta = {y:1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }
    movePlayer1Up () {
        const delta = {y:-1}
        this.#movePlayer(this.#player1, this.#player2, delta)
    }
    movePlayer2Down () {
        const delta = {y:1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }
    movePlayer2Up () {
        const delta = {y:-1}
        this.#movePlayer(this.#player2, this.#player1, delta)
    }


    set settings(newSettings) {
       this.#settings = newSettings
    }
    get settings () {
       return this.#settings
    }
    get gameStatus () {
        return this.#gameStatus
    }
    get player1 () {
        return this.#player1
    }
    get player2 () {
        return this.#player2
    }
    get google () {
        return this.#google
    }
    get score () {
        return this.#score
    }
   async start () {
       if(this.#gameStatus === "pending") {
           this.#createUnits()
           this.#gameStatus = "in-process"
       }
       this.#RunGoogleJumpInterval()
    }
    async stop () {
        clearInterval(this.#googleSetIntervalId)
        this.#gameStatus = "finished"
    }
    #RunGoogleJumpInterval () {
       this.#googleSetIntervalId = setInterval(() => {
            this.#moveGoogleToRandomPosition()
        }, this.#settings.googleJumpInterval)
    }
    #moveGoogleToRandomPosition(excludeGoogle) {
        let notCrossedPosition = [this.player1.position, this.player2.position];
        if (!excludeGoogle) {
            notCrossedPosition.push(this.#google.position);
        }
        const newPosition = Position.getNotCrossedPosition(
            notCrossedPosition,
            this.#settings.gridSize.width,
            this.#settings.gridSize.height
        );
        return new Position(newPosition);
    }

}


class Unit {
    constructor(position) {
        this.position = position
    }
}
class Player extends Unit{
    constructor(position, playerId  ) {
        super(position)
        this.playerId = playerId
    }
}
class Google extends Unit {
    constructor(position) {
        super(position);
    }
}
class Position {
    constructor(obj) {
        this.x = obj.x
        this.y = obj.y
    }
    clone () {
        return new Position(this.x,  this.y)
    }
    equal (otherPosition) {
        return otherPosition.x === this.x && otherPosition.y === this.y
    }
    static getNotCrossedPosition (coordinates, maxX, maxY) {
        let x, y
        do {
            x = NumberUtil.getRandomNumber(maxX);
            y = NumberUtil.getRandomNumber(maxY);
        } while (coordinates.some((coord) => coord.x === x && coord.y === y));
        return {x, y}
    }
}
class NumberUtil {
   static getRandomNumber (max) {
        return Math.floor(1 + Math.random() * (max))

    }
}
module.exports = {
    Game,
    Player
}
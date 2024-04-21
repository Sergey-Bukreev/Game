    export class Game {
    #settings = {
        gridSize:{
            width:4,
            height:4
        },
        googleJumpInterval: 2000,
        pointsToWin:3
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

constructor(eventEmitter) {
        this.eventEmitter = eventEmitter
}
     #moveGoogleToRandomPosition(excludeGoogle) {
         let notCrossedPosition = [this.#player1.position, this.#player2.position];
         if (!excludeGoogle ) {
             notCrossedPosition.push(this.#google.position);
         }
         const newPosition = Position.getNotCrossedPosition(
             notCrossedPosition,
             this.#settings.gridSize.width,
             this.#settings.gridSize.height
         );
         this.eventEmitter.emit("unitChangePosition")

         return new Position(newPosition);
     }
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

        const googlePosition = this.#moveGoogleToRandomPosition(true)

        this.#google = new Google(googlePosition)
    }
     #checkBorder(player, delta) {
         const newPosition = player.position.clone();
         if (delta.x) {
             newPosition.x += delta.x;
             if (newPosition.x < 1 || newPosition.x > this.#settings.gridSize.width) {
                 return true; // Если игрок выходит за пределы по ширине
             }
         }
         if (delta.y) {
             newPosition.y += delta.y;
             if (newPosition.y < 1 || newPosition.y > this.#settings.gridSize.height) {
                 return true; // Если игрок выходит за пределы по высоте
             }
         }
         return false;
     }
    #checkOtherPlayer (movingPlayer, otherPlayer, delta) {
       const newPosition = movingPlayer.position.clone()
        if(delta.x) newPosition.x += delta.x
        if(delta.y) newPosition.y += delta.y

        return otherPlayer.position.equal(newPosition)
    }

     #checkGoogleCatching(player) {
         if(this.#google.position.equal(player.position)) {
             this.#score[player.playerId].points++;
             if(this.#score[player.playerId].points === this.#settings.pointsToWin) {
                 this.#finish();
                 this.#google.position = new Position({
                     x: this.#settings.gridSize.width + 1,
                     y: this.#settings.gridSize.height + 1
                 });
             } else {
                 let newPosition;
                 do {
                     newPosition = this.#moveGoogleToRandomPosition();
                 } while (newPosition.equal(this.#player1.position) || newPosition.equal(this.#player2.position));
                 this.#google.position = newPosition;
             }
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
        this.eventEmitter.emit("unitChangePosition")
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
       this.#settings = {...this.#settings, newSettings}
        this.#settings.gridSize = newSettings.gridSize
            ? {...this.#settings.gridSize, ...newSettings.gridSize}
            : this.#settings.gridSize
    }
    async getSettings () {
       return this.#settings
    }
    async getGameStatus () {
        return this.#gameStatus
    }
    async getPlayer1 () {
        return this.#player1
    }
    async getPlayer2 () {
        return this.#player2
    }
    async getGoogle () {
        return this.#google
    }
    async getScore () {
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
        this.#gameStatus = "stoped"
    }
    async #finish () {
        clearInterval(this.#googleSetIntervalId)
        this.#gameStatus = "finished"
    }

     #RunGoogleJumpInterval() {
         this.#googleSetIntervalId = setInterval(() => {
             this.#google.position = this.#moveGoogleToRandomPosition();
             this.eventEmitter.emit("unitChangePosition");
         }, this.#settings.googleJumpInterval);

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
        return new Position({x:this.x,  y:this.y})
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
        return new Position({ x, y })
    }
}
class NumberUtil {
   static getRandomNumber (max) {
        return Math.floor(1 + Math.random() * (max))

    }
}
// module.exports = {
//     Game,
//     Player
// }
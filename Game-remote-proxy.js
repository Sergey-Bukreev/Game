export class GameRemoteProxy {

    ws () {

        }
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter
        this.ws = null

    }




    movePlayer1Right () {

    }
    movePlayer1Left () {

    }
    movePlayer2Right () {

    }
    movePlayer2Left () {

    }
    movePlayer1Down () {

    }
    movePlayer1Up () {
    this.ws.send("hello from front")
    }
    movePlayer2Down () {

    }
    movePlayer2Up () {

    }


    set settings(newSettings) {

    }
   async getSettings () {

     return   this.api.send("getSettings")
    }
   async getGameStatus () {

      return  this.api.send("getGameStatus")
    }
   async getPlayer1 () {

      return  this.api.send("getPlayer1")
    }
    async getPlayer2 () {

      return   this.api.send("getPlayer2")
    }
    async getGoogle () {

       return  this.api.send("getGoogle")
    }
   async getScore () {

      return  this.api.send("getScore")
    }
    async start () {
        this.ws = new WebSocket("ws://localhost:8080")
        this.api = new Api(this.ws)                                 // todo move to  DI

        this.ws.addEventListener("message", (wsEvent) => {
            const message = JSON.parse(wsEvent.data)
            if(message.type !== "event") return

            this.eventEmitter.emit(message.eventName)

        })

        return new Promise((resolve)=> {
            this.ws.addEventListener("open", resolve)
        })


    }
    async stop () {

    }

}

class Api {
    constructor(ws) {
        this.ws = ws
        this.ws.addEventListener("message", (event)=> {
           const resultAction = JSON.parse(event.data)
            if(this.resolvers[resultAction.procedure]
                && this.resolvers[resultAction.procedure].length >0
            ) {
                this.resolvers[resultAction.procedure].shift()(resultAction.result)
            }
        })

        this.resolvers = {
            // "procedureName" : [resolver]
        }
    }
    send (procedureName) {
        return new Promise((res)=> {

            this.ws.send(JSON.stringify({
                procedure : procedureName
            }));

            if(!this.resolvers[procedureName]) {
                this.resolvers[procedureName] = []
            }
            this.resolvers[procedureName].push(res)
        })


    }
}
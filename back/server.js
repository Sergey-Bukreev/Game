import {WebSocket, WebSocketServer} from "ws";
import {EventEmitter} from "../eventEmitter/EventEmitter.js";
import { Game} from "../Game.js";

const eventEmitter = new EventEmitter()
const game = new Game(eventEmitter)

game.start()


const wsServer = new WebSocketServer({port: 8080})

wsServer.on("connection", function connection(tunnel) {

    game.eventEmitter.subscribe("unitChangePosition", ()=> {

        const message = {
            type: "event",
            eventName: "unitChangePosition"
        }
        tunnel.send(JSON.stringify(message))
    })

    tunnel.on("message", async function message(data) {
        const action = JSON.parse(data)
        const result = await game[action.procedure]()

        const response = {
         procedure : action.procedure,
            result: result,
            type:"response"
        }

        tunnel.send(JSON.stringify(response))
    })


})



import {GameRemoteProxy as Game} from "./Game-remote-proxy.js";
import {EventEmitter} from "./eventEmitter/EventEmitter.js";

const asyncStart = async () => {

    const eventEmitter = new EventEmitter()
    const game = new Game(eventEmitter)

    await game.start()


    const tableElement = document.querySelector("#grid")
    const scoreElement = document.querySelector("#score")


    const render = async () => {
        tableElement.innerHTML = ""
        scoreElement.innerHTML = ""


        const   [score,
                settings,
                google,
                player1,
                player2
                ] = await Promise.all([
            game.getScore(),
            game.getSettings(),
            game.getGoogle(),
            game.getPlayer1(),
            game.getPlayer2()
        ]);
        // const score = await game.getScore()
        // const settings = await  game.getSettings()
        // const google = await game.getGoogle()
        // const player1 = await game.getPlayer1()
        // const player2 = await game.getPlayer2()


        scoreElement.append(`player1:${score[1].points} - player2:${score[2].points}`)

        for(let y = 1; y <= settings.gridSize.height; y++) {
            const trElement = document.createElement("tr")

            for(let x = 1; x <= settings.gridSize.width; x++) {
                const tdElement = document.createElement("td")


                if(google.position.x === x && google.position.y === y) {
                    const googleElement = document.createElement("img")
                    googleElement.src = "./assets/google.png"
                    tdElement.appendChild(googleElement)

                }

                if(player1.position.x === x && player1.position.y=== y) {
                    const player1Element = document.createElement("img")
                    player1Element.src = "./assets/player1.jpeg"
                    tdElement.appendChild(player1Element)
                }

                if(player2.position.x === x && player2.position.y === y) {
                    const player2Element = document.createElement("img")
                    player2Element.src = "./assets/player2.jpeg"
                    tdElement.appendChild(player2Element)


                }
                trElement.appendChild(tdElement)
            }
            tableElement.appendChild(trElement)

        }



    }


    window.addEventListener("keydown", (event) => {
        switch (event.code) {
            case "ArrowUp":
                game.movePlayer1Up()
                break
            case "ArrowDown":
                game.movePlayer1Down()
                break

            case "ArrowRight":
                game.movePlayer1Right()
                break
            case "ArrowLeft":
                game.movePlayer1Left()
                break
            case "KeyW":
                game.movePlayer2Up()
                break
            case "KeyS":
                game.movePlayer2Down()
                break

            case "KeyD":
                game.movePlayer2Right()
                break
            case "KeyA":
                game.movePlayer2Left()
                break
        }
    })

    game.eventEmitter.on("unitChangePosition", ()=> {

        render()
    })

    render()

}
asyncStart()


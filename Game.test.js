const {Game} = require("./Game")

describe ("game test", ()=> {
    test("init test", ()=> {
        const game = new Game()
        game.settings = {
            gridSize:{
                width:4,
                height:5
            }
        }
        expect(game.settings.gridSize.width).toBe(4)
        expect(game.settings.gridSize.height).toBe(5)

    })
    test ("star game", ()=> {
        const game = new Game()
        game.settings = {
            gridSize:{
                width:4,
                height:5
            }
        }

        expect(game.gameStatus).toBe("pending")
        game.start()
        expect(game.gameStatus).toBe("in-process")
    })
    test ("player1 and player2 should be have unique position", ()=> {
        const game = new Game()
        game.settings = {
            gridSize:{
                width:1,
                height:3
            }
        }
        game.start()

        console.log("GAME", game.player1)
        console.log("GAME", game.player2)
        console.log("GAME", game.google)
        expect([1]).toContain(game.player1.position.x)
        expect([1, 2, 3]).toContain(game.player1.position.y)

        expect([1]).toContain(game.player2.position.x)
        expect([1, 2, 3]).toContain(game.player2.position.y)

        expect([1]).toContain(game.google.position.x)
        expect([1, 2, 3]).toContain(game.google.position.y)

        expect(
             game.google.position.x !== game.player1.position.x ||
            (game.google.position.y !== game.player1.position.y &&
                game.google.position.x !== game.player2.position.x
            ) || game.google.position.y !== game.player2.position.y &&
            (game.player1.position.x !== game.player2.position.x ||
                game.player1.position.y !== game.player2.position.y
            )
        )
    })

})

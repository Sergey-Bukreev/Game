const {Game} = require("./Game")


describe ("game test", ()=> {
   let game
    beforeEach(()=> {

     game = new Game()
    })
    afterEach(async ()=>{
        await game.stop()
    })

    test("init test", ()=> {

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

    test("Check Google position after change", async () => {

        game.settings = {
            gridSize:{
                width:4,
                height:4
            },
            googleJumpInterval: 100
        }
        await game.start()
        const prevPosition = game.google.position.clone()

        await sleep(150)

        console.log(game.google.position)
        // Проверкаа что позиции изменились
        expect(game.google.position).not.toEqual(prevPosition)
        // Проверка нашего метода equal
        expect(game.google.position.equal(prevPosition)).toBe(false)


    })

    test("catch Google by player1 or player2 for one row", async () => {
        game.settings = {
            gridSize:{
                width: 4,
                height:4
            },
            pointsToWin: 3
        };
        await game.start();

        const prevPosition = game.google.position.clone();
        const deltaForPlayer1 = game.google.position.x - game.player1.position.x;
        const deltaForPlayer2 = game.google.position.x - game.player2.position.x;

        if (Math.abs(deltaForPlayer1) <= 1 && Math.abs(deltaForPlayer2) <= 1) {
            // Если Google на одной линии с обоими игроками
            if (Math.abs(deltaForPlayer1) < Math.abs(deltaForPlayer2)) {
                // Если игрок 1 ближе к Google, чем игрок 2
                if (deltaForPlayer1 > 0) game.movePlayer1Right();
                else game.movePlayer1Left();
            } else if (Math.abs(deltaForPlayer1) > Math.abs(deltaForPlayer2)) {
                // Если игрок 2 ближе к Google, чем игрок 1
                if (deltaForPlayer2 > 0) game.movePlayer2Right();
                else game.movePlayer2Left();
            } else {
                // Если оба игрока находятся на одинаковом расстоянии от Google по оси X
                // Мы можем выбрать любого игрока для перемещения
                if (deltaForPlayer1 > 0) game.movePlayer1Right();
                else game.movePlayer1Left();
            }
        } else {
            // Если Google не находится на одной линии с обоими игроками
            // Тут не должен поймать Google ни один из игроков
            expect(game.score[1].points).toBe(0);
            expect(game.score[2].points).toBe(0);
        }

        // Проверяем, что позиция Google изменилась после попытки поймать его
        expect(game.google.position.equal(prevPosition)).toBe(false);
    });

    test("check player1 or player2 won", async () => {
        game.settings = {
            gridSize:{
                width: 3,
                height: 1
            },
        };
        await game.start();

        const prevPosition = game.google.position.clone();
        const deltaForPlayer1 = game.google.position.x - game.player1.position.x;
        const deltaForPlayer2 = game.google.position.x - game.player2.position.x;

        if (Math.abs(deltaForPlayer1) <= 1 && Math.abs(deltaForPlayer2) <= 1) {
            // Если Google на одной линии с обоими игроками
            if (Math.abs(deltaForPlayer1) < Math.abs(deltaForPlayer2)) {
                await movePlayerTowardsGoogle(game, deltaForPlayer1, game.movePlayer1Left.bind(game), game.movePlayer1Right.bind(game));
                // Проверяем что первый игрок победил и игра закончилась
                expect(game.score[1].points).toBe(3);
                expect(game.score[2].points).toBe(0);
                expect(game.gameStatus).toBe("finished");
            } else if (Math.abs(deltaForPlayer1) > Math.abs(deltaForPlayer2)) {
                await movePlayerTowardsGoogle(game, deltaForPlayer2, game.movePlayer2Left.bind(game), game.movePlayer2Right.bind(game));
                // Проверяем что второй игрок победил и игра закончилась
                expect(game.score[1].points).toBe(0);
                expect(game.score[2].points).toBe(3);
                expect(game.gameStatus).toBe("finished");
            } else {
                // Если оба игрока находятся на одинаковом расстоянии от Google по оси X
                // Мы можем выбрать любого игрока для перемещения
                await movePlayerTowardsGoogle(game, deltaForPlayer1, game.movePlayer1Left.bind(game), game.movePlayer1Right.bind(game));
            }
        } else {
            // Если Google не находится на одной линии с обоими игроками
            // Тут не должен поймать Google ни один из игроков
            expect(game.score[1].points).toBe(0);
            expect(game.score[2].points).toBe(0);
        }

        // Проверяем, что позиция Google изменилась после попытки поймать его
        expect(game.google.position.equal(prevPosition)).toBe(false);
    });



})
function sleep (delay) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

async function movePlayerTowardsGoogle(game, delta, moveLeft, moveRight) {
    if (delta > 0) {
        await moveRight();
        await moveLeft();
        await moveRight();
    } else {
        await moveLeft();
        await moveRight();
        await moveLeft();
    }
}
function random(min,max) {
    var num = Math.floor(Math.random()*(max-min)) + min;
    return num;
}

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

const width = canvas.width;
const height = canvas.height;

const smak = document.querySelector('#smak');
smak.volume = 0.99
const music = document.querySelector('#music');
music.volume = 0.25
const zle = document.querySelector('#zle');
zle.volume = 0.30

let score = 0 
let lifes = 3
let gov = false
let mainPrIsRuning = false
let stormFr = 0
let multipler = 1
let gameStart = false
let cryAnimation = null
let cry1
let cry2

//HERO OBJECT
const hero = {
    width: 80,
    height: 120,
    speed: 9,
    open: false
}
hero['position'] = width / 2 - hero.width / 2

//handling keys & moving hero
document.addEventListener("keydown",keyHandler);
document.addEventListener("keyup",keyHandler);

var keyState = {};

function keyHandler(e){
    keyState[e.code] = e.type
}

function moveHero(){
    if (!gov){
        if(keyState.ArrowRight == 'keydown'){
            hero.position += hero.speed;
        }
        else if(keyState.ArrowLeft == 'keydown'){
            hero.position -= hero.speed;
        }
        if(hero.position >= width){
            hero.position = 1
        }else if(hero.position <= 0 - hero.width){
            hero.position = width - 1
        }
        setTimeout(() => moveHero(), 15)
    }    
}

//burger constructor
class Burger {
    constructor(id, positionX, speed){
        this.id = id,
        this.positionX = positionX,
        this.speed = speed,
        this.positionY = 0,
        this.width = 56,
        this.height = 44
        
    }
    get _positionY() {
        return this.positionY;
    }
    get _speed() {
        return this.speed;
    }
    set newPosition(pos){
        this.positionY = pos
    }
}

let burgers = []

function closeHero(){
    hero.open = false
}

//game process
function mainProcess(){
    mainPrIsRuning = true
    //burger creation
    function burgerStorm(id){
            let burger = new Burger(
                id,
                random(5, width - 60),
                random(5, 8)
            )
            burgers.push(burger);
            if(burgers.length % 10 == 0){
                stormFr += 50
            }
        //burger move
        function move(){
            if(burger.positionY < height - burger.height - 20){
                burger.newPosition = burger._positionY + burger._speed
                setTimeout(() => move(), 15)
            }else{
                if(burger.id !== null){
                    lifes -= 1
                    zle.play()
                    if (lifes == 0 ){
                        gameOver()
                    }
                }
            }
            //burger colect
            if(burger.positionY >= height - hero.height - burger.height - 20
                && burger.positionY < height - burger.height - 20 
                && burger.positionX >= hero.position - burger.width
                && burger.positionX <= hero.position + hero.width){
                    if(burger.id !== null){
                        smak.play()
                        score += 1 * multipler
                        if(score == 10){
                            multipler +=1
                        }
                        if(score == 50){
                            multipler +=1
                        }
                        if(score == 149){
                            multipler +=2
                        }
                    }
                    burger.id = null
                    hero.open = true;
                    setTimeout(()=>{
                        hero.open = false
                    }, 300)
            }
            //gameover burger remove
            burgers.forEach(burger => {
                if(burger.positionY < height - burger.height - 20 && gov){
                    burger.id = null
                }
            })
        }
        requestAnimationFrame(move);
        if (gov == false ){
           storm = setTimeout (()=> {burgerStorm(id + 1)}, 900 - stormFr)
        }
    }
    burgerStorm(0)
    mainPrIsRuning = false
}
function gameOver(){
    console.log('gameover')
    clearTimeout(storm)
    gov = true

    function resetL(){
        if(keyState.Enter == 'keydown'){
            restart()
            document.removeEventListener('keydown', resetL)
        }
    }
    document.addEventListener('keydown', resetL);

    function cryAnim(frame){
        cryAnimation = frame
        if (cryAnimation < 2){
            cry1 = setTimeout (()=> {(cryAnim(frame + 1))}, 50)
        }else{
            cry2 = setTimeout (()=> {(cryAnim(0))}, 50)
        }
    }
    cryAnim(0) 
}
//game start
 function startGame(){
    gameStart = true
    mainProcess()
    moveHero()
    music.play()
    music.loop = true
}
function startL(){
    if(keyState.Enter == 'keydown'){
        startGame()
        document.removeEventListener('keydown', startL)
    }
}
document.addEventListener('keydown', startL); 

//restart
function restart(){
    if(gov){
        stormFr = 0
        multipler = 1
        score = 0 
        lifes = 3
        gov = false
        burgers = []
        hero.position = width / 2 - hero.width / 2
        clearTimeout(cry1)
        clearTimeout(cry2)
        cryAnimation = null

        mainProcess()
        moveHero()
    }   
}

//drawing
let heroSprite = new Image();
heroSprite.src = './img/arhn_close.png';

let heroSpriteOpen = new Image();
heroSpriteOpen.src = './img/arhn_open.png';

let burgerSprite = new Image();
burgerSprite.src = './img/burger.png';

let cryStrip = new Image();
cryStrip.src = './img/sad.png';

let font = new FontFace('Pixel', 'url(./rainyhearts.ttf)')

function draw(){
    ctx.clearRect (0, 0, width, height )
    if (gov){
        drawGameOver()
    }
    if (!gameStart){
        drawStartScreen()
    }
    //draw hero
    if (cryAnimation ==null){
        if (hero.open == false){
            heroSprite.onload = function() {
                ctx.drawImage(heroSprite, hero.position, height - hero.height - 20);
            }
            ctx.drawImage(heroSprite, hero.position, height - hero.height - 20);
        }else{
            heroSpriteOpen.onload = function() {
                ctx.drawImage(heroSpriteOpen, hero.position, height - hero.height - 20);
            }
            ctx.drawImage(heroSpriteOpen, hero.position, height - hero.height - 20);
        }
    }
    //draw burger
    burgers.forEach(burger => {
        burgerSprite.onload = function() {
            ctx.drawImage(burgerSprite, burger.positionX, burger.positionY);
        }
        if (burger.id !== null){
        ctx.drawImage(burgerSprite, burger.positionX, burger.positionY);
        }
    });
    drawScore()
    requestAnimationFrame(draw)
}
function drawStartScreen(){
    let title = new Image();
    title.src = './img/title.png'
    title.onload = function(){
        ctx.drawImage(title, 70, 50)
    }
    ctx.drawImage(title, 70, 50)

    font.load().then(function() {
        document.fonts.add(font)

        ctx.shadowColor = 'black';
        
        ctx.fillStyle = 'yellow';
        ctx.font = '30px Pixel';
        ctx.fillText('Press enter to start!', 225, 235);

        ctx.shadowBlur = 2
        
        ctx.fillStyle = 'white';
        ctx.font = '21px Pixel';
        ctx.fillText('2021 Lil Chef web entertainment', 410, height - 20);
        

        ctx.fillStyle = 'white';
        ctx.font = '17px Pixel';
        ctx.fillText('Music: Chip Jockey', 20, height - 40);

        ctx.fillStyle = 'white';
        ctx.font = '18px Pixel';
        ctx.fillText('Voice: Dark Archon', 20, height - 20);
        
        ctx.shadowBlur = 0
    });
}
function drawScore(){
    if(gameStart){
        font.load().then(function() {
            document.fonts.add(font)
            ctx.fillStyle = 'yellow';
            ctx.font = '40px Pixel';
            ctx.fillText('Score: ' + score , width - 180, 40);

            ctx.fillStyle = 'orange';
            ctx.font = '40px Pixel';
            ctx.fillText('Multi: x' + multipler, width - 180, 80);
        });
    }
}
function drawGameOver(){
    font.load().then(function() {
        document.fonts.add(font)
        ctx.fillStyle = 'red';
        ctx.font = '70px Pixel';
        ctx.fillText('Game Over', 200, 170);

        ctx.fillStyle = 'yellow';
        ctx.font = '30px Pixel';
        ctx.fillText('Press enter to try again!', 185, 210);
    });
    cryStrip.onload = function(){
        if(cryAnimation !== null){
            ctx.drawImage(cryStrip, 0, cryAnimation * 120, 80, 120, hero.position, height - hero.height - 20, 80, 120)
        }
    }
    if(cryAnimation !== null){
        ctx.drawImage(cryStrip, 0, cryAnimation * 120, 80, 120, hero.position, height - hero.height - 20, 80, 120)
    }

}

draw();
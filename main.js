import './style.css'
import Phaser from 'phaser'

const canvasSize = {
  width: 500,
  height: 500
}

const speedDown = 200
const gameDuration = 30000

//query selectors
const gameStartDiv = document.querySelector("#game-start-section")
const gameStartBtn = document.querySelector("#game-start")
const gameEndDiv = document.querySelector("#game-end-section")
const gameEndStatus = document.querySelector("#gameEndStatus")
const gameEndScore = document.querySelector("#gameEndScore")

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game")
    this.player
    this.cursor
    this.playerSpeed = speedDown + 50
    this.target
    this.points = 0
    this.timedEvent
    this.remainingTime
    this.textScore
    this.textTime
    this.coinMusic
    this.bgMusic
    this.emitter
  }
 // preload assets

 preload() {
  this.load.image("bg", "/assets/bg.png")
  this.load.image('basket', '/assets/basket.png')
  this.load.image('apple', '/assets/apple.png')
  this.load.image('money', '/assets/coin.png')
  this.load.audio('bgMusic', '/assets/bgMusic.mp3')
  this.load.audio('coinNoise', '/assets/coin.m4a')
 }
 create() {
  //pause until game starts
  this.scene.pause('scene-game')
  
  //background Image
  this.add.image(0,0, "bg").setOrigin(0,0)

  //background noise
  this.coinMusic = this.sound.add('coinNoise')
  this.bgMusic = this.sound.add('bgMusic')
  this.bgMusic.play()

  // define player
  const player = this.physics.add.image(0,canvasSize.height - 100, 'basket').setOrigin(0,0)
  player.setDisplaySize(100, 100);
  player.setImmovable(true)
  player.body.allowGravity = false
  player.setCollideWorldBounds(true)

  this.player = player

  //define apple falling
  const apple = this.physics.add.image(0,0, 'apple').setOrigin(0,0)
  apple.setDisplaySize(50, 50);
  apple.setMaxVelocity(0, speedDown)
  this.target = apple


  this.physics.add.overlap(this.target, this.player, this.targetHit, null, this)
  this.cursor = this.input.keyboard.createCursorKeys()

  // game duration
  this.timedEvent = this.time.delayedCall(gameDuration, this.gameOver, [], this)

  this.textScore = this.add.text(canvasSize.width - 120, 10, "Score: 0", {
    font: "25px Arial",
    fill: "#000000",
  })

  this.textTime = this.add.text(canvasSize.width - 120, 40, "Time: 300", {
    font: "25px Arial",
    fill: "#000000",
  })

  // money
  this.emitter = this.add.particles(0,0, "money", {
    speed: 100,
    gravityY: speedDown - 200,
    scale: .4,
    duration: 100,
    emitting: false
  })
  console.log({width: this.player.width, height: this.player.height })
  this.emitter.startFollow(this.player, 50, 50, true)



 }
 update() {
  this.remainingTime = this.timedEvent.getRemainingSeconds()
  this.textTime.setText(`Time: ${Math.round(this.remainingTime).toString()}`)

  if (this.target.y >= canvasSize.height) {
    this.target.setY(0);
    this.target.setX(this.getRandomX())
  }
  const {left, right} = this.cursor

  if (left.isDown) {
    this.player.setVelocityX(-this.playerSpeed)
  } else if (right.isDown) {
    this.player.setVelocityX(this.playerSpeed)
  } else {
    this.player.setVelocityX(0)
  }
 }
  getRandomX() {
    return Math.floor(Math.random() * 480)
  }

  targetHit() {
    this.coinMusic.play()
    this.emitter.start()
    this.target.setY(0);
    this.target.setX(this.getRandomX())
    this.points++
    this.textScore.setText(`Score: ${this.points}`)
  }

  gameOver() {
    this.sys.game.destroy(true)
    gameEndScore.textContent = this.points
    gameEndStatus.textContent = this.points >= 10 ? 'Win!' : 'Lose!'
    gameEndDiv.style.display = 'flex'
  }
}

const config = {
  type: Phaser.WEBGL,
  width: canvasSize.width,
  height: canvasSize.height,
  canvas: gameCanvas,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {y: speedDown}
    }
  },
  scene: [GameScene],
  autoFocus: false,
  pauseOnBlur: true,
  autoStart: false
}

const game = new Phaser.Game(config)

gameCanvas.style.display = "none";

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none"
  gameCanvas.style.display = "block";
  game.scene.resume("scene-game")
})
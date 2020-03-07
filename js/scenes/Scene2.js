var highscore = 0;
var highscoretext;
var map;
var world;
var setVelocityX;
var enemy1;
var player;
var spikeLayer, plantsLayer, signLayer;
var explodeSound;
var coinSound;
var soundSample, jumpSound, enemySound;
var cursors;
var groundLayer, coinLayer, enemyLayer,boxleftLayer, boxrightLayer;
var text;
var text2;
var Scoretext, Worldtext, leveltext ,Worldtext2;
var score = 0;
var timetext, time2text, life2text, lifetext;
var timedEvent, enemytimedEvent, enemytimedEvent2;
class Scene2 extends Phaser.Scene{
  constructor(){
    super("playGame");
    // this function will be called when the player touches a coin
  }
  preload() {
      // map made with Tiled in JSON format
      this.load.tilemapTiledJSON('map', 'assets/map/map.json');
      // tiles in spritesheet 
      this.load.spritesheet('tiles', 'assets/images/tiles.png', {frameWidth: 50, frameHeight: 50});
      // simple coin image
      this.load.image('coin', 'assets/images/coinGold.png');
      this.load.image('bomb', 'assets/images/bomb.png');
      this.load.image('spikes', 'assets/images/spikes.png');
      this.load.image('plants', 'assets/images/plants.png');
      this.load.image('signRight', 'assets/images/signRight.png');
      this.load.image('bg_grasslands', 'assets/images/bg_grasslands.png');
      this.load.image('mad', 'assets/images/mad.png');
      this.load.image('box', 'assets/images/box.png');
      this.load.image('player1', 'assets/images/player.png');
      this.load.image('small_player', 'assets/images/small_player.png');
      // player animations
      this.load.atlas('player', 'assets/sprites/player.png', 'assets/sprites/player.json');
      this.load.audio('coin', 'assets/sounds/coin.mp3');
      this.load.audio('main', 'assets/sounds/level1.mp3');
      this.load.audio('explosion', 'assets/sounds/explosion.mp3');
      this.load.audio('jump', 'assets/sounds/jump.wav');
      this.load.audio('enemysound', 'assets/sounds/enemy.wav');
  }
  create() {
    // load the map 
    
    map_counter =1;
    world = 1;
    var bg_grass = this.add.image(config.width/2, config.height/2, 'bg_grasslands');
    
    enemy1 = this.physics.add.image(2020, 420, 'mad');
    enemy1.body.setVelocityX(-100);
    jumpSound = this.sound.add('jump',{
      volume: 1,
    });
    enemySound = this.sound.add('enemysound',{
      volume: 1,
    });
    explodeSound = this.sound.add('explosion');
    coinSound = this.sound.add('coin');
    soundSample = this.sound.add('main',{
      volume: 0.3,
      loop: true
    });
    soundSample.play();
    map = this.make.tilemap({key: 'map'});
    
    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);

    //var boxTiles = map.addTilesetImage('box');
    // create the ground layer
    boxleftLayer = map.createDynamicLayer('ColliderL', 0, 0);
    // the player will collide with this layer
    boxleftLayer.setCollisionByExclusion([-1]);

    boxrightLayer = map.createDynamicLayer('ColliderR', 0, 0);
    // the player will collide with this layer
    boxrightLayer.setCollisionByExclusion([-1]);
    // coin image used as tileset
    var coinTiles = map.addTilesetImage('coin');
    // add coins as tiles
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    var signTiles = map.addTilesetImage('signRight');
    // add coins as tiles
    signLayer = map.createDynamicLayer('Finish', signTiles, 0, 0);

    var plantsTiles = map.addTilesetImage('plants');
    // add coins as tiles
    plantsLayer = map.createDynamicLayer('Plants', plantsTiles, 0, 0);

    var spikesTiles = map.addTilesetImage('spikes');
    // add coins as tiles
    spikeLayer = map.createDynamicLayer('Spikes', spikesTiles, 0, 0);

    var enemyTiles = map.addTilesetImage('bomb');
    // add coins as tiles
    enemyLayer = map.createDynamicLayer('Enemy', enemyTiles, 0, 0);

    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    // create the player sprite    
    player = this.physics.add.sprite(200, 100, 'player');
    player.setBounce(0.2); // our player will bounce from items
    player.setCollideWorldBounds(true); // don't go out of the map    
    
    // small fix to our player images, we resize the physics body object slightly
    player.body.setSize(player.width, player.height-8);
    
    // player will collide with the level tiles 
    this.physics.add.collider(groundLayer, player);
    this.physics.add.collider(groundLayer, enemy1);
    //this.physics.add.collider(boxleftLayer, player);
    //this.physics.add.collider(boxrightLayer, player);
    this.physics.add.collider(player, enemy1, touchenemy1, null, this);
    
    // when the player overlaps with a tile with index 17, collectCoin 
    // will be called    
    spikeLayer.setTileIndexCallback(3, touchSpikes, this);
    coinLayer.setTileIndexCallback(1, collectCoin, this);
    enemyLayer.setTileIndexCallback(2, touchBomb, this);
    signLayer.setTileIndexCallback(160, touchSign, this);
    boxleftLayer.setTileIndexCallback(163, boxlefttouch, this);
    boxrightLayer.setTileIndexCallback(163, boxrighttouch, this);

    
    // when the player overlaps with a tile with index 17, collectCoin 
    // will be called    
    this.physics.add.overlap(enemy1, boxleftLayer);
    this.physics.add.overlap(enemy1, boxrightLayer);
    this.physics.add.overlap(player, enemyLayer);
    this.physics.add.overlap(player, coinLayer);
    this.physics.add.overlap(spikeLayer, player);
    this.physics.add.overlap(signLayer, player);
    
    // player walk animation
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });
    // idle with only one frame, so repeat is not neaded
    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });


    cursors = this.input.keyboard.createCursorKeys();

    // set bounds so the camera won't go outside the game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // make the camera follow the player
    this.cameras.main.startFollow(player);

    // set background color, so the sky is not black    

    Worldtext = this.add.text(config.width/2, 15, 'WORLD', {
      fontSize: '40px',
      fill: '#ffffff'
   });
   leveltext = this.add.text(560, 65, '1', {
    fontSize: '40px',
    fill: '#ffffff'
 });
    // this text will show the score
    Scoretext = this.add.text(700, 15, 'SCORE', {
      fontSize: '40px',
      fill: '#ffffff'
   });

    text = this.add.text(700, 65, score, {
        fontSize: '40px',
        fill: '#ffffff'
    });

  
    this.initialTime = 120;
    this.enemyTime = 4
    this.enemyTime2 = 4
    timetext = this.add.text(300, 65, '' + formatTime(this.initialTime),{
      fontSize: '40px',
        fill: '#ffffff'
    });

    time2text = this.add.text(300, 15, 'TIME', {
      fontSize: '40px',
      fill: '#ffffff'
  
  
    });
    lifetext = this.add.text(125, 15, 'LIFE',{
      fontSize: '40px',
      fill: '#ffffff'
    });
    this.add.image(148, 82, 'small_player').setScrollFactor(0);
    life2text = this.add.text(165, 65, 'x' + initiallife,{
      fontSize: '40px',
      fill: '#ff0000'
    });
    
    
    // Each 1000 ms call onEvent
    timedEvent = this.time.addEvent({ delay: 1000, callback: onEvent, callbackScope: this, loop: true });

    // fix the text to the camera
   
    lifetext.setScrollFactor(0);
    life2text.setScrollFactor(0);
    time2text.setScrollFactor(0);
    timetext.setScrollFactor(0);
    leveltext.setScrollFactor(0);
    Worldtext.setScrollFactor(0);
    Scoretext.setScrollFactor(0);
    text.setScrollFactor(0);
    bg_grass.setScrollFactor(0);
  
  }
  update(time, delta) {
   
    
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-350);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(350);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
    // jump 
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-475);       
        jumpSound.play(); 
    }
  }

}
function collectCoin(sprite, tile) {
  coinSound.play();
  coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
  score+=100; 
  
  // add 10 points to the score
  text.setText(score);
  // set the text to show the current score
  return false;
}
function touchBomb(sprite, tile) {
  initiallife -= 1;
  explodeSound.play();
  soundSample.stop();
  enemyLayer.removeTileAt(tile.x, tile.y);
  life2text.setText(initiallife);
  this.scene.start("deathGame");
 // if(initiallife === 0){
 // explodeSound.play();
  //soundSample.stop();
  //this.scene.start("deathGame");
  //return false;
 // }
}
function touchSpikes (sprite, tile)
{
  console.log('hitted');
  initiallife -= 1;
  explodeSound.play();
  player.destroy();
    soundSample.stop();
    life2text.setText(initiallife);
    this.scene.start("deathGame");
  }

function formatTime(seconds){
  // Minutes
  var minutes = Math.floor(seconds/60);
  // Seconds
  var partInSeconds = seconds%60;
  // Adds left zeros to seconds
  partInSeconds = partInSeconds.toString().padStart(2,'0');
  // Returns formated time
  return `${minutes}:${partInSeconds}`;
}


function onEvent ()
{
   // One second
   
   this.initialTime -= 1;
  timetext.setText(formatTime(this.initialTime));
  if (this.initialTime === 0){
    initiallife -= 1;
    soundSample.stop();
    this.scene.start("deathGame");
  }
}

function touchSign(sprite) {
  world += 1;
  map_counter += 1;
    soundSample.stop();
    this.scene.start("deathGame");
}
function touchSign2(sprite) {
    this.scene.start("finalGame");
}


function boxlefttouch(enemy1, enemy2) {
  enemy1.body.setVelocityX(+100);
  enemy1.flipX = true;
  return false;
  }

  function boxrighttouch(enemy1, enemy2) {
  enemy1.body.setVelocityX(-100);
  enemy1.flipX = false;
  return false;
  }

  function boxlefttouch4(enemy4) {
    enemy4.body.setVelocityX(+150);
    enemy4.flipX= true;
    return false;
    }
  
    function boxrighttouch4(enemy4) {
    enemy4.body.setVelocityX(-150);
    enemy4.flipX = false;
    return false;
    }

  function touchenemy1(player, enemy1) {
    if (enemy1.body.touching.up){
      enemySound.play();
      enemy1.destroy();
      score+=150; 
      text.setText(score);
    }else{
    initiallife -= 1;
    player.destroy();
    soundSample.stop();
    life2text.setText(initiallife);
    this.scene.start("deathGame");
    }
    }
   

    
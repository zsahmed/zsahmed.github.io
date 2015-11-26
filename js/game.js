var gameProperties = {
    screenWidth: 738,
    screenHeight: 463,

    delayToStartLevel: 3,
};

var states = {
    game: "game",
};

var graphicAssets = {
	ship:{URL:'assets/tony1.png', name:'ship'},
	bullet:{URL:'assets/football.png', name:'bullet'},

	asteroidLarge:{URL:'assets/EliManningSprite.png', name:'asteroidLarge'},
	asteroidMedium:{URL:'assets/ChipKelly.png', name:'asteroidMedium'},
	asteroidSmall:{URL:'assets/RedskinSprite.png', name:'asteroidSmall'},
};

var soundAssets = {
    fire:{URL: ['assets/fire.m4a', 'assets/fire.ogg'], name: 'fire'},
    destroyed: {URL: ['assets/destroyed.m4a', 'assets/destroyed.ogg'], name: 'destroyed'},
};

var shipProperties = {
	startX: gameProperties.screenWidth * 0.5,
	startY: gameProperties.screenHeight * 0.5,
    acceleration: 300,
    drag: 100,
    maxVelocity: 300,
    angularVelocity: 200,
    startingLives: 5,
    timeToReset: 3,
    blinkDelay: 0.2,
};

var bulletProperties = {
    speed: 400,
    interval: 250,
    lifeSpan: 2000,
    maxCount: 30,
}

var asteroidProperties = {
    startingAsteroids: 4,
    maxAsteroids: 20,
    incrementAsteroids: 2,

    asteroidLarge: { minVelocity: 50, maxVelocity: 100, minAngularVelocity: 0, maxAngularVelocity:200, score: 20, nextSize: graphicAssets.asteroidMedium.name, pieces: 2 },
    asteroidMedium: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity:200, score: 50, nextSize: graphicAssets.asteroidSmall.name, pieces: 2},
    asteroidSmall: { minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity:200, score: 100},
};

var fontAssets = {
    counterFontStyle:{font: '20px Arial', fill: 'black', align: 'center'},
}

var gameState = function(game){
    this.shipSprite;
    this.shipIsInvulnerable;
    this.shipIsAlive = true;

    this.key_left;
    this.key_right;
    this.key_thrust;
    this.key_fire;

    this.bulletGroup;
    this.bulletInterval = 0;

    this.asteroidGroup;
    this.asteroidsCount = asteroidProperties.startingAsteroids;

    this.shipLives = shipProperties.startingLives;
    this.tf_lives;

    this.score = 0;
    this.tf_score;

    this.sndDestroyed;
    this.sndFire;
};

gameState.prototype = {
    
    preload: function () {
        game.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
        game.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
        game.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidSmall.URL);

        game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL);
        game.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL);

        game.load.audio(soundAssets.destroyed.name, soundAssets.destroyed.URL);
        game.load.audio(soundAssets.fire.name, soundAssets.fire.URL);

        game.load.audio('NFL', ['assets/NFL.ogg', 'assets/NFL.m4a']);
        game.load.image('field', 'assets/field.png');
    },
    
    create: function () {
        game.add.tileSprite(0, 0, gameProperties.screenWidth, gameProperties.screenHeight, 'field');

    	this.initGraphics();
        this.initSounds();
        this.initPhysics();
        this.initKeyboard();
        this.resetAsteroids();

        this.music = this.game.add.audio('NFL');
        this.music.volume = 0.5;
        this.music.loop = true;
        this.music.play();

        

    },

    update: function () {
        this.checkPlayerInput();
        this.checkBoundries(this.shipSprite);
        this.bulletGroup.forEachExists(this.checkBoundries, this);
        this.asteroidGroup.forEachExists(this.checkBoundries, this);

        game.physics.arcade.overlap(this.bulletGroup, this.asteroidGroup, this.asteroidCollision, null, this);

        if(!this.shipIsInvulnerable){
            game.physics.arcade.overlap(this.shipSprite, this.asteroidGroup, this.asteroidCollision, null, this);
        }
    },

    initGraphics: function(){
    	this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
    	this.shipSprite.angle = -90;
    	this.shipSprite.anchor.set(0.5, 0.5);

        this.bulletGroup = game.add.group();
        this.asteroidGroup = game.add.group();

        this.tf_lives = game.add.text(20, 10, shipProperties.startingLives, fontAssets.counterFontStyle);

        this.tf_score = game.add.text(gameProperties.screenWidth - 20, 10, "0", fontAssets.counterFontStyle);
        this.tf_score.align = 'right';
        this.tf_score.anchor.set(1, 0);
    },

    initSounds: function (){
        this.sndDestroyed = game.add.audio(soundAssets.destroyed.name);
        this.sndFire = game.add.audio(soundAssets.fire.name);
    },

    initPhysics: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);

        this.bulletGroup.enableBody = true;
        this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;
        this.bulletGroup.createMultiple(bulletProperties.maxCount, graphicAssets.bullet.name);
        this.bulletGroup.setAll('anchor.x', 0.5);
        this.bulletGroup.setAll('anchor.y', 0.5);
        this.bulletGroup.setAll('lifespan', bulletProperties.lifespan);

        this.asteroidGroup.enableBody = true;
        this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE;
    },

    initKeyboard: function() {
        this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key_fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    },

    checkPlayerInput: function(){
        if(this.key_left.isDown){
            this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity;
        }
        else if (this.key_right.isDown){
            this.shipSprite.body.angularVelocity = shipProperties.angularVelocity;
        }
        else{
            this.shipSprite.body.angularVelocity = 0;
        }

        if(this.key_thrust.isDown){
            game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration);   
        }
        else{
            this.shipSprite.body.acceleration.set(0);
        }

        if(this.key_fire.isDown){
            this.fire();
        }
    },

    checkBoundries: function(sprite){
        if (sprite.x < 0){
            sprite.x = game.width;
        }
        else if(sprite.x > game.width){
            sprite.x = 0;
        }

        if(sprite.y < 0){
            sprite.y = game.height;
        }
        else if(sprite.y > game.height){
            sprite.y = 0;
        }
    },

     fire: function () {
        if (game.time.now > this.bulletInterval && this.shipIsAlive) { 
            this.sndFire.play();

            var bullet = this.bulletGroup.getFirstExists(false);
            
            if (bullet) {
                var length = this.shipSprite.width * 0.5;
                var x = this.shipSprite.x + (Math.cos(this.shipSprite.rotation) * length);
                var y = this.shipSprite.y + (Math.sin(this.shipSprite.rotation) * length);
                
                bullet.reset(x, y);
                bullet.lifespan = bulletProperties.lifeSpan;
                bullet.rotation = this.shipSprite.rotation;
                
                game.physics.arcade.velocityFromRotation(this.shipSprite.rotation, bulletProperties.speed, bullet.body.velocity);
                this.bulletInterval = game.time.now + bulletProperties.interval;
            }
        }
    },

    createAsteroid: function(x, y, size, pieces){
        if (pieces== undefined) {pieces = 1;}

        for(var i = 0; i < pieces; i++){
        var asteroid = this.asteroidGroup.create(x, y, size);
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);

        var randomAngle = game.math.degToRad(game.rnd.angle());
        var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);
    
        game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    },

    resetAsteroids: function() {
        for (var i = 0; i < this.asteroidsCount; i++){
            var side = Math.round(Math.random());
            var x;
            var y;

            if (side){
                x = Math.round(Math.random()) * gameProperties.screenWidth;
                y = Math.random() * gameProperties.screenHeight;
            }
            else{
                x = Math.random() * gameProperties.screenWidth;
                y = Math.round(Math.random()) * gameProperties.screenHeight;
            }

            this.createAsteroid(x, y, graphicAssets.asteroidLarge.name);
        }
    },

    asteroidCollision: function (target, asteroid){
        this.sndDestroyed.play();

        target.kill();
        asteroid.kill();

        if (target.key == graphicAssets.ship.name){
            this.destroyShip();
            this.shipIsAlive = false;
        }

        this.splitAsteroid(asteroid);
        this.updateScore(asteroidProperties[asteroid.key].score);

        if(!this.asteroidGroup.countLiving()){
            game.time.events.add(Phaser.Timer.SECOND * gameProperties.delayToStartLevel, this.nextLevel, this);
        }
    },

    destroyShip: function(){
        this.shipLives --;
        this.tf_lives.text = this.shipLives;

        if(this.shipLives){
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.resetShip, this);
        }

        if(this.shipLives <= 0){
            game.state.start('wat');
            this.music.stop();
        }

    },

    resetShip: function(){
        this.shipIsInvulnerable = true;
        this.shipSprite.reset(shipProperties.startX, shipProperties.startY);
        this.shipIsAlive = true;
        this.shipSprite.angle = -90;

        game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.shipReady, this);
        game.time.events.repeat(Phaser.Timer.SECOND * shipProperties.blinkDelay, shipProperties.timeToReset / shipProperties.blinkDelay, this.shipBlink, this);
    },

    shipReady: function() {
        this.shipIsInvulnerable = false;
        this.shipSprite.visible = true;
    },

    shipBlink: function(){
        this.shipSprite.visible = !this.shipSprite.visible;
    },

    splitAsteroid: function(asteroid) {
        if(asteroidProperties[asteroid.key].nextSize){
            this.createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.key].nextSize, asteroidProperties[asteroid.key].pieces);
        }
    },

    updateScore: function(score){
        this.score += score;
        this.tf_score.text = this.score;
    },

    nextLevel: function(){
        this.asteroidGroup.removeAll(true);

        if(this.asteroidsCount < asteroidProperties.maxAsteroids){
            this.asteroidsCount += asteroidProperties.incrementAsteroids;
        }

        this.resetAsteroids();
    },



};



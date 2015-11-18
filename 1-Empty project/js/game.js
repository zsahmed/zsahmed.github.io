var gameProperties = {
    screenWidth: 640,
    screenHeight: 480,
};

var states = {
    game: "game",
};

var graphicAssets = {
	ship:{URL:'assets/ship.png', name:'ship'},
	bullet:{URL:'assets/bullet.png', name:'bullet'},

	asteroidLarge:{URL:'assets/asteroidLarge.png', name:'asteroidLarge'},
	asteroidMedium:{URL:'assets/asteroidMedium.png', name:'asteroidMedium'},
	asteroidSmall:{URL:'assets/asteroidSmall.png', name:'asteroidSmall'},
};

var shipProperties = {
	startX: gameProperties.screenWidth * 0.5,
	startY: gameProperties.screenHeight * 0.5,
    acceleration: 300,
    drag: 100,
    maxVelocity: 300,
    angularVelocity: 200,
};

var gameState = function(game){
    this.shipSprite;
};

gameState.prototype = {
    
    preload: function () {
        game.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
        game.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
        game.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidMedium.URL);

        game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL);
        game.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL);
    },
    
    create: function () {
    	this.initGraphics();
        this.initPhysics();
        
    },

    update: function () {
        
    },

    initGraphics: function(){
    	this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
    	this.shipSprite.angle = -90;
    	this.shipSprite.anchor.set(0.5, 0.5);
    },

    initPhysics: function() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
        this.shipSprite.body.drag.set(shipProperties.drag);
        this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);
    }
};

var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.game, gameState);
game.state.start(states.game);
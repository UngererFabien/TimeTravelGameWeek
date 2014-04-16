define(function(require){
	var Case = require("./Case"),
		DoorManager = require("./DoorManager"),
	    BlocsManager = require("./blocsManager"),
	    TPManager = require("./TeleporteurManager"),
	    SwitchManager = require("./SwitchManager"),
	    lookUtils = require('./playersLookUtil'),
	    ProjectionManager = require("./ProjectionManager"),
	    ConsoleManager = require("./ConsoleManager"),
	    ExitManager = require("./ExitManager");

	var Player = {

		canMove : true,

		preload: function(){
			Game.load.spritesheet('character', '../images/gabarit_chara.png', 64, 128, 1);
			this.created = false;
		},

		create: function(caseDepart){
			
			this.currCase = caseDepart || new Case(1,1);
			this.sprite = Game.add.sprite(this.currCase.x * 64, this.currCase.y * 64 - 64, 'character');
			this.created = false;
			//sprite.animations.add('walk');
		    //sprite.animations.play('walk', 50, true);

		    //  Enable if for physics. This creates a default rectangular body.
			Game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

			this.sprite.body.bounce.y = 0;
			this.sprite.body.bounce.x = 0;
		    this.sprite.body.linearDamping = 1;
		    this.sprite.body.collideWorldBounds = true;
		    this.sprite.body.setSize(64,64,0,64);
			this.initInputs();
		    
		    console.log('Player Create', this);
		    Game.gameState = 'play';
		    this.isReady = true;
		},

		disappear: function(){
			this.isReady = false;
			this.sprite.visible = false;
		},

		initInputs: function(){
			//console.log('Player Init Inputs');
			this.cursors = Game.input.keyboard.createCursorKeys();
		},

		resetVelocity: function(){
			this.sprite.body.velocity.x = 0;
		    this.sprite.body.velocity.y = 0;
		},

		setTarget: function(target, onComplete){
			// console.log("setTarget target = ", target, ", onComplete = ", onComplete);
			var _this = this;

			this.canMove = false;
		    this.tween = Game.add.tween(this.sprite.body).to(target, 200, Phaser.Easing.Linear.None, true);
		    this.tween.onUpdateCallback(function(){
		    	if(Game.physics.arcade.collide(_this.sprite, Game.layerTiles)){
		    		console.log('colide');
		    		_this.tween.stop();
		    		_this.resetVelocity();
		    		_this.canMove = true;
				}
		    });
		    this.tween.onComplete.add(function(){
		    	Game.manageAllLook();
		    	this.resetVelocity();
		    	this.canMove = true;
		    	if(onComplete) onComplete.apply();
		    }, this);
		},

		checkInputs: function(){
			var target = {
				x: this.sprite.body.x,
				y: this.sprite.body.y
			}

			if(this.canMove){
				if (this.cursors.up.isDown) {
			    	//console.log('up');
			    	// target.y -= 64;
			    	// this.setTarget(target);
			    	// this.sprite.body.velocity.y = -1;
			    	this.moveToCase(this.currCase.x, this.currCase.y - 1, target);

			    } else if (this.cursors.down.isDown) {
			    	//console.log('down');
			    	// target.y += 64;
			    	// this.setTarget(target);
			    	// this.sprite.body.velocity.y = 1;
			    	this.moveToCase(this.currCase.x, this.currCase.y + 1, target);

			    } else if (this.cursors.left.isDown) {
			    	//console.log('left');
			    	// target.x -= 64;
			    	// this.setTarget(target);
			    	// this.sprite.body.velocity.x = -1;
			    	this.moveToCase(this.currCase.x - 1, this.currCase.y, target);

			    } else if (this.cursors.right.isDown) {
			    	//console.log('right');
			    	// target.x += 64;
			    	// this.setTarget(target);
			    	// this.sprite.body.velocity.x = 1;
			    	this.moveToCase(this.currCase.x + 1, this.currCase.y, target);

			    }
			}

		},

		update: function(){
			this.checkInputs();
			//console.log(Game.physics.arcade.overlap(this.sprite, this.sprite2))
		},

		render: function(){

		},

		moveToCase: function(idX, idY, target){
			var _this = this;			
			var future = Game.mapCases.layer2[idY][idX];
			var futureBloc = Game.mapCases.layer3[idY][idX];
			var move = false;
			if(future.type == "door"){//console.log(future.x*64); console.log(future.y*64);
				var doorToCheck = _.findWhere(DoorManager.doorsObject, {x:future.x*64, y:future.y*64});
				if(doorToCheck.opened)
					console.log(open)
				else
					return
			}
			if(future.type == "switch"){//console.log(future.x*64); console.log(future.y*64);
				var switchToCheck = _.findWhere(SwitchManager.switchObjects, {x:future.x*64, y:future.y*64});
				if(!switchToCheck.activated){
					switchToCheck.activated = true;
					switchToCheck.activate();
				}
			}
			
			//gestion des blocs
			if(future.type == "bloc"){//console.log(future.x*64); console.log(future.y*64);
				var blocToCheck = _.findWhere(BlocsManager.blocsTable, {x:future.x*64, y:future.y*64});
				if(blocToCheck.canMove)
				{
					if(blocToCheck.moveDirection({
						x : this.sprite.body.velocity.x,
						y : this.sprite.body.velocity.y
					})){
						return true;
					}
					else
						return false;
				}
				else
					return
			}
			if (future.type == "console"){
				var consoleToCheck = _.findWhere(ConsoleManager.consoleObjects, {x:future.x*64, y:future.y*64});
				this.setTarget(target, function(){
					if (!consoleToCheck.activated){
						ConsoleManager.consolesON++;
						console.log(ConsoleManager.consolesON);
						consoleToCheck.Activate();
						ProjectionManager.projs[ProjectionManager.currentId].full = true;
						if (ConsoleManager.consolesON == ConsoleManager.maxConsolesON){
							ExitManager.exitObjects[0].Activate();
						}
					}
				});
			}

			if (future.type == "exit"){
				var exitToCheck = ExitManager.exitObjects[0];
				if(exitToCheck.opened)
					console.log("finish level");
				else
					return;
			}

			//s'il n'y a pas d'objets sur la case on check le layer1
			if(future.type == "")
			{
				future = Game.mapCases.layer1[idY][idX];
				if(future.type == "ground")
					move = true;
			}
			else
				move = true;
			
			//pour que le check des collisions se fasse quand même
			this.sprite.body.velocity.x = idX - this.currCase.x;
			this.sprite.body.velocity.y = idY - this.currCase.y;

			target.x += 64 * this.sprite.body.velocity.x;
			target.y += 64 * this.sprite.body.velocity.y;

			//gestion des blocs
			if(futureBloc.type == "bloc"){//console.log(future.x*64); console.log(future.y*64);
				var blocToCheck = _.findWhere(BlocsManager.blocsTable, {x:futureBloc.x*64, y:futureBloc.y*64});
				if(blocToCheck.canMove)
				{
					if(!blocToCheck.moveDirection({
						x : this.sprite.body.velocity.x,
						y : this.sprite.body.velocity.y
					})){
						return false;
					}	
				}
				else
					return
			}

			//si c'est un teleport on passe une fonction onComplete au setTarget pour qu'il se tp après être passé sur le téléporteur
			if(future.type == "teleport")
			{
				
				this.setTarget(target, function(){
					var tp = _.findWhere(TPManager.teleporteurs, {x: future.x, y: future.y});
					target.x = tp.target.x * 64;
					target.y = tp.target.y * 64;
					idX = tp.target.x;
					idY = tp.target.y;
					_this.currCase.x = idX;
					_this.currCase.y = idY;
					_this.setTarget(target);
				});
				return;
			}

			//si c'est un vortex on se destroy
			if(future.type == "vortex"){//console.log(future.x*64); console.log(future.y*64);
				//this.sprite.destroy();
				this.setTarget(target, function(){
					_this.sprite.destroy();
				});
				return;
			}

			if(move)
			{
				this.currCase.x = idX;
				this.currCase.y = idY;
				ProjectionManager.addCaseToCurrentProjection(new Case(idX, idY));
				ProjectionManager.moveAllProj();
			}

			if (future.type == "direction_right"){
				this.canMove = false;
				this.setTarget(target, function(){
					_this.canMove = false;
					_this.moveToCase(idX+1, idY, target);
				});
				return;
			}
			else if (future.type == "direction_bottom"){
				this.canMove = false;
				this.setTarget(target, function(){
					_this.canMove = false;
					_this.moveToCase(idX, idY+1, target);
				});
				return;
			}
			else if (future.type == "direction_left"){
				this.canMove = false;
				this.setTarget(target, function(){
					_this.canMove = false;
					_this.moveToCase(idX-1, idY, target);
				});
				return;
			}
			else if (future.type == "direction_up"){
				this.canMove = false;
				this.setTarget(target, function(){
					_this.canMove = false;
					_this.moveToCase(idX, idY-1, target);
				});
				return;
			}
				this.canMove = true;

			this.setTarget(target);
			


		}
	}

	return Player;
});
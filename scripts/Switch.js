define(function(require) {
	var DoorManager = require("./DoorManager");

	var Switch = function(id, x,y,type){
		this.x = x;
		this.y = y;
		this.id = id || 0;
		this.type = type || "";
		this.sprite = Game.add.sprite(this.x, this.y, 'switch');
		this.activated = false;

		this.activate = function(){
			this.activated = true;
			var doorToActivate = _.findWhere(DoorManager.doorsObject, {id:this.id});
			doorToActivate.Open();
		};
	};

	return Switch;
});
function StressGame() {
	var stage = new Kinetic.Stage({
		container : 'stress',
		width : 512,
		height : 384
	});

	var interactionLayer = new Kinetic.Layer();
	var bugs = [];
	function generateBug(stage, interactionLayer) {
		var bug = new Bug(stage, interactionLayer);
		bug.init();
		interactionLayer.add(bug.bugGraphic());
		return bug;
	}


	this.init = function() {
		generateBug(stage, interactionLayer);
		stage.add(interactionLayer);
	}
}

// a bug class
function Bug(stage, interactionLayer) {
	var amplitude = 150;
	var period = 2000;
	// in ms
	var centerX = stage.getWidth() / 2;
	var bugSprite;
	var bugAnimation;
	var isMoving = true;
	var coords = {x:0, y:0};
	this.init = function() {
		bugSprite = new Kinetic.Circle({
			x : 50,
			y : 50,
			radius : 30,
			fill : "#DEF"
		});
		coords.x = bugSprite.getPosition().x;
		bugAnimation = new Kinetic.Animation(function(frame) {
			bugSprite.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + coords.x);
			if(isMoving) {
				coords.x = bugSprite.getPosition().x - (amplitude * Math.sin(frame.time * 2 * Math.PI / period));
			}
		}, interactionLayer);
		bugAnimation.start();
		isMoving = true;

		bugSprite.on('click', function(evt) {
			isMoving = !isMoving;
			alert(coords.x);
			if (!isMoving) {
				bugAnimation.stop();
			} else {
				bugSprite.setX(coords.x);
				bugAnimation.start();
			}
		});
	}

	this.bugGraphic = function() {
		return bugSprite;
	};
}

function StressGame() {
	var stage = new Kinetic.Stage({
		container : 'stress',
		width : 512,
		height : 384
	});
	var backgroundLayer = new Kinetic.Layer(); // layer for background
	var interactionLayer = new Kinetic.Layer(); // layer that contains all moving parts
	var bugs = []; // contains all bugs
	var bugs = []; // contains all bugs
	
	// generates a bug
	function generateBug(stage, interactionLayer) {
		var bug = new Bug(stage, interactionLayer);
		bug.init();
		interactionLayer.add(bug.bugGraphic());
		return bug;
	}


	this.init = function() {
		this.moreBugs();
		stage.add(interactionLayer);
		for (var n = 0; n < bugs.length; n++) {
			bugs[n].move();
		}
	}

	this.allBugs = bugs;

	this.moreBugs = function() {
		bugs.push(generateBug(stage, interactionLayer));
	}
}

// a bug class
function Bug(stage, interactionLayer) {
	var bugSprite;
	var bugAnimation;
	var trans = null;
	var isDragged = false;
	var moved = null;
	this.init = function() {
		bugSprite = new Kinetic.Circle({
			x : 50,
			y : 50,
			radius : 30,
			fill : "#F00D13",
			draggable : true,
			startScale : 1,
			stroke: '#BADBAD',
			strokeWidth: 5
		});

		isMoving = true;

		bugSprite.on('dragstart', function() {
			console.log("dragstart");
			isDragged = true;
			if (moved) {
				moved.stop();
			}
			if (trans) {
				trans.stop();
			}

			bugSprite.moveToTop();
			bugSprite.setAttrs({
				scale : {
					x : bugSprite.attrs.startScale * 1.2,
					y : bugSprite.attrs.startScale * 1.2
				}
			});
		});

		bugSprite.on('dragend', function() {
			console.log("dragend");
			isDragged = false;
			trans = bugSprite.transitionTo({
				duration : 0.5,
				easing : 'elastic-ease-out',
				
				scale : {
					x : bugSprite.attrs.startScale,
					y : bugSprite.attrs.startScale
				},
				callback : function() {
					moveF();
				}
			})

		});
	}

	this.move = function() {
		moved = bugSprite.transitionTo({
			x : Math.random() * stage.getWidth(),
			y : Math.random() * stage.getHeight(),
			duration : 1,
			callback : function() {
				if (!isDragged) {
					moveF();
				}
			}
		});
	}
	var moveF = this.move;

	this.bugGraphic = function() {
		return bugSprite;
	};
}

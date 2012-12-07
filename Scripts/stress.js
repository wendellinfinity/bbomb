// all constants used
var CONSTANTS = {
	CanvasID : "stress",
	WispDefaultFill : "#F00D13",
	WispDefaultStroke : "#BADBAD",
	WispDefaultStrokeSize : 5,
	WispMovementSpeed : 2,
	WispCapturedMovementSpeed : 0.5,
	WispNeutralizedColor : "green",
	WispDangerColor : "red",
	CanvasWidth : 688,
	CanvasHeight : 388,
	CanvasColor : "#DDD",
	WispStartCoords : {
		x : (688 / 2) - 20,
		y : 50
	},
	FrameRate : 200,
	FrameSkip : 0,
	WispDefaultRadius : 20,
	TimerDefaults : {
		WispLife : 1000,
		WispDBNO : 0,
		WispStep : 10,
		Interval : 100,
		PercentageDiv : 1000,
		WispTimerCoords : {
			x : 0,
			y : 0
		},
		WispTimerRadius : 15,
		WispTimerColor : '#4A04A0',
		WispTimerWidth : 5
	},
	JarDefaults : {
		RightJar : {
			Top : 120,
			Left : 608,
			Width : 85,
			Height : 145,
			Fill : "#F00D13",
			Stroke : "#333",
			StrokeWidth : 3,
			JarID : 0
		},
		LeftJar : {
			Top : 120,
			Left : -8,
			Width : 85,
			Height : 145,
			Fill : "#BADF00",
			Stroke : "#333",
			StrokeWidth : 3,
			JarID : 1
		}
	},
	MaxJarCapacity : 7,
	Time : {
		WispSpawnStartS : 1,
		WispSpawnMaxS : 5,
		StressClockMaxS : 30
	}
}

// StressGame game class
function StressGame() {
	// main canvas
	var stage = new Kinetic.Stage({
		container : CONSTANTS.CanvasID,
		width : CONSTANTS.CanvasWidth,
		height : CONSTANTS.CanvasHeight,
	});
	// layer for background
	var backgroundLayer = new Kinetic.Layer();
	// layer that contains all moving parts
	var interactionLayer = new Kinetic.Layer();
	// contains all wisps
	var wisps = [];
	// contains all jars
	var jars = [];
	var layers = {
		background : backgroundLayer,
		interaction : interactionLayer
	};
	// main init function
	this.init = function() {
		// add background layer to stage
		stage.add(backgroundLayer);
		// add moving layer to stage
		stage.add(interactionLayer);
		initializePlayArea();
		// try generate 1 wisp
		//this.moreWisps();
		// start Game!
	}
	this.start = function() {
		generateWisp(interactionLayer, jars);
	}
	function initializePlayArea() {
		// create background area
		var bg = new Kinetic.Rect({
			x : 0,
			y : 0,
			width : CONSTANTS.CanvasWidth,
			height : CONSTANTS.CanvasHeight,
			fill : CONSTANTS.CanvasColor
		});
		backgroundLayer.add(bg);
		// create the Jars for the wisps
		var rightJarSettings = CONSTANTS.JarDefaults.RightJar;
		var rightJar = new Jar(rightJarSettings, layers);
		// generate a jar and push it to an array
		rightJar.init();
		jars.push(rightJar);
		var leftJarSettings = CONSTANTS.JarDefaults.LeftJar;
		var leftJar = new Jar(leftJarSettings, layers);
		// generate a jar and push it to an array
		leftJar.init();
		jars.push(leftJar);

		// draw!
		backgroundLayer.draw();
	}

	// property to get all wisps
	this.allWisps = wisps;
	// generates a wisp
	function generateWisp(interactionLayer, jars) {
		var spawnT = Math.round(Math.random() * CONSTANTS.Time.WispSpawnMaxS);
		if (spawnT < CONSTANTS.Time.WispSpawnStartS) {
			spawnT = CONSTANTS.Time.WispSpawnStartS;
		}
		console.log(spawnT);
		setTimeout(function() {
			var wisp = new Wisp(interactionLayer, jars);
			wisp.init(wisp);
			wisps.push(wisp);
			generateWisp(interactionLayer, jars);
		}, spawnT * 1000);
	}

}

function Jar(settings, layers) {

	var jarImage;
	var ID;
	var jarSettings = settings;
	var captured = [];
	this.getImage = function() {
		return jarImage;
	}
	this.getID = function() {
		return ID;
	}
	this.getSettings = function() {
		return jarSettings;
	}
	this.init = function() {
		jarImage = new Kinetic.Rect({
			x : settings.Left,
			y : settings.Top,
			width : settings.Width,
			height : settings.Height,
			fill : settings.Fill,
			stroke : settings.Stroke,
			strokeWidth : settings.StrokeWidth
		});
		layers.background.add(jarImage);
		ID = settings.JarID;
	}
	this.capture = function(capturedWisp) {
		if (captured.length == CONSTANTS.MaxJarCapacity) {
			var fifo = captured.shift();
			// clear the image
			fifo.stop();
			fifo.getImage().remove();
		}
		captured.push(capturedWisp);
	}
}

function Wisp(interactionLayer, jars) {
	var wispSprite, wispImage, wispText, wispTimer;
	var wispAnimation;
	// transition while dragging
	var dragTransition = null;
	// transition while moving
	var moveTransition = null;
	var isDragged = false;
	var stage = interactionLayer.getStage();
	var timerAnimation, time, timer;
	var wispState;
	var wispFill;
	var wispAnimation;
	var isCaptured;
	var jarID;
	var capturedJar;
	var self;
	// tells if this wisp has been captured
	this.captured = isCaptured;
	// returns the wisp sprite group
	this.getImage = function() {
		return wispSprite;
	}
	this.stop = function() {
		dragTransition.stop();
		moveTransition.stop();
		timerAnimation.stop();
	}
	this.init = function(s) {
		var tjar = jars[Math.round(Math.random() * (jars.length - 1))];
		// randomize destination jarId
		self = s;
		jarID = tjar.getID();
		wispFill = tjar.getSettings().Fill;
		wispImage = new Kinetic.Circle({
			radius : CONSTANTS.WispDefaultRadius,
			fill : wispFill,
			stroke : CONSTANTS.WispDefaultStroke,
			strokeWidth : CONSTANTS.WispDefaultStrokeSize
		});
		/*
		 wispText = new Kinetic.Text({
		 text : '10',
		 fontSize : CONSTANTS.WispDefaultRadius,
		 fontFamily : 'Helvetica',
		 textFill : 'white'
		 });
		 */
		wispTimer = new Kinetic.Shape({
			drawFunc : drawTimer
		});
		wispSprite = new Kinetic.Group({
			x : CONSTANTS.WispStartCoords.x,
			y : CONSTANTS.WispStartCoords.y,
			draggable : true,
			startScale : 1
		});
		wispSprite.add(wispImage);
		//wispSprite.add(wispText);
		wispSprite.add(wispTimer);
		wispSprite.on('dragstart', dragStart);
		wispSprite.on('dragmove', dragMove);
		wispSprite.on('mousedown', mouseDown);
		wispSprite.on('dragend', dragEnd);
		time = CONSTANTS.TimerDefaults.WispLife;
		timerAnimation = new Kinetic.Animation(drawTimerFrame, interactionLayer);
		// start the timer, step down
		timer = setInterval(function() {
			time -= CONSTANTS.TimerDefaults.WispStep;
			if (time <= CONSTANTS.TimerDefaults.WispDBNO) {
				// erase the timer, stop everything
				clearInterval(timer);
			}
		}, CONSTANTS.TimerDefaults.Interval);

		wispAnimation = new Kinetic.Animation(drawWispFrame, interactionLayer);

		// add the wisp to the stage/interaction layer
		interactionLayer.add(wispSprite);
		timerAnimation.start();
		// start moving the wisp
		moveWisp();
		isMoving = true;
	}
	function dragStart() {
		isDragged = true;
		// stop all movement and transitions
		if (dragTransition) {
			dragTransition.stop();
		}
		// move wisp to top
		wispSprite.moveToTop();
		wispSprite.setAttrs({
			scale : {
				x : wispSprite.attrs.startScale * 1.2,
				y : wispSprite.attrs.startScale * 1.2
			}
		});
	}

	function dragMove() {
		var currx, curry, jarx1, jary1, jarx2, jary2, jarImagehit;
		currx = wispSprite.getX();
		curry = wispSprite.getY();
		hit = false;
		for ( n = 0; n < jars.length; n++) {
			jarImage = jars[n].getImage();
			jarx1 = jarImage.getX();
			jarx2 = jarx1 + jarImage.getWidth();
			jary1 = jarImage.getY();
			jary2 = jary1 + jarImage.getHeight();
			// check if captured
			if (currx >= jarx1 && currx <= jarx2 && curry >= jary1 && curry <= jary2) {
				hit = true;
				break;
			}
		}
		if (!hit) {
			if (wispSprite.getX() >= CONSTANTS.JarDefaults.RightJar.Left) {
				wispSprite.setX(CONSTANTS.JarDefaults.RightJar.Left);
				return;
			}
			if (wispSprite.getX() <= CONSTANTS.JarDefaults.LeftJar.Left + CONSTANTS.JarDefaults.LeftJar.Width) {
				wispSprite.setX(CONSTANTS.JarDefaults.LeftJar.Left + CONSTANTS.JarDefaults.LeftJar.Width);
				return;
			}
		}
	}

	function mouseDown() {
		// stop all movement and transitions
		if (moveTransition) {
			moveTransition.stop();
		}
	}

	function dragEnd() {
		isDragged = false;
		dragTransition = wispSprite.transitionTo({
			duration : 0.5,
			easing : 'elastic-ease-out',
			scale : {
				x : wispSprite.attrs.startScale,
				y : wispSprite.attrs.startScale
			},
			callback : function() {
				var currx, curry, jarx1, jary1, jarx2, jary2, jarImage;
				currx = wispSprite.getX();
				curry = wispSprite.getY();
				for ( n = 0; n < jars.length; n++) {
					jarImage = jars[n].getImage();
					jarx1 = jarImage.getX();
					jarx2 = jarx1 + jarImage.getWidth();
					jary1 = jarImage.getY();
					jary2 = jary1 + jarImage.getHeight();
					// check if captured
					if (currx >= jarx1 && currx <= jarx2 && curry >= jary1 && curry <= jary2) {
						// call capture handler
						if (jarID == jars[n].getID()) {
							// mark the jar
							capturedJar = jars[n];
							capture();
						} else {
							gameOver();
						}
					}
				}
				// continue movement
				moveWisp();
			}
		})
	}

	function drawTimerFrame(frame) {
		var newSegsToSkip = Math.round(frame.time / CONSTANTS.FrameRate);
		if (newSegsToSkip == CONSTANTS.FrameSkip)
			return;
		else {
			segsToSkip = newSegsToSkip;
			wispTimer.remove();
			wispTimer = new Kinetic.Shape({
				drawFunc : drawTimer
			});
			wispSprite.add(wispTimer);
		}
		if (time <= CONSTANTS.TimerDefaults.WispDBNO) {
			timerAnimation.stop();
			return;
		}
	}

	// draws the timer arc
	function drawTimer(context) {
		var percentage = time / CONSTANTS.TimerDefaults.PercentageDiv;
		var degrees = percentage * 360.0;
		var radians = degrees * Math.PI / 180.0;
		context.beginPath();
		context.lineWidth = CONSTANTS.TimerDefaults.WispTimerWidth;
		context.arc(CONSTANTS.TimerDefaults.WispTimerCoords.x, CONSTANTS.TimerDefaults.WispTimerCoords.y, CONSTANTS.TimerDefaults.WispTimerRadius, 0, radians, false);
		context.strokeStyle = CONSTANTS.TimerDefaults.WispTimerColor;
		context.stroke();
	}

	function drawWispFrame(frame) {
		var newSegsToSkip = Math.round(frame.time / CONSTANTS.FrameRate);
		if (newSegsToSkip == CONSTANTS.FrameSkip)
			return;
		else {

		}
	}

	// function to handle captures
	function capture() {
		// turn of all events of wisp
		wispSprite.off('dragend dragstart mousedown');
		wispImage.setFill(CONSTANTS.WispNeutralizedColor);
		isCaptured = true;
		// put in jar
		capturedJar.capture(self);
	}

	function gameOver() {
		alert("Game Over!")
	}

	// moves the wisp randomly around the canvas
	function moveWisp() {
		var destx, desty, n;
		if (!isCaptured) {
			destx = Math.random() * stage.getWidth() - CONSTANTS.JarDefaults.RightJar.Width;
			if (destx < 0) {
				destx += CONSTANTS.JarDefaults.RightJar.Width;
			}
			destx += (CONSTANTS.JarDefaults.LeftJar.Width + CONSTANTS.JarDefaults.LeftJar.Left);
			if (destx >= CONSTANTS.JarDefaults.RightJar.Left) {
				destx = CONSTANTS.JarDefaults.RightJar.Left;
			}
			desty = Math.random() * stage.getHeight();
		} else {
			var jarImage = capturedJar.getImage();
			destx = Math.random() * jarImage.getWidth() + jarImage.getX();
			desty = Math.random() * jarImage.getHeight() + jarImage.getY();
		}

		moveTransition = wispSprite.transitionTo({
			x : destx,
			y : desty,
			duration : isCaptured ? CONSTANTS.WispCapturedMovementSpeed : CONSTANTS.WispMovementSpeed,
			callback : function() {
				if (!isDragged) {
					// give the wisp more movement
					moveWisp();
				}
			}
		});
	}

}

// initialize the game
var sg = new StressGame();
sg.init();

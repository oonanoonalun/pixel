var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = Math.round(canvas.height / canvas.width * pixelsPerRow), // the Math.round() doesn't matter for the 80x60 resolution, but the system
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
	scaledPixelSize = canvas.width / pixelsPerRow,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	pixelArray = imageData.data,
	map = {
		'platIndices': [], // i.e. indices that should be platforms, and have the .plat property be 'true'	
		'solidIndices': [] // i.e. indices that should be permanent platforms, with .solid and .notLightSensitive set to 'true'
	},
	entities = {
		'points': [],
		'all': []
	},
	effects = {
		'snow': {},
		'snowflakes': []
	},
	platformer = {
		'gravity': {
			'direction': 'right', // valid entries are 'up', 'down', 'left', and 'right'
			'magnitude': 1
		}
	},
	frameCounter = 1;

initializeRGBAChannels();

function initializeEntities() {
	// key (numbers are entities.points[n]):
	//		0 = player
	//		1 = player spotlight target or general-purpose target
	//		2 = autonomous agent with light
	//		3 = autonomous agent with box of collision
	entities.points = [];
	for (var j = 0; j < 4; j++) {
		point = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 5,
			'maxSpeed': 25,
			'altitude': {
				'up': null,
				'down': null,
				'left': null,
				'right': null
			},
			'brightness': 256,
			'type': 'point',
			'target': null,	// WRONG, maybe. Doesn't need to be initialized? Same for lines.
			'shouldBeRemoved': false // WRONG: Doesn't need to be initialized. Same for lines.
		};
		point.index = indexOfCoordinates[point.x][point.y];
		entities.points.push(point);
		entities.all.push(point);
	}
	entities.points[0].spotlight = {
		'brightness': 384,
		'narrowness': 3.75
	};
	entities.points[1].noCollision = true;
	// point 2
	entities.points[2].noCollision = true; // WRONG this is weird. Think about how to deal with obstacle-obstacle collision. If this isn't true, the object collides with the solid things built around it if all the blocks around it are built as solid.
	entities.points[2].spotlight = {
		'brightness': 384,
		'narrowness': 1
	};
	entities.points[2].maxSpeed = 4;
	// point 3
	entities.points[3].noCollision = true;
}

function initializeRGBAChannels() {
	for (var i = 0; i < pixelArray.length; i++) {
		pixelArray[i * 4 + 0] = 0;
		pixelArray[i * 4 + 1] = 0;
		pixelArray[i * 4 + 2] = 48;
		pixelArray[i * 4 + 3] = 255;
	}
}
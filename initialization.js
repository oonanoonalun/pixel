var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
	scaledPixelSize = canvas.width / pixelsPerRow,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	pixelArray = imageData.data,
	entities = {
		'points': [],
		'all': []
	},
	effects = {
		'snow': {}
	},
	frameCounter = 1;

initializeRGBAChannels();

function initializeEntities() {
	// key (numbers are entities.points[n]):
	//		0 = player
	//		1 = player spotlight target
	//		2 = obstacle
	entities.points = [];
	for (var j = 0; j < 3; j++) {
		point = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 5,
			'maxSpeed': 25,
			'brightness': 3072,
			'type': 'point',
			'target': null,	// WRONG, maybe. Doesn't need to be initialized? Same for lines.
			'shouldBeRemoved': false // WRONG: Doesn't need to be initialized. Same for lines.
		};
		point.index = indexOfCoordinates[point.x][point.y];
		entities.points.push(point);
		entities.all.push(point);
	}
	entities.points[0].spotlight = {
		'narrowness': 400
	};
	entities.points[1].noCollision = true;
	entities.points[2].noCollision = true; // WRONG this is weird. Think about how to deal with obstacle-obstacle collision. If this isn't true, the object collides with the solid things built around it if all the blocks around it are built as solid.
}

function initializeRGBAChannels() {
	for (var i = 0; i < pixelArray.length; i++) {
		pixelArray[i * 4 + 0] = 0;
		pixelArray[i * 4 + 1] = 0;
		pixelArray[i * 4 + 2] = 48;
		pixelArray[i * 4 + 3] = 255;
	}
}
var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
	scaledPixelSize = canvas.width / pixelsPerRow,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	pixelArray  = imageData.data,
	entities = {
		'lines': [],
		'points': [],
		'all': []
	},
	frameCounter = 1;

initializeEntities();
initializeRGBAChannels();

function initializeEntities() {
	entities.lines = [];
	entities.points = [];
	for (var i = 0; i < 1; i++) {
		var line = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 0.3,
			'maxSpeed': 5,
			'brightnessFront': 768,
			'brightnessBack': -768,
			'angle': 0,
			'length': 200,
			'spread': 200,
			'type': 'line',
			'shouldBeRemoved': false
		};
		// WRONG: I don't want to have to filter two arrays for removing one item
		entities.lines.push(line);
		entities.all.push(line);
	}
	for (var j = 0; j < 1; j++) {
		point = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 0.3,
			'maxSpeed': 5,
			'brightness': 768,
			'type': 'point',
			'target': null,
			'shouldBeRemoved': false
		};
		entities.points.push(point);
		entities.all.push(point);
	}
}

function initializeRGBAChannels() {
	for (var i = 0; i < pixelArray.length; i++) {
		pixelArray[i * 4 + 0] = 0;
		pixelArray[i * 4 + 1] = 0;
		pixelArray[i * 4 + 2] = 48;
		pixelArray[i * 4 + 3] = 255;
	}
}
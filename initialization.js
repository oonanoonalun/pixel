var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	pixelArray  = imageData.data,
	entities = {
		'linesHoriz': [],
		'linesVert': [],
		'points': []
	},
	frameCounter = 1;

initializeEntities();
initializeRGBAChannels();

function initializeEntities() {
	entities.linesHoriz = [];
	entities.linesVert = [];
	entities.points = [];
	for (var i = 0; i < 0; i++) {
		entities.linesHoriz.push({
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 0.3,
			'maxSpeed': 5,
			'brightness': 768
		});
	}
	for (var k = 0; k < 0; k++) {
		entities.linesVert.push({
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 0.3,
			'maxSpeed': 5,
			'brightness': 768
		});
	}
	for (var j = 0; j < 5; j++) {
		entities.points.push({
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'dy': 0,
			'vy': 0,
			'maxAcceleration': 0.3,
			'maxSpeed': 5,
			'brightness': 768
		});
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
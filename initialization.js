var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	entities = {
		'linesHoriz': [],
		'linesVert': [],
		'points': []
	},
    pixelArray  = imageData.data,
	frameCounter = 1;

initializeEntities();
initializeRGBAChannels();

function initializeEntities() {
	entities.linesHoriz = [];
	entities.linesVert = [];
	entities.points = [];
	for (var i = 0; i < 3; i++) {
		entities.linesHoriz.push({
			'index': Math.round(Math.random() * ((pixelsPerGrid - 1)) * pixelsPerRow),
			'direction': Math.round(Math.random() * 7),
			'brightness': 768
		});
	}
	for (var k = 0; k < 3; k++) {
		entities.linesVert.push({
			'index': Math.round(Math.random() * (pixelsPerGrid - 1)),
			'direction': Math.round(Math.random() * 7),
			'brightness': 768
		});
	}
	for (var j = 0; j < 1; j++) {
		entities.points.push({
			'index': Math.round(Math.random() * (pixelsPerGrid - 1)),
			'direction': Math.round(Math.random() * 7),
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
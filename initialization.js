var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
    pixelArray  = imageData.data,
	frameCounter = 1;
	
initializeRGBAChannels();

function initializeRGBAChannels() {
	for (var i = 0; i < pixelArray.length; i++) {
		//pixelArray[i * 4 + 0] = Math.random() * 255;
		pixelArray[i * 4 + 0] = 0;
		pixelArray[i * 4 + 1] = 0;
		pixelArray[i * 4 + 2] = 48;
		pixelArray[i * 4 + 3] = 255;
	}
}
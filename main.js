var centerIndex = 0.5 * pixelsPerRow * pixelsPerColumn + 0.5 * pixelsPerRow;

var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = canvas.height / canvas.width * pixelsPerRow,
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
    pixelArray  = imageData.data,
	frameCounter = 1,
	frameRate = 300;

setInterval(mainLoop, 1000 / frameRate);

function mainLoop() {
    for (var i = 0; i < pixelArray.length; i++) { // WRONG this ordering is causing some biasing in the way siphoning works
        redChannelAlgorithm(i);
		// setting blue at a steady value
        pixelArray[i * 4 + 2] = 48;
		// setting alpha to opaque
        pixelArray[i * 4 + 3] = 255;
    }
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    //countFps(5000, 30000);    
    frameCounter++;
}

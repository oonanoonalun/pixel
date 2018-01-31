var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);

function mainLoop() {
    // mix up the array of "target indices"
    if (frameCounter % 90 === 0) initializeIndexArrays();
    for (var i = 0; i < pixelsPerGrid; i++) { // WRONG this ordering is causing some biasing in the way siphoning works
        // add noise
		//pixelArray[index * 4 + 0] += Math.random() * 64 - 32;
        // add lines and things
        var brightness = 0;
        if (frameCounter < 90) brightness += softLines(i, indexArrays[0]);
        brightness += softCircles(i, indexArrays[1]);
        if (frameCounter < 90) brightness /= 2;
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness;
        // equalize
        //if (pixelArray[i * 4 + 0] < 127) pixelArray[i * 4 + 0] += 1;
        //else pixelArray[i * 4 + 0] -= 1;
        // fade
        pixelArray[i * 4 + 0] -= 5;
    }
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    countFps(5000, 30000);    
    frameCounter++;
}

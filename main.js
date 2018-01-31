var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);
function mainLoop() {
    // movement
    pace(entities.linesVert[0], 1, false);
    // mix up entities
    if (frameCounter % 300 === 0) initializeEntities();
    for (var i = 0; i < pixelsPerGrid; i++) {
        // add noise
        pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        // adding lines and things
        var brightness = 0;
        brightness += softLines(i, entities.linesVert, true);
        //brightness += softPoints(i, entities.points);
        //pixelArray[i * 4 + 0] = brightness; // DO NOT REMOVE!!! Makes things smooth and normal
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        // fade
        pixelArray[i * 4 + 0] -= 2;
        // greyscale
        //pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0]
        // equalize
        //if (pixelArray[i * 4 + 0] < 127) pixelArray[i * 4 + 0] += 1;
        //else pixelArray[i * 4 + 0] -= 1;
        //modifyColors(i);
    }
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    //countFps(5, 10);    
    frameCounter++;
}

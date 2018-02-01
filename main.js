var frameRate = 30;
console.log(indexOfCoordinates);
setInterval(mainLoop, 1000 / frameRate);
function mainLoop() {
    var currentMousePosition = relativeMousePosition(canvas);
    entities.points[0].index = indexOfCoordinates[currentMousePosition.x][currentMousePosition.y];
    // movement
    //pace(entities.linesVert[0], 1, false);
    //pace(entities.points[0], 1, true);
    //if (frameCounter % 3 === 0) entities.points[0].index -= pixelsPerRow;
    //else entities.points[0].index--;
    // mix up entities
    if (frameCounter % 300 === 0) initializeEntities();
    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
        // add noise
        pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        // adding lines and things
        //brightness += softLines(i, entities.linesVert, true);
        brightness += softPoints(i, entities.points);
        // adding mouse response
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        // brightness decay
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

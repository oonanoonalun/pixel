var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);
function mainLoop() {
    // scary point shadow
    //if (frameCounter === 1) entities.points[0].brightness = -1768;
    // updating mouse position
    var currentMousePosition = relativeMousePosition(canvas);
    // mouse position is controlling entities.points[1]
    //entities.points[1].x = currentMousePosition.x;
    //entities.points[1].y = currentMousePosition.y;
    
    // updating entity position, speed, and acceleration
    updateEntities(entities.points);
    
    // entity autonomous movement
    chasing(
        entities.points[0], currentMousePosition.x, currentMousePosition.y,
        distanceFromIndexToIndex[entities.points[0].index][currentMousePosition.index] / maxScreenDistance * 30
    );
    //wandering(entities.points[0], 1);
    //pace(entities.linesVert[0], 1, false);
    //pace(entities.points[0], 1, true);

    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        //var brightness = 0;
        // add noise
        pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        // adding lines and things
        //brightness += softLines(i, entities.linesVert, true);
        //brightness += softPoints(i, entities.points);
        softPoints(i, entities.points);
        // apply sum brightness to pixel
        //if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        // brightness decay
        pixelArray[i * 4 + 0] -= 2;
        pixelArray[i * 4 + 1] -= 2;
        //pixelArray[i * 4 + 2] -= 2;
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

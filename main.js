var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);

function mainLoop() {
    // scary point shadow
    //if (frameCounter === 1) entities.points[0].brightness = -1768;
    
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    
    // mouse position is controlling entities.points[1]
    entities.points[1].x = currentMousePosition.x;
    entities.points[1].y = currentMousePosition.y;
    
    // updating entity position, speed, acceleration, and nearest index
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    updateEntities(entities.all);
    
    // entity autonomous movement
    /*chasing(
        entities.points[0], currentMousePosition,
        distanceFromIndexToIndex[entities.points[0].index][currentMousePosition.index] / maxScreenDistance * 30 // chases more aggressively when close to target
    );*/
    /*patrol(
        entities.points[1],
        [
            {index: 0},
            currentMousePosition,
            {index: 1900},
            {index: 171},
            {index: 981},
            {index: 79}
        ]
    );*/
    //wandering(entities.points[0], 1);
    //pace(entities.linesVert[0], 1, false);
    //pace(entities.points[1], 1, false);

    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
        
        // add noise
        pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        
        // entities affect brightness
        brightness += softPoints(i, entities.points);
        //brightness += softLines(i, entities.lines);
        brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index);
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        
        // brightness decay
        pixelArray[i * 4 + 0] -= 3;
        //pixelArray[i * 4 + 1] -= 3;
        //pixelArray[i * 4 + 2] -= 2;
        
        // greyscale
        //pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0]
        
        // equalize
        //if (pixelArray[i * 4 + 0] < 127) pixelArray[i * 4 + 0] += 1;
        //else pixelArray[i * 4 + 0] -= 1;
        
        // apply global color effects
        //modifyColors(i);
    }
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    //countFps(5, 10);    
    frameCounter++;
}

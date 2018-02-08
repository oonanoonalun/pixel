var frameRate = 300;

setInterval(mainLoop, 1000 / frameRate);

// WRONG TEMP JUST FOR TESTING
var rayTargetLine = [],
    rayTargetLineBuffer = [];

function mainLoop() {
    // updating entity position, speed, acceleration, and nearest index
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    // WARNING: anything that happens before updateEntities() in the main loop might be missing information assigned intitially by the
    //      first pass of udpateEntities() (i.e. entities.points[n].index);
    updateEntities(entities.all);
    
    var lines = [buildLine(entities.points[0].index, entities.points[1].index, 1024)];
    /*for (var j = 0; j < pixelsPerRow; j++) {
        lines.push(buildLine(4759, j + 320, 10000));
    }*/
    // WRONG TEMP Just testing.
    rayTargetLineBuffer = [];
    // scary point shadow
    //if (frameCounter === 1) entities.points[0].brightness = -1768;
    
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    
    // mouse position is controlling entities.points[1]
    entities.points[1].x = currentMousePosition.x;
    entities.points[1].y = currentMousePosition.y;
    
    // entity autonomous movement
    /*chasing(
        entities.points[0], currentMousePosition,
        distanceFromIndexToIndex[entities.points[0].index][currentMousePosition.index] / maxScreenDistance * 30 // chases more aggressively when close to target
    );*/
    //chasing(entities.points[0], entities.points[1], 1);
    //wandering(entities.points[0], 1);
    //fleeing(entities.points[1], entities.points[0], 1);
    //wandering(entities.points[1], 1);
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
        //brightness += softPoints(i, entities.points);
        //brightness += softLines(i, entities.lines);
        //brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, false);
        
        // raycasting work
        lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, true);
        brightness += linesFromIndexToArrayOfIndices(i, 4759, rayTargetLine, scaledPixelSize * 10, 1024, true);
        
        //brightness += obstacles(i, entities.obstacles);
        /*for (var k = 0; k < lines.length; k++) {
            var line = lines[k];
            for (var m = 0; m < line.body.length; m++) {
                if (i === line.body[m]) brightness += line.brightness;// / distanceFromIndexToIndex[line.startIndex][line.body[j]];
            }
        }*/
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        
        // brightness decay
        pixelArray[i * 4 + 0] -= 3; // -= 3 is a nice decay rate for a solid afterimage
        //pixelArray[i * 4 + 1] -= 3;
        //pixelArray[i * 4 + 2] -= 2;
        
        // greyscale
        pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0];
        
        // equalize
        //if (pixelArray[i * 4 + 0] < 127) pixelArray[i * 4 + 0] += 1;
        //else pixelArray[i * 4 + 0] -= 1;
        
        // apply global color effects
        //modifyColors(i);
    }
    // WRONG TEMP JUST FOR TESTING
    rayTargetLine = rayTargetLineBuffer;
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    countFps(5, 10);    
    frameCounter++;
}

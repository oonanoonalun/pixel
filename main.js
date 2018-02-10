var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);

// WRONG just testing. Sort of not wrong, but shouldn't be a global var. Should be an array on the spotlight attached to an origin entity.
var beamTargets = [entities.points[1].index];

function mainLoop() {
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    
    controls(4, entities.points[0].spotlight.narrowness, false);
    
    updateSpotlight(entities.points[0], /*entities.points[1].index*/ beamTargets, 384);
    
    // updating entity position, speed, acceleration, nearest index, and child positions
    updateEntities(entities.all);
    
    //WRONG Just testing
    beamTargets = [];
    
    
    // mouse position is controlling entities.points[1]
    //entities.points[1].x = currentMousePosition.x;
    //entities.points[1].y = currentMousePosition.y;
    
    // scary point shadow
    //if (frameCounter === 1) entities.points[0].brightness = -1768;
    
    // keyboard controls entities.points[0]
    
    
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
    
    // looping through each pixel
    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
        
        // WRONG just testing... Sort of not just testing.
        if (distanceFromIndexToIndex[i][entities.points[1].index] < 100) {
            beamTargets.push(i);
        }
        
        
        // add noise
        //pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        
        // entities affect brightness
        brightness += softPoints(i, [entities.points[0]]);
        //brightness += softLines(i, entities.lines);
        //brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, false);
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        
        // blend
        var neighborsBrightness = 0;
        for (var k = 0; k < neighborsOfIndex[i].length; k ++) {
            neighborsBrightness += pixelArray[i * 4 + 0];
        }
        neighborsBrightness /= neighborsOfIndex[i].length + 1;
        brightness += neighborsBrightness;
        
        // brightness decay
        // WRONG, maybe. The logarithmic decay might not look as good as the linear one.
        pixelArray[i * 4 + 0] *= 0.88;//-= 3; // -= 3 is a nice decay rate for a solid afterimage
        pixelArray[i * 4 + 1] *= 0.88;
        //pixelArray[i * 4 + 2] -= 2;
        
        // greyscale
        pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0];
        
        //drawing some stuff in color, after greyscaling
        // drawing entities.points[1]
        //if (i === entities.points[1].index) pixelArray[i * 4 + 1] = 255; 
        
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
    countFps(5, 30);    
    frameCounter++;
}

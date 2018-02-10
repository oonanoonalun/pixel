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
    
    // player controls
    controls(4, entities.points[0].spotlight.narrowness, true);
    
    // player spotlight
    updateSpotlight(entities.points[0], /*entities.points[1].index*/ beamTargets, 384);
    
    // updating entity position, speed, acceleration, nearest index, and child positions
    updateEntities(entities.all);
    
    //WRONG Just testing. Acutally, sort of using this now. Shouldn't be global. Should probably be stored on the spotlight object.
    beamTargets = [];
    
    
    // mouse position is controlling entities.points[1]
    //entities.points[1].x = currentMousePosition.x;
    //entities.points[1].y = currentMousePosition.y;
    
    // scary point shadow
    //if (frameCounter === 1) entities.points[2].brightness = -17600;
    
    
    // entity autonomous movement
    /*chasing(
        entities.points[0], currentMousePosition,
        distanceFromIndexToIndex[entities.points[0].index][currentMousePosition.index] / maxScreenDistance * 30 // chases more aggressively when close to target
    );*/
    //chasing(entities.points[2], entities.points[0], 1);
    //wandering(entities.points[2], 0.1);
    patrol(
        entities.points[2],
        [
            {index: 2400},
            {index: 2479}
        ],
        0.1
    );
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
        ],
        1
    );*/
    //wandering(entities.points[0], 1);
    
    // looping through each pixel
    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
        
        // WRONG just testing... Sort of not just testing.
        // assembling the spotlight target
        if (distanceFromIndexToIndex[i][entities.points[1].index] < 100) {
            if (i % 2 === 0) beamTargets.push(i);
        }
        
        
        // add noise
        //pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        
        // entities affect brightness
        //brightness += softPoints(i, [entities.points[0], entities.points[2]]);
        //brightness += softLines(i, entities.points);
        //brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, false);
        
        
        // Creating a solid block
        if (
            absXDistanceFromIndexToIndex[i][entities.points[2].index] < 300 &&
            absYDistanceFromIndexToIndex[i][entities.points[2].index] < 75
        ) {
            propertiesOfIndex[i].solid = true;
        } else {
            propertiesOfIndex[i].solid = false;
        }
        
        // snow
        // WRONG I think I need to do this right, with entities
        /*var snowflakeIndex = (45 + Math.round(frameCounter % (5 * pixelsPerColumn) / 5) * pixelsPerRow);
        if (pixelArray[snowflakeIndex * 4 + 0]) {
            if (propertiesOfIndex[snowflakeIndex].solid) {
                pixelArray[snowflakeIndex * 4 + 0] += 255;
                effects.snow.stoppedSnowing = true;
            } else if (!effects.snow.stoppedSnowing) {
                pixelArray[snowflakeIndex * 4 + 0] += 96;
            }
        }*/
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 20;
        
        // blend
        // WRONG? Not sure if this is really doing anything at all
        var neighborsBrightness = 0;
        for (var k = 0; k < neighborsOfIndex[i].length; k ++) {
            neighborsBrightness += pixelArray[i * 4 + 0];
        }
        neighborsBrightness /= neighborsOfIndex[i].length + 1;
        brightness += neighborsBrightness;
        
        
        // brightness decay
        // WRONG, maybe. The logarithmic decay might not look as good as the linear one.
        pixelArray[i * 4 + 0] *= 0.75;//-= 3; // -= 3 is a nice decay rate for a solid afterimage. 0.88 is good if going logarithmic
        //pixelArray[i * 4 + 1] *= 0.88;
        //if (pixelArray[i * 4 + 2] > 48) pixelArray[i * 4 + 2] *= 0.88;
        //if (pixelArray[i * 4 + 2] < 48) pixelArray[i * 4 + 2] = 48;
        //pixelArray[i * 4 + 2] -= 2;
        
        // greyscale
        // top way is just a different way to the same thing as the single line with two '=' in it. I just wonder if the two '=' creates a weird connection among vars that I don't want to deal with.
        /*var red = pixelArray[i + 4 + 0];
        pixelArray[i * 4 + 1] = red;
        pixelArray[i * 4 + 2] = red;*/
        pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0];
        
        // this creature a really cool, if somewhat static, effect that I don't understand.
        //pixelArray[1 * 4 + 0] -= (entities.points[0].vy + entities.points[0].vy) * 100 / distanceFromIndexToIndex[i][entities.points[0].index];
        
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

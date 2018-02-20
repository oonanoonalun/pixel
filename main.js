var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);

// TEMP
var beamOrigin = [],
    beamXMag = 0,
    beamYMag = 0;

for (var i = 0; i < 12; i++) {
    beamOrigin.push(perimeterIndices[Math.round(Math.random() * (perimeterIndices.length - 1))]);
}

function mainLoop() {
    var beamVectorMaxMag = 100;
    if (keysDown[KEY_F] && beamXMag < beamVectorMaxMag) beamXMag++;
    //else if (beamXMag > 0) beamXMag--;
    if (keysDown[KEY_S] && beamXMag > -beamVectorMaxMag) beamXMag--;
    //else if (beamXMag < 0) beamXMag++;
    if (keysDown[KEY_D] && beamYMag < beamVectorMaxMag) beamYMag++;
    //else if (beamYMag > 0) beamYMag--;
    if (keysDown[KEY_E] && beamYMag > -beamVectorMaxMag) beamYMag--;
    //else if (beamYMag < 0) beamYMag++;
    // TEMP moving beam origin
    /*if (frameCounter % 10 === 0) {
        for (let i = 0; i < beamOrigin.length; i++) {
            beamOrigin[i]++;
        }
    }*/
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    
    
    // player spotlight
    //castSpotlight(entities.points[0], entities.points[1].index, 0);
    
    // player controls
    //controls(4, entities.points[0].spotlight.narrowness);
    //controlsPlatformer(1, 6, entities.points[0].spotlight.narrowness, false);
    
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
        entities.points[3],
        [
            {index: 39 + 30 * pixelsPerRow},
            {index: 4759}
        ],
        0.3
    );
    //if (entities.points[3].y < 50) entities.points[3].dy += 0.3;
    //if (entities.points[3].y > 550) entities.points[3].dy -= 0.3;
    //fleeing(entities.points[1], entities.points[0], 1);
    
    // TEMP platformer wandering spotlight
    // NOTE: Should maybe have a "justX/Y" option for wandering()
    wandering(entities.points[2], 3);
    //castSpotlight(entities.points[2], entities.points[1].index, 0);
    //castBeamOrthogonally(entities.points[2], 'right', 2, 2048, 0);
    
    // points 2 casts beam in direction it's facing
    //castBeam(entities.points[2].index, entities.points[2].vx, entities.points[2].vy, 3, 2048, 0);
    
    // points 2 casts beam
    /*castBeam(
        entities.points[2].index,
        xDistanceFromIndexToIndex[entities.points[2].index][entities.points[1].index],
        yDistanceFromIndexToIndex[entities.points[2].index][entities.points[1].index],
        8, 2048, 0
    );*/
    
    if (beamOrigin.length > 0) {
        castBeamFromIndexArray(
            beamOrigin,
            beamXMag,
            beamYMag,
            //xDistanceFromIndexToIndex[beamOrigin[beamOrigin.length / 2 - beamOrigin.length / 2 % 1]][entities.points[1].index],
            //yDistanceFromIndexToIndex[beamOrigin[beamOrigin.length / 2 - beamOrigin.length / 2 % 1]][entities.points[1].index],
            64
        );
    }
    
    entities.points[2].y = coordinatesOfIndex[pixelsPerRow * 10].y; // light is locked on y axis near the screen's top
    //entities.points[2].y -= 2; // light tries to stay high
    //if (entities.points[2].index < pixelsPerRow) entities.points[2].y += 3; // but moves done if in the top row
    wandering(entities.points[1], 2);
    //chasing(entities.points[1], entities.points[0], 1);
    //entities.points[1].x = entities.points[2].x; // target stays directly under spotlight
    // WRONG: All the behavior above should be in a function called "behavior"
    entities.points[1].y = coordinatesOfIndex[pixelsPerGrid - pixelsPerRow].y; // target point stays on the bottom row
    
    
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
    buildMap();
    // updating entity position, speed, acceleration, nearest index, and child position
    updateEntities(entities.all);
    processEachPixel();
    // just testing
    //pixelArray[2440 * 4 + 0] = 255;
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    // log the average frames per second
    //countFps(5, 30);    
    // increment the frame counter (everything in each interation of the main loop should be counted as being in the same frame).
    //      frameCounter starts at 1 so that all initialization before the mainLoop() runs counts as being in frame 1.
    frameCounter++;
}

function buildMap() {
    if (frameCounter === 1 || (keysDown[KEY_SHIFT] && keysDown[KEY_G])) {
        // TEMP Random beam origins
        for (var i = 0; i < 12; i++) {
            beamOrigin.push(perimeterIndices[Math.round(Math.random() * (perimeterIndices.length - 1))]);
        }
        //platOfIndex = dummyFalseArray; // WRONG: why don't these work?
        //solidOfIndex = dummyFalseArray;
        //beamOrigin = [];
        beamXMag = Math.random();
        beamYMag = Math.random();
        for (let i = 0; i < pixelsPerGrid; i++) {
            platOfIndex[i] = false;
            solidOfIndex[i] = false;
        }
        var numberOfBlocks = 15,
            blockSize = 6;
        for (var i = 0; i < numberOfBlocks; i++) {
            var blockUpperLeft = Math.round(Math.random() * (pixelsPerGrid - 1));
            for (var j = 0; j < blockSize; j++) { // could be blockWidth/column
                for (var k = 0; k < blockSize; k++) { // could be blockHeight/row
                    if (blockUpperLeft + j + k * pixelsPerRow < pixelsPerGrid) {
                        platOfIndex[blockUpperLeft + j + k * pixelsPerRow] = true;
                        // assigning random block cells as beam origins
                        //if (Math.random() < 0.15 && beamOrigin.length < 12) beamOrigin.push(blockUpperLeft + j + k * pixelsPerRow);
                    }
                }
            }
        }        
    }
}

function processEachPixel() {
    for (var i = 0; i < pixelsPerGrid; i++) {
        ///////////////////
        // draw pixels
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
        
        //if (i === 0 && frameCounter % 15 === 0) console.log(platOfIndex);
        // bright plats are solid, dim ones aren't
        
        
        if (platOfIndex[i] && pixelArray[i * 4 + 0] > 127) solidOfIndex[i] = true;
        // WRONG WTF this next line makes nothing draw and I have no idea why
        //else solidOfIndex[i] = false;
        if (platOfIndex[i]) {
            brightness += 40;
        }
 
        // add noise
        // WARNING: Remember that this is an extra 4800 function calls (Math.random()) per frame.
        //pixelArray[i * 4 + 0] += Math.random() * 8 - 4;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        
        // entities affect brightness
        //brightness += softPoints(i, [entities.points[0]]);
        //brightness += softLines(i, entities.points);
        //brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, false);
        
        // blend
        var screenFxBlend = true;
        if (screenFxBlend) {
            // WRONG: This averages the brightness of neighbors from LAST FRAME if they haven't been updated this frame yet,
            //      or the brightness of neighbors from THIS FRAME if they have.
            // FIXED/no longer true: NOTE: neighbors' influence is NOT weighted by distance, but wouldn't be too hard to
            var neighborsBrightness = 0,
                blendRadius = 2; // in cells. 24 is max
            for (var k = 0; k < neighborsOfIndexInRadius[i][blendRadius].length; k ++) {
                let neighborIndex = neighborsOfIndexInRadius[i][blendRadius][k];
                neighborsBrightness += (
                    pixelArray[neighborIndex * 4 + 0] /
                    (distanceFromIndexToIndex[neighborIndex][i] + 1)
                );
            }
            neighborsBrightness /= neighborsOfIndexInRadius[i][blendRadius].length;
            //if (i === centerIndex && frameCounter % 15 === 0) console.log('brightness before blending', brightness.toFixed(0));
            brightness += neighborsBrightness;
            //if (i === centerIndex && frameCounter % 15 === 0) console.log('brightness after blending', brightness.toFixed(0));
        }
        
        // apply sum brightness to pixel red channel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 5;
        
        // color or greyscale
        // includes brightness decay
        var screenFxGreyscale = true,
            brightnessDecayScale = 0.92;
        if (!screenFxGreyscale) { // color
            // RGB all fade, but blue bottoms out at 48 
            var screenBlueBase = 48;
            pixelArray[i * 4 + 0] *= brightnessDecayScale;
            pixelArray[i * 4 + 1] *= brightnessDecayScale;
            if (pixelArray[i * 4 + 2] > screenBlueBase) pixelArray[i * 4 + 2] *= brightnessDecayScale;
            if (pixelArray[i * 4 + 2] < screenBlueBase) pixelArray[i * 4 + 2] = screenBlueBase;
        } else { // greyscale
            // brighness decay
            pixelArray[i * 4 + 0] *= brightnessDecayScale;
            // make red grey
            pixelArray[i * 4 + 1] = pixelArray[i * 4 + 0];
            pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0];
        }
        //pixelArray[i * 4 + 0] = 255;
        
        // draw everything .solid in green
        //if (propertiesOfIndex[i].solid === true) pixelArray[i * 4 + 1] = 255;

        // this creature a really cool, if somewhat static, effect that I don't understand.
        // shoot, it's not doing it anymore [head scratching]
        //pixelArray[1 * 4 + 0] -= (entities.points[0].vy + entities.points[0].vy) * 100 / distanceFromIndexToIndex[i][entities.points[0].index];
        
        // some acceleration-based color shifts
        /*var absDx = entities.points[0].dx,
            absDy = entities.points[0].dy;
        if (absDx < 0) absDx = -absDx;
        if (absDy < 0) absDy = -absDy;
        pixelArray[i * 4 + 0] -= ((absDx + absDy) / 1) * 50 / (distanceFromIndexToIndex[entities.points[0].index][i] / 8);
        pixelArray[i * 4 + 1] += absDx * 50 / (distanceFromIndexToIndex[entities.points[0].index][i] / 8);
        pixelArray[i * 4 + 2] += absDy * 50 / (distanceFromIndexToIndex[entities.points[0].index][i] / 8);
        
        
        // some dynamic background patterns
        if (i % (entities.points[0].dx * 5) < entities.points[0].dy * 4) pixelArray[i * 4 + 1] += 5;
        if (i % (entities.points[0].dy * 7) < entities.points[0].dx * 5) pixelArray[i * 4 + 2] += 10;*/
        
        // scaling some colors based on other colors
        //pixelArray[i * 4 + 0] += pixelArray[i * 4 + 1] * 0.2;
        //pixelArray[i * 4 + 0] += pixelArray[i * 4 + 2] * 0.2;
        
        //drawing some stuff in color, after greyscaling
        // drawing entities.points[1]
        //if (i === entities.points[1].index) pixelArray[i * 4 + 1] = 255; 
        
        // wallpapers
        //if (i % 37 < 21 && i % 16 > 9) pixelArray[i * 4 + 1] -= 64;
        /*if (i % 16 < 3) {
            if (xDistanceFromIndexToIndex[i][entities.points[2].index] % 19 < 7) {
                pixelArray[i * 4 + 0] += entities.points[2].y / 35;
            } else {
                pixelArray[i * 4 + 0] += frameCounter % 32 - (entities.points[0].vx + entities.points[1].vy);
            }
        }*/
        
        // equalize
        //if (pixelArray[i * 4 + 0] < 127) pixelArray[i * 4 + 0] += 5;
        //else pixelArray[i * 4 + 0] -= 5;
        
        // apply global color effects
        //modifyColors(i);
    }
}

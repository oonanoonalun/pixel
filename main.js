var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);
    
function mainLoop() {
    // TEMP generate ad-hoc platforming map
    if ((keysDown[KEY_G] && keysDown[KEY_SHIFT]) || frameCounter === 1) {
        for (var mg = 0; mg < pixelsPerGrid; mg++) { // i.e. 'mg' = map generation
            // clear old daya
            propertiesOfIndex[mg].plat = false;
            propertiesOfIndex[mg].solid = false;
            // higher chance of being solid if cell to left is a platform
            if (mg - 1 >= 0 && propertiesOfIndex[mg - 1].plat) {
                if (Math.random() < 0.75) propertiesOfIndex[mg].plat = true;
            }
            // if cell to left is empty, small chance of being a platform
            else if (Math.random() < 0.005) {
                propertiesOfIndex[mg].plat = true;
            }
            // solid perimeter
            if (propertiesOfIndex[mg].perimeter) propertiesOfIndex[mg].solid = true;
            // block at bottom center
            if (
                coordinatesOfIndex[mg].x > 350 &&
                coordinatesOfIndex[mg].x < 450 &&
                coordinatesOfIndex[mg].y > 700
            ) propertiesOfIndex[mg].plat = true;
        }
    }
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    
    
    // player spotlight
    //castSpotlight(entities.points[0], entities.points[1].index, 0);
    
    // updating entity position, speed, acceleration, collision, nearest index, and child position
    updateEntities(entities.all);
    
    // player controls
    //controls(4, entities.points[0].spotlight.narrowness);
    controlsPlatformer(2, 12, entities.points[0].spotlight.narrowness, false);
    
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
    /*patrol(
        entities.points[2],
        [
            {index: 39},
            {index: 4759}
        ],
        0.1
    );*/
    //fleeing(entities.points[1], entities.points[0], 1);
    
    // TEMP platformer wandering spotlight
    // NOTE: Should maybe have a "justX/Y" option for wandering()
    wandering(entities.points[2], 2);
    castSpotlight(entities.points[2], entities.points[1].index, 0);
    entities.points[2].vy -= 3; // light tries to stay high
    wandering(entities.points[1], 2);
    //entities.points[1].x = entities.points[2].x; // target stays directly under spotlight
    entities.points[1].y = coordinatesOfIndex[pixelsPerGrid + 1 - pixelsPerRow].y; // target point stays on the bottom row
    
    
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
    
    // looping over each pixel
    for (var i = 0; i < pixelsPerGrid; i++) {
        // a fraction of the brightness will be applied to pixel if the pixel is dimmer than the brightness
        var brightness = 0;
 
        // add noise
        // WARNING: Remember that this is an extra 4800 function calls (Math.random()) per frame.
        //pixelArray[i * 4 + 0] += Math.random() * 8 - 4;
        //pixelArray[i * 4 + 1] += Math.random() * 16 - 8;
        
        // entities affect brightness
        //brightness += softPoints(i, [entities.points[0]]);
        //brightness += softLines(i, entities.points);
        //brightness += lineFromIndexToIndex(i, entities.points[0].index, entities.points[1].index, 7680, false);
        
        // blend
        screenFxBlend = true;
        if (screenFxBlend) {
            // NOTE: neighbors' influence is NOT weighted by distance, but wouldn't be to hard to
            var neighborsBrightness = 0,
                blendRadius = 2; // in cells
            for (var k = 0; k < neighborsOfIndexInRadius[i][blendRadius].length; k ++) {
                neighborsBrightness += pixelArray[neighborsOfIndexInRadius[i][blendRadius][k] * 4 + 0];
            }
            neighborsBrightness /= neighborsOfIndexInRadius[i][blendRadius].length + 1;
            //if (i === centerIndex && frameCounter % 15 === 0) console.log('brightness before blending', brightness.toFixed(0));
            brightness += neighborsBrightness;
            //if (i === centerIndex && frameCounter % 15 === 0) console.log('brightness after blending', brightness.toFixed(0));
        }
        
        // apply sum brightness to pixel
        if (pixelArray[i * 4 + 0] < brightness) pixelArray[i * 4 + 0] += brightness / 5;
        
        
        // TEMP platforming experiment
        if (propertiesOfIndex[i].plat && brightness > 128 && i !== entities.points[0].index) {
            propertiesOfIndex[i].solid = true;
            pixelArray[i * 4 + 1] = 255;
        } else {
            if (!propertiesOfIndex[i].perimeter) propertiesOfIndex[i].solid = false;
        }
        if (i === entities.points[0].index) pixelArray[i * 4 + 1] = 255;
        if (propertiesOfIndex[i].solid) pixelArray[i * 4 + 2] = 255;
        
        // brightness decay
        var brightnessDecayScale = 0.92;//0.82; // brightness is this amount of its value last frame
        pixelArray[i * 4 + 0] *= brightnessDecayScale;
        
        // color or greyscale
        var screenFxGreyscale = false;
        if (!screenFxGreyscale) { // color
            var screenBlueBase = 48;
            pixelArray[i * 4 + 1] *= brightnessDecayScale;
            if (pixelArray[i * 4 + 2] > screenBlueBase) pixelArray[i * 4 + 2] *= brightnessDecayScale;
            if (pixelArray[i * 4 + 2] < screenBlueBase) pixelArray[i * 4 + 2] = screenBlueBase;
        } else { // greyscale
            pixelArray[i * 4 + 1] = pixelArray[i * 4 + 2] = pixelArray[i * 4 + 0];
        }
        
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
    // draw pixelArray
    context.putImageData(imageData, 0, 0);
    // scale pixelArray up to canvas size
    context.drawImage(canvas, 0, 0, pixelsPerRow, pixelsPerColumn, 0, 0, canvas.width, canvas.height);
    //countFps(5, 30);    
    frameCounter++;
}

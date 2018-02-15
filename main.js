/*Order things need to happen in:
 *
 *1. map is built
 *2. Illumination makes things solid or not
 *3. entities move
 *4. collision
 *5. drawing
 *
 */

var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);
    
function mainLoop() {
    // updating mouse position
    currentMousePosition = relativeMousePosition(canvas);
    // WARNING: when I start filtering entity arrays, it's not going to be awesome that
    //      the entities are in two arrays (entities.lines/point and entitiies.all);
    //      Maybe ask Chris about this.
    
    
    // player spotlight
    //castSpotlight(entities.points[0], entities.points[1].index, 0);
    
    // player controls
    //controls(4, entities.points[0].spotlight.narrowness);
    controlsPlatformer(1, 6, entities.points[0].spotlight.narrowness, false);
    
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
    
    entities.points[2].y = coordinatesOfIndex[pixelsPerRow * 10].y; // light is locked on y axis near the screen's top
    //entities.points[2].y -= 2; // light tries to stay high
    //if (entities.points[2].index < pixelsPerRow) entities.points[2].y += 3; // but moves done if in the top row
    wandering(entities.points[1], 2);
    //chasing(entities.points[1], entities.points[0], 1);
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
    // WRONG, maybe: Right now, both buildMap() and drawEachPixel() loop over every index.
    //      They used to both be one function called processEachPixel(), but getting collision with moving map elements
    //      was easier/possible with updateEntities() coming between the two.
    buildMap();
        drawEachPixel();
    //interiorCollision(); // WRONG: this is actually just handing the case of the map building solidness over the player. If this works, it could be integrated with updateEntities
    // updating entity position, speed, acceleration, nearest index, and child position
    updateEntities(entities.all);
    // TEMP/WRONG, maybe
    // clear the map's array of indices that should be platforms or solid before reassigning them during processEachPixel
    map.platIndices = [];
    map.solidIndices = [];
    
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
    // looping over each pixel
    for (var i = 0; i < pixelsPerGrid; i++) {
        // TEMP? For now, wiping properties each frame
        propertiesOfIndex[i].plat = false;
        propertiesOfIndex[i].solid = false;
        propertiesOfIndex[i].notLightSensitive = false;
        
        // TEMP generate ad-hoc platforming map
        // WRONG maybe shouldn't clear and reassign .solid and .plat properties each frame?
        /*if ((keysDown[KEY_G] && keysDown[KEY_SHIFT]) || frameCounter === 1) {
            // clear old data
            propertiesOfIndex[i].plat = false;
            propertiesOfIndex[i].solid = false;
            propertiesOfIndex[i].notLightSensitive = false;
            // making some blocks
            var blockWidth = 7,
                blockHeight = 7;
            // WRONG .push() function calls and Math.random()
            if (Math.random() < 0.002) {
                var isPermanentlySolid = false;
                if (Math.random() < 0.3) isPermanentlySolid = false; // MAKE THIS TRUE TO GET SOME PERMANENTLY SOLID BLOCKS
                for (var bw = 0; bw < blockWidth; bw++) {
                    for (var bh = 0; bh < blockHeight; bh++) {
                        if (i + bh * pixelsPerRow < pixelsPerGrid) {
                            if (!isPermanentlySolid) map.platIndices.push(i + bw + bh * pixelsPerRow);
                            else map.solidIndices.push(i + bw + bh * pixelsPerRow);
                        }
                    }
                }
            }
            for (var pi = 0; pi < map.platIndices.length; pi++) { // i.e. = platform index
                if (i === map.platIndices[pi]) propertiesOfIndex[i].plat = true;
            }
            for (var si = 0; si < map.solidIndices.length; si++) { // i.e. = solid index
                if (i === map.solidIndices[si]) propertiesOfIndex[i].solid = true;
                if (i === map.solidIndices[si]) propertiesOfIndex[i].notLightSensitive = true;
            }
            // solid perimeter
            if (propertiesOfIndex[i].perimeter) {
                propertiesOfIndex[i].solid = true;
                propertiesOfIndex[i].notLightSensitive = true;
            }
            // permanently solid blocks
            if (
                coordinatesOfIndex[i].x > 350 &&
                coordinatesOfIndex[i].x < 450 &&
                coordinatesOfIndex[i].y > 500
            ) {
                propertiesOfIndex[i].solid = true;
                propertiesOfIndex[i].notLightSensitive = true;
            }
            // BROKEN Not working to clear space around player, but not worth fussing with right now
            if (distanceFromIndexToIndex[entities.points[0].index][i] < 100) propertiesOfIndex.solid = false;
        }*/
        
        // moving box
        var boxWidth = 12,
            boxHeight = 12;
        if (
            absXDistanceFromIndexToIndex[i][entities.points[3].index] < boxWidth / 2 * scaledPixelSize &&
            absYDistanceFromIndexToIndex[i][entities.points[3].index] < boxHeight / 2 * scaledPixelSize
        ) {
            propertiesOfIndex[i].solid = true;
            propertiesOfIndex[i].notLightSensitive = true;
        }
        
        // static box
        var sBoxWidth = 12,
            sBoxHeight = 12;
        if (
            absXDistanceFromIndexToIndex[i][pixelsPerGrid - 7 * pixelsPerRow] < sBoxWidth / 2 * scaledPixelSize &&
            absYDistanceFromIndexToIndex[i][pixelsPerGrid - 7 * pixelsPerRow] < sBoxHeight / 2 * scaledPixelSize
        ) {
            propertiesOfIndex[i].solid = true;
            propertiesOfIndex[i].notLightSensitive = true;
        }
        
        // out two cell-widths solid. avoiding interections with the perimeter because I've got something set up weird with regard to interacting with it
        for (var p = 0; p < perimeterIndices.length; p++) {
            if (distanceFromIndexToIndex[perimeterIndices[p]][i] < scaledPixelSize * 2) {
                propertiesOfIndex[i].solid = true;
                propertiesOfIndex[i].notLightSensitive = true;
            }
        }
    }
}

function drawEachPixel() {
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
        // indices with property .plat turn solid when they're bright enough, then go un-solid when dark
        if (propertiesOfIndex[i].plat && brightness > 128 && i !== entities.points[0].index) {
            propertiesOfIndex[i].solid = true;
            pixelArray[i * 4 + 1] = 255;
        } else {
            if (!propertiesOfIndex[i].notLightSensitive) propertiesOfIndex[i].solid = false;
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
}

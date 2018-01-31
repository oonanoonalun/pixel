var frameRate = 30;

setInterval(mainLoop, 1000 / frameRate);
var isIndexMovingUp = true; // hideous kludge
function mainLoop() {
    // mix up the array of "target indices"
    if (frameCounter % 60 === 0) initializeIndexArrays();
    // some KLUDGY movement
    // circle
    if (indexArrays[1][0] >= pixelsPerRow && isIndexMovingUp) {
        indexArrays[1][0] -= pixelsPerRow;
    }
    else isIndexMovingUp = false;
    if (!isIndexMovingUp &&indexArrays[1][0] < pixelsPerGrid - pixelsPerRow) indexArrays[1][0] += pixelsPerRow;
    else isIndexMovingUp = true;
    
    for (var i = 0; i < pixelsPerGrid; i++) {
        // add noise
        pixelArray[i * 4 + 0] += Math.random() * 16 - 8;
        // add lines and things
        var brightness = 0;
        brightness += softLines(i, indexArrays[0]);
        brightness += softCircles(i, indexArrays[1]);
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
    countFps(5000, 30000);    
    frameCounter++;
}

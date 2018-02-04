function modifyColors(index) {
	if (pixelArray[index * 4 + 0] > 127) {
		pixelArray[index * 4 + 2] = pixelArray[index * 4 + 1] = (
			(pixelArray[index * 4 + 0] - 127) * 2
		);
	}
}

// WRONG this is totally aborted and doesn't make any sense. Possible do something with it later after neighbors are defined
// it's just supposed to average the pixels color with that of those around it.
function blend(index) {
	var brightness = pixelArray[index * 4 + 0];
	brightness += pixelArray[index * 4 + 0 - 1];
	brightness += pixelArray[index * 4 + 0 + 1];
	brightness += pixelArray[index * 4 + 0 + pixelsPerRow];
	brightness += pixelArray[index * 4 + 0 - pixelsPerRow];
	brightness += pixelArray[index * 4 + 0 + pixelsPerRow + 1];
	brightness += pixelArray[index * 4 + 0 + pixelsPerRow - 1];
	brightness += pixelArray[index * 4 + 0 - pixelsPerRow + 1];
	brightness += pixelArray[index * 4 + 0 - pixelsPerRow - 1];
}
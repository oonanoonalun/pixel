function modifyColors(index) {
	if (pixelArray[index * 4 + 0] > 127) {
		pixelArray[index * 4 + 2] = pixelArray[index * 4 + 1] = (
			(pixelArray[index * 4 + 0] - 127) * 2
		);
	}
}

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
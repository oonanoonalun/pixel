function modifyColors(index) {
	if (pixelArray[index * 4 + 0] > 127) {
		pixelArray[index * 4 + 2] = pixelArray[index * 4 + 1] = (
			(pixelArray[index * 4 + 0] - 127) * 2
		);
	}
}

function redChannelAlgorithm(index) {
    if (keysDown[KEY_SPACE]) pixelArray[index * 4 + 0] = (
		255 - distanceFromIndexToIndex[centerIndex][index] * 5
    );
	else pixelArray[index * 4 + 0] = (
		distanceFromIndexToIndex[centerIndex][index] * 5
    );
}

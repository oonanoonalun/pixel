function softLines(currentIndex, entitiesArray) {
	var brightness = 0;
	for (var i = 0; i < entitiesArray.length; i++) {
		brightness += entitiesArray[i].brightnessFront / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		brightness += entitiesArray[i].brightnessBack / -xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		//else brightness -= entitiesArray[i].brightness / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
	}
	return brightness;
}

function obstacles(currentIndex, entitiesArray) {
	var brightness = 0;
	for (var i = 0; i < entitiesArray.length; i++) {
		if (distanceFromIndexToIndex[currentIndex][entitiesArray[i].index] <= entitiesArray[i].radius) {
			brightness -= 128;
			//pixelArray[currentIndex * 4 + 1] = 127;
		}
	}
	return brightness;
}

function softPoints(currentIndex, entitiesArray) {
	var brightness = 0;
    for (var i = 0; i < entitiesArray.length; i++) {
		brightness += entitiesArray[i].brightness /
		distanceFromIndexToIndex[currentIndex][indexOfCoordinates[entitiesArray[i].x][entitiesArray[i].y]];
		/*if (i === 0) {
			if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
		}
		if (i === 1) {
			if (pixelArray[currentIndex * 4 + 1] < brightness) pixelArray[currentIndex * 4 + 1] += brightness / 20;
		}
		if (i > 1) {
			if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
		}*/
	}
	//if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
	return brightness;
}

// OLD but maybe worth keeping for now
function modifyColors(index) {
	if (pixelArray[index * 4 + 0] > 127) {
		pixelArray[index * 4 + 2] = pixelArray[index * 4 + 1] = (
			(pixelArray[index * 4 + 0] - 127) * 2
		);
	}
}
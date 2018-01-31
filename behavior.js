var indexArrays = [];
initializeIndexArrays();

function initializeIndexArrays() {
	indexArrays = [[], []];
	for (var i = 0; i < 3; i++) {
		indexArrays[0].push(Math.round(Math.random() * pixelsPerGrid - 1));
	}
	for (var j = 0; j < 3; j++) {
		indexArrays[1].push(Math.round(Math.random() * pixelsPerGrid - 1));
	}
}

function softLines(index, indexArray) {
	var brightness = 0;
	for (var i = 0; i < indexArray.length; i++) {
		// WRONG don't know why these aren't going to the left sometimes
		brightness += 2048 / xDistanceFromIndexToIndex[index][indexArray[i]];
	}
	return brightness /= indexArrays[0].length;
}

function softCircles(index, indexArray) {
	var brightness = 0;
    for (var i = 0; i < indexArray.length; i++) {
		brightness += 2048 / distanceFromIndexToIndex[index][indexArray[i]];
	}
	return brightness /= indexArrays[0].length;
}

function circleIntersections(index, indexArray) {
	// circles based on random indices
	for (var i = 0; i < indexArray.length; i++) {
		if (i % 2 === 0) pixelArray[index * 4 + 0] += distanceFromIndexToIndex[index][indexArray[i]] / (maxScreenDistance / 5);
		else pixelArray[index * 4 + 0] -= distanceFromIndexToIndex[index][indexArray[i]] / (maxScreenDistance / 5);
	}
}

var distanceFromIndexToIndex = [],
	xDistanceFromIndexToIndex = [],
	yDistanceFromIndexToIndex = [],
	coordinatesOfIndex = [], // WRONG: NOT DONE OR USED
	indexOfCoordinates = [],
	indexNeighbors = [], // WRONG: NOT DONE OR USED
	centerIndex = 0.5 * pixelsPerRow * pixelsPerColumn + 0.5 * pixelsPerRow,
	maxScreenDistance;

initializeXDistancesFromIndexToIndex();
initializeYDistancesFromIndexToIndex();
initializeDistancesFromIndexToIndex();
initializeIndexOfCoordinates();
//initializeIndexNeighbors(); // WRONG: NOT DONE OR WORKING
maxScreenDistance = distanceFromIndexToIndex[0][pixelsPerGrid - 1];

function initializeCoordinatesOfIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		/*coordinatesOfIndex.push(
			[
				i % pixelsPerRow / pixelsPerRow * canvas.width,
				i / pixelsPerColumn
			]
		);*/
	}
}

function initializeIndexOfCoordinates() {
	for (var i = 0; i < canvas.width; i++) {
		indexOfCoordinates.push([]);
		for (var j = 0; j < canvas.height; j++) {
			indexOfCoordinates[i].push(
				Math.round(
					i / canvas.width * (pixelsPerRow - 1) +
					Math.floor(j / canvas.height * pixelsPerColumn) * pixelsPerRow
				)
			);
		}
	}
}

function initializeIndexNeighbors() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		if (i + 1 >= 0 && i + 1 < pixelsPerGrid) { // to the right
			// i.e. push to neighborsOfIndex[i].all
			// neighborsOfIndex[i].right = i + 1
			// etc.
		}
		if (i - 1 >= 0 && i - 1 < pixelsPerGrid) { // to the left
			
		}
		if (i + pixelsPerRow >= 0 && i + pixelsPerRow < pixelsPerGrid) { // below
			
		}
		if (i - pixelsPerRow >= 0 && i - pixelsPerRow < pixelsPerGrid) { // above
			
		}
		if (i + 1 >= 0 && i - 1 < pixelsPerGrid) {
			
		}
		if (i + 1 >= 0 && i - 1 < pixelsPerGrid) {
			
		}
		if (i + 1 >= 0 && i - 1 < pixelsPerGrid) {
			
		}
		if (i + 1 >= 0 && i - 1 < pixelsPerGrid) {
			
		}
	}
}

function initializeXDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		xDistanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			xDistanceFromIndexToIndex[i].push(
				j % pixelsPerRow - i % pixelsPerRow
			);
		}
	}
}

function initializeYDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		yDistanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			yDistanceFromIndexToIndex[i].push(
				(j - j % pixelsPerRow) / pixelsPerRow - (i - i % pixelsPerRow) / pixelsPerRow
			);
		}
	}
}

function initializeDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		distanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			distanceFromIndexToIndex[i].push(
				Math.sqrt(
				    xDistanceFromIndexToIndex[i][j] * xDistanceFromIndexToIndex[i][j] +
					yDistanceFromIndexToIndex[i][j] * yDistanceFromIndexToIndex[i][j]
				)
			);
		}
	}
}

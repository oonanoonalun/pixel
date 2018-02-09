var distanceFromIndexToIndex = [],
	xDistanceFromIndexToIndex = [],
	absXDistanceFromIndexToIndex = [],
	yDistanceFromIndexToIndex = [],
	absYDistanceFromIndexToIndex = [],
	coordinatesOfIndex = [],
	indexOfCoordinates = [],
	//allIndexToIndexDistances = [], // WRONG: Too slow to process. index-to-index distances
	indexNeighbors = [], // WRONG: NOT DONE OR USED
	centerIndex = 0.5 * pixelsPerRow * pixelsPerColumn + 0.5 * pixelsPerRow,
	maxScreenDistance;

initializeXDistancesFromIndexToIndex();
initializeAbsXDistancesFromIndexToIndex();
initializeYDistancesFromIndexToIndex();
initializeAbsYDistancesFromIndexToIndex();
initializeDistancesFromIndexToIndex();
//initializeAllIndexToIndexDistances(); // WRONG: too slow to process
initializeIndexOfCoordinates();
initializeCoordinatesOfIndex();
//initializeIndexNeighbors(); // WRONG: NOT DONE OR WORKING
maxScreenDistance = distanceFromIndexToIndex[0][pixelsPerGrid - 1];

initializeEntities(); // this has to happen after indexOfCoordinates[][] is initialized.

// WRONG: too slow to process
function initializeAllIndexToIndexDistances() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		allIndexToIndexDistances.push([]);
		console.log(i);
		for (var j = 0; j < pixelsPerGrid; j++) {
			allIndexToIndexDistances[i].push(
				{
					'x': xDistanceFromIndexToIndex[i][j],
					'absx': xDistanceFromIndexToIndex[i][j], // absolute value of x distance
					'y': yDistanceFromIndexToIndex[i][j],
					'absy': yDistanceFromIndexToIndex[i][j],
					'd': distanceFromIndexToIndex[i][j]
				}
			);
			if (allIndexToIndexDistances[i][j].absx < 0) allIndexToIndexDistances[i][j].absx = -allIndexToIndexDistances[i][j].absx;
			if (allIndexToIndexDistances[i][j].absy < 0) allIndexToIndexDistances[i][j].absy = -allIndexToIndexDistances[i][j].absy;
		}
	}
}

function initializeCoordinatesOfIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		coordinatesOfIndex.push({
			'x': i % pixelsPerRow * scaledPixelSize + 0.5 * scaledPixelSize,
			'y': Math.floor(i / pixelsPerRow) * scaledPixelSize + 0.5 * scaledPixelSize
		});
	}
}

function initializeIndexOfCoordinates() {
	// send this [xCoordinate][yCoordinate]
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

// WRONG doesn't do anything and is incomplete
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
				j % pixelsPerRow * scaledPixelSize - i % pixelsPerRow * scaledPixelSize
			);
		}
	}
}

function initializeAbsXDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		absXDistanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			var absXDistance = xDistanceFromIndexToIndex[i][j];
			if (absXDistance < 0) absXDistance = -absXDistance;
			absXDistanceFromIndexToIndex[i].push(absXDistance);
		}
	}
}

function initializeYDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		yDistanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			yDistanceFromIndexToIndex[i].push(
				(j - j % pixelsPerRow) / pixelsPerRow * scaledPixelSize - (i - i % pixelsPerRow) / pixelsPerRow * scaledPixelSize
			);
		}
	}
}

function initializeAbsYDistancesFromIndexToIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		absYDistanceFromIndexToIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			var absYDistance = yDistanceFromIndexToIndex[i][j];
			if (absYDistance < 0) absYDistance = -absYDistance;
			absYDistanceFromIndexToIndex[i].push(absYDistance);
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

var distanceFromIndexToIndex = [],
	xDistanceFromIndexToIndex = [],
	absXDistanceFromIndexToIndex = [],
	yDistanceFromIndexToIndex = [],
	absYDistanceFromIndexToIndex = [],
	coordinatesOfIndex = [],
	indexOfCoordinates = [],
	neighborsOfIndex = [],
	propertiesOfIndex = [],
	perimeterIndices = [],
	centerIndex = 0.5 * pixelsPerRow * pixelsPerColumn + 0.5 * pixelsPerRow,
	maxScreenDistance;

initializeDistanceLookupTables();
initializeCoordinatesLookupTables();
initializeMisc();

maxScreenDistance = distanceFromIndexToIndex[0][pixelsPerGrid - 1];

initializeEntities(); // this has to happen after indexOfCoordinates[][] is initialized.



////////////////////////////
// misc. initialization

function initializeMisc() {
	initializeNeighborsOfIndex();
	initializePropertiesOfIndex();
	initializePerimeterIndices();
}

function initializePerimeterIndices() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		// top row minus left and rightmost indices (avoiding duplicating corners)
		if (i < pixelsPerRow - 1 && i > 0) perimeterIndices.push(i);
		// bottom row minus left and rightmost indices (avoiding duplicating corners)
		if (i > pixelsPerGrid - pixelsPerRow && i < pixelsPerGrid - 1) perimeterIndices.push(i);
		// left column
		if (i % pixelsPerRow === 0) perimeterIndices.push(i);
		// right column
		if ((i + 1) % pixelsPerRow === 0) perimeterIndices.push(i);
	}
}

function initializeNeighborsOfIndex() {
	var neighborRadius = 2; // any cell within this radius (in cells) will be considered a neighbor
	for (var i = 0; i < pixelsPerGrid; i++) {
		neighborsOfIndex.push([]);
		for (var j = 0; j < pixelsPerGrid; j++) {
			if (distanceFromIndexToIndex[i][j] < scaledPixelSize * (neighborRadius + 0.4)) neighborsOfIndex[i].push(j);
		}
	}
}

function initializePropertiesOfIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		// a solid block
		if (
			coordinatesOfIndex[i].x > 300 &&
			coordinatesOfIndex[i].x < 500 &&
			coordinatesOfIndex[i].y > 400 &&
			coordinatesOfIndex[i].y < 500
		) {
			propertiesOfIndex.push({
				'solid': true
			});
		} else {
			propertiesOfIndex.push({
				'solid': false
			});
		}
	}
}

// end misc. initialization
//////////////////////////////

//////////////////////////////////////////////
// coordinates lookup tables inititalization

function initializeCoordinatesLookupTables() {
	initializeIndexOfCoordinates();
	initializeCoordinatesOfIndex();
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

// end coordinates lookup tables initialization
//////////////////

//////////////////
// distance lookup tables initialization

function initializeDistanceLookupTables() {
	initializeXDistancesFromIndexToIndex();
	initializeAbsXDistancesFromIndexToIndex();
	initializeYDistancesFromIndexToIndex();
	initializeAbsYDistancesFromIndexToIndex();
	initializeDistancesFromIndexToIndex();
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

// end distance lookup tables initialization
////////////////////////

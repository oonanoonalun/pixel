var distanceFromIndexToIndex = [],
	xDistanceFromIndexToIndex = [],
	absXDistanceFromIndexToIndex = [],
	yDistanceFromIndexToIndex = [],
	absYDistanceFromIndexToIndex = [],
	coordinatesOfIndex = [],
	indexOfCoordinates = [],
	neighborsOfIndexInRadius = [],
	propertiesOfIndex = [],
	perimeterIndices = [],
	//perimeterNeighborsInRadiusOfPerimeterIndex = []; // not real yet
	centerIndex = 0.5 * pixelsPerRow * pixelsPerColumn + 0.5 * pixelsPerRow,
	maxNeighborRadius = 24, // used by neighborsOfIndexInRadius[index][radius]. Too big will make the program hangup indefinitely during initialization.
	maxScreenDistance;

initializeDistanceLookupTables();
maxScreenDistance = distanceFromIndexToIndex[0][pixelsPerGrid - 1];
initializeCoordinatesLookupTables();
initializeMisc();



initializeEntities(); // this has to happen after indexOfCoordinates[][] is initialized.



////////////////////////////
// misc. initialization

function initializeMisc() {
	initializeNeighborsOfIndexInRadius();
	initializePropertiesOfIndex();
	initializePerimeterIndices();
	//initializePerimeterNeighborsInRadiusOfPerimeterIndex(); // not real yet
}

function initializePerimeterIndices() {
	for (var i = 0; i < pixelsPerGrid; i++) {
		// top row minus left and rightmost indices (avoiding duplicating corners)
		if (i < pixelsPerRow - 1 && i > 0) {
			propertiesOfIndex[i].perimeter = true;
			perimeterIndices.push(i);
		}
		// bottom row minus left and rightmost indices (avoiding duplicating corners)
		if (i > pixelsPerGrid - pixelsPerRow && i < pixelsPerGrid - 1) {
			propertiesOfIndex[i].perimeter = true;
			perimeterIndices.push(i);
		}
		// left column
		if (i % pixelsPerRow === 0) {
			propertiesOfIndex[i].perimeter = true;
			perimeterIndices.push(i);
		}
		// right column
		if ((i + 1) % pixelsPerRow === 0) {
			propertiesOfIndex[i].perimeter = true;
			perimeterIndices.push(i);
		}
	}
}

function initializeNeighborsOfIndexInRadius() {
	// WARNING This only accepts radii of up to 24 cells
	// WARNING this receives number of cells, not canvas pixel distances
	// structure: indexOfNeighborsInRadius[centerIndex][radius][array of indices in radius from centerIndex]
	maxCellDistance = maxScreenDistance / scaledPixelSize;
	for (var i = 0; i < pixelsPerGrid; i++) { // i is the center index
		neighborsOfIndexInRadius.push([]);
		for (var j = 0; j <= maxNeighborRadius; j++) { // j is the radius
			neighborsOfIndexInRadius[i].push([]);
			for (var k = 0; k < pixelsPerGrid; k++) { // k is the neighbor withing j radius of i
				if (distanceFromIndexToIndex[i][k] <= scaledPixelSize * j) neighborsOfIndexInRadius[i][j].push(k);
			}
		}
	}
}

function initializePropertiesOfIndex() {
	for (var i = 0; i < pixelsPerGrid; i++) {
			propertiesOfIndex.push({
				
			});
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

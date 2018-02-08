var currentMousePosition = relativeMousePosition(canvas);

function patrol(entity, arrayOfTargets) {
	if (entity.patrolArrayTargetIndex === undefined) entity.patrolArrayTargetIndex = 0;
	entity.target = arrayOfTargets[entity.patrolArrayTargetIndex];
	if (
		distanceFromIndexToIndex[entity.index][arrayOfTargets[entity.patrolArrayTargetIndex].index] < 3 &&
		arrayOfTargets[entity.patrolArrayTargetIndex + 1]
	) {
		entity.patrolArrayTargetIndex++;
		entity.target = arrayOfTargets[entity.patrolArrayTargetIndex];
	}
	if (
		distanceFromIndexToIndex[entity.index][arrayOfTargets[entity.patrolArrayTargetIndex].index] < 3 &&
		!arrayOfTargets[entity.patrolArrayTargetIndex + 1]
	) {
		entity.patrolArrayTargetIndex = 0;
		entity.target = arrayOfTargets[entity.patrolArrayTargetIndex];
	}
	chasing(entity, entity.target, 200);
}

// WRONG: chasing() and fleeing() are the same except for a += or -= at the ends, respectively. Could probably collapse into one function.
function chasing(entity, target, accelerationScale) {
	var xDistance = xDistanceFromIndexToIndex[entity.index][target.index],
		yDistance = yDistanceFromIndexToIndex[entity.index][target.index],
		magnitude = distanceFromIndexToIndex[entity.index][target.index];
	if (magnitude === 0) magnitude = 0.001; // keeps us from dividing by zero
	entity.dx += xDistance / magnitude * accelerationScale;
	entity.dy += yDistance / magnitude * accelerationScale;
}

// WRONG: fleeing entities should move away from walls, even if that's slightly toward their targets, so that they don't get cornered.
function fleeing(entity, target, accelerationScale) {
	var xDistance = xDistanceFromIndexToIndex[entity.index][target.index],
		yDistance = yDistanceFromIndexToIndex[entity.index][target.index],
		magnitude = distanceFromIndexToIndex[entity.index][target.index];
	if (magnitude === 0) magnitude = 0.001; // keeps us from dividing by zero
	entity.dx -= xDistance / magnitude * accelerationScale;
	entity.dy -= yDistance / magnitude * accelerationScale;
}

function wandering(entity, accelerationScale) {
	if (entity.noWanderingDirectionChangeUntil <= frameCounter || !entity.noWanderingDirectionChangeUntil) {
		entity.wanderingTargetIndex = Math.round(Math.random() * (pixelsPerGrid - 1));
		entity.noWanderingDirectionChangeUntil = frameCounter + 300;
	}
	var entityIndex = indexOfCoordinates[entity.x][entity.y],
		xDistance = xDistanceFromIndexToIndex[entityIndex][entity.wanderingTargetIndex],
		yDistance = yDistanceFromIndexToIndex[entityIndex][entity.wanderingTargetIndex],
		magnitude = distanceFromIndexToIndex[entityIndex][entity.wanderingTargetIndex];
	if (magnitude < 5) entity.noWanderingDirectionChangeUntil = frameCounter;
	if (magnitude === 0) magnitude = 0.001; // keeps us from dividing by zero
	entity.dx += xDistance / magnitude * accelerationScale;
	entity.dy += yDistance / magnitude * accelerationScale;
}


function lineFromIndexToIndex(currentIndex, indexA, indexB, lineBrightness, returnLine) {
	var minX = coordinatesOfIndex[indexA].x,
		minY = coordinatesOfIndex[indexA].y;
	if (minX > coordinatesOfIndex[indexB].x) minX = coordinatesOfIndex[indexB].x;
	if (minY > coordinatesOfIndex[indexB].y) minY = coordinatesOfIndex[indexB].y;
	var xDiff = absXDistanceFromIndexToIndex[indexA][indexB],
		yDiff = absYDistanceFromIndexToIndex[indexA][indexB];
	// avoiding dividing by 0
	if (xDiff === 0) xDiff = 0.01;
	if (yDiff === 0) yDiff = 0.01;
	var paraX = (
			(coordinatesOfIndex[currentIndex].x - minX) /
			xDiff
		); // parametric location of current index's x coordinate between indexA and indexB, starting from indexA
	var paraY = (
			(coordinatesOfIndex[currentIndex].y - minY) /
			yDiff
		);
	if (paraX > 1) paraX = 1;
	if (paraX < 0) paraX = 0;
	if (paraY > 1) paraY = 1;
	if (paraY < 0) paraY = 0;
	// WRONG, probably. Seems like there should be a more elegant way to derive the correct parametric values. (Maybe for the above limiting as well.)
	if (
		(minX === coordinatesOfIndex[indexB].x && minY === coordinatesOfIndex[indexA].y) ||
		(minX === coordinatesOfIndex[indexA].x && minY === coordinatesOfIndex[indexB].y)
	) {
		paraX = 1 - paraX;
		paraY = 1 - paraY;
	}

	// in-line rounding to avoid a function call
	var lineX = paraY * xDiff + minX,
		lineY = paraX * yDiff + minY;
	if (lineX % 1 >= 0.5) lineX += 1 - lineX % 1;
	if (lineX % 1 < 0.5 && lineX % 1 > -0.5) lineX -= lineX % 1;
	if (lineX % 1 <= -0.5) lineX -= 1 + lineX % 1;
	if (lineY % 1 >= 0.5) lineY += 1 - lineY % 1;
	if (lineY % 1 < 0.5 && lineY % 1 > -0.5) lineY -= lineY % 1;
	if (lineY % 1 <= -0.5) lineY -= 1 + lineY % 1;
	// WRONG: this could be dividing by 0, I'm pretty sure
	// i.e. return brightness to draw a soft line
	if (!returnLine) return lineBrightness / distanceFromIndexToIndex[currentIndex][indexOfCoordinates[lineX][lineY]];
	// or return an array of the line's indices
	else {
		// WRONG TEMP Just for testing
		if (indexOfCoordinates[lineX][lineY] === currentIndex) rayTargetLineBuffer.push(currentIndex);
	}
}

function buildLine(startIndex, endIndex, lineBrightness) {
	var line = {
		'body': [],
		'startIndex': startIndex,
		'brightness': lineBrightness
		},
		xTravel = xDistanceFromIndexToIndex[startIndex][endIndex] / scaledPixelSize, // number of pixels/cells moved, total for line
		yTravel = yDistanceFromIndexToIndex[startIndex][endIndex] / scaledPixelSize,
		absXTravel = absXDistanceFromIndexToIndex[startIndex][endIndex] / scaledPixelSize, // absolute value of pixels/cells moved, total for line
		absYTravel = absYDistanceFromIndexToIndex[startIndex][endIndex] / scaledPixelSize,
		minAxisPolarity = 1,
		maxAxisPolarity = 1,
		comma = 0,
		currentIndex = startIndex; // used to keep track of fractional remainders from "absXTravel / (absYTravel + 1)." Borrowing a term from musical scale construction
	// build the line's body
	if (absXDistanceFromIndexToIndex[startIndex][endIndex] >= absYDistanceFromIndexToIndex[startIndex][endIndex]) {
		if (yTravel < 0) minAxisPolarity = -1;
		if (xTravel < 0) maxAxisPolarity = -1;
		comma = absXTravel / absYTravel % 1;
		for (var k = 0; k < absYTravel; k++) {
			var nextXTravel = absXDistanceFromIndexToIndex[currentIndex][endIndex] / absYDistanceFromIndexToIndex[currentIndex][endIndex] - comma;
			for (var i = 0; i < nextXTravel; i++) {
				if (currentIndex > 2435 && currentIndex < 2445) {
					pixelArray[currentIndex * 4 + 0] += 127;
					return line; // ad hoc shadow
				}
				else line.body.push(
					currentIndex
				);
				currentIndex += maxAxisPolarity;
			}
			currentIndex += minAxisPolarity * pixelsPerRow;
		}
	} else {
		if (xTravel < 0) minAxisPolarity = -1;
		if (yTravel < 0) maxAxisPolarity = -1;
		comma = absYTravel / absXTravel % 1;
		for (var j = 0; j < absXTravel; j++) {
			var nextYTravel = absYDistanceFromIndexToIndex[currentIndex][endIndex] / absXDistanceFromIndexToIndex[currentIndex][endIndex] - comma;
			for (var m = 0; m < nextYTravel; m++) {
				if (currentIndex > 2435 && currentIndex < 2445) {
					pixelArray[currentIndex * 4 + 0] += 127;
					return line; // ad hoc shadow
				}
				else line.body.push(
					currentIndex
				);
				currentIndex += maxAxisPolarity * pixelsPerRow;
			}
			currentIndex += minAxisPolarity;
		}
	}
	return line;
}

function buildLinesFromIndexToArrayOfIndices(originIndex, arrayOfIndices, lineBrightness) {
	var lines = [];
	for (var i = 0; i < arrayOfIndices.length; i++) {
		lines.push(buildLine(originIndex, arrayOfIndices[i], lineBrightness));
	}
	return lines;
}

function linesFromIndexToArrayOfIndices(currentIndex, originIndex, arrayOfIndices, lineWidth, lineBrightness, isSoft) {
	var brightness = 0;
	for (var i = 0; i < arrayOfIndices.length; i++) {
		if (i % 1 === 0) {
			var indexA = originIndex,
				indexB = arrayOfIndices[i];
			var minX = coordinatesOfIndex[indexA].x,
				minY = coordinatesOfIndex[indexA].y;
			if (minX > coordinatesOfIndex[indexB].x) minX = coordinatesOfIndex[indexB].x;
			if (minY > coordinatesOfIndex[indexB].y) minY = coordinatesOfIndex[indexB].y;
			var xDiff = absXDistanceFromIndexToIndex[indexA][indexB],
				yDiff = absYDistanceFromIndexToIndex[indexA][indexB];
			// avoiding dividing by 0
			if (xDiff === 0) xDiff = 0.01;
			if (yDiff === 0) yDiff = 0.01;
			
			// setting parametric locations of the current index relative to the x and y spaces between indices A and B
			var paraX = (
					(coordinatesOfIndex[currentIndex].x - minX) /
					xDiff
				); // parametric location of current index's x coordinate between indexA and indexB, starting from indexA
			var paraY = (
					(coordinatesOfIndex[currentIndex].y - minY) /
					yDiff
				);
			if (paraX >= 0 && paraX <= 1 && paraY >= 0 && paraY <= 1) { // i.e. if the current index is within the bounds of the rectangle implied by indices A and B
				// NOTE: The line above (checking parametric stuff) would be where to tweak to create lines that went extended indefinitely
				// WRONG, probably. Seems like there should be a more elegant way to derive the correct parametric values.
				// This 'if' check rectifies a problem where in if indexB is to the upper right or lower left of indexA, the line draws from the upper left to the lower right corners of the rectangle implied by indices A and B
				if (
					(minX === coordinatesOfIndex[indexB].x && minY === coordinatesOfIndex[indexA].y) ||
					(minX === coordinatesOfIndex[indexA].x && minY === coordinatesOfIndex[indexB].y)
				) {
					paraX = 1 - paraX;
					paraY = 1 - paraY;
				}
				
				// NOTE: I need a better comment to describe what's going on here
				// This basically defines the line
				// WRONG: this creates patchy lines
				var lineX = paraY * xDiff + minX,
					lineY = paraX * yDiff + minY;
					
				// in-line rounding to avoid a function call
				// rounding necessary for using the indexOfCoordinates[][] array
				if (lineX % 1 >= 0.5) lineX += 1 - lineX % 1;
				if (lineX % 1 < 0.5 && lineX % 1 > -0.5) lineX -= lineX % 1;
				if (lineX % 1 <= -0.5) lineX -= 1 + lineX % 1;
				if (lineY % 1 >= 0.5) lineY += 1 - lineY % 1;
				if (lineY % 1 < 0.5 && lineY % 1 > -0.5) lineY -= lineY % 1;
				if (lineY % 1 <= -0.5) lineY -= 1 + lineY % 1;
				
				// this version lights up only the relevant points
				if (!isSoft) {
					/*if (indexOfCoordinates[lineX][lineY] === currentIndex) {
						brightness += lineBrightness;
					}*/
					// WRONG, maybe. Is this a kludge that doesn't really fix the patchy-line problem?
					if (coordinatesOfIndex[currentIndex].x < lineX + lineWidth * 0.5 &&
						coordinatesOfIndex[currentIndex].x > lineX - lineWidth * 0.5) {
						//brightness += lineBrightness;
						brightness += lineBrightness / distanceFromIndexToIndex[currentIndex][indexOfCoordinates[lineX][lineY]];
					}
				// this version creates a soft, distance-based effect
				} else brightness += lineBrightness / distanceFromIndexToIndex[currentIndex][indexOfCoordinates[lineX][lineY]];
			}
		}
	}
	// WRONG: this could be dividing by 0, I'm pretty sure
	// this version creates a soft, distance-based effect.
	//return 768 / distanceFromIndexToIndex[currentIndex][indexOfCoordinates[lineX][lineY]];
	return brightness;
}

function updateSpotlight(parent, targetIndex, brightness, width, density, isSoft) {
	// WARNING/WRONG: .push() function calls!!!
	// clear old spotlight lines
	parent.spotlight.lines = [];
	// NOTE: might want to make fewer beam lines than a full beam, then only draw 1/3 to 1/2 of them per frame, interlaced
	var line = [],
		xTravel = xDistanceFromIndexToIndex[parent.index][targetIndex] / scaledPixelSize, // number of pixels/cells moved, total for line
		yTravel = yDistanceFromIndexToIndex[parent.index][targetIndex] / scaledPixelSize,
		absXTravel = absXDistanceFromIndexToIndex[parent.index][targetIndex] / scaledPixelSize, // absolute value of pixels/cells moved, total for line
		absYTravel = absYDistanceFromIndexToIndex[parent.index][targetIndex] / scaledPixelSize,
		minAxisPolarity = 1,
		maxAxisPolarity = 1,
		comma = 0, // used to keep track of fractional remainders from "absXTravel / (absYTravel + 1)." Borrowing a term from musical scale construction
		target = targetIndex,
		//targetIndices = [targetIndex, 4799, 4759, 4720, 2400, 2479],
		currentIndex = parent.index;
	// build the line's body
	// WRONG, probably. It would be great not to repeat this code depending on whether x or y is bigger
	if (absXDistanceFromIndexToIndex[parent.index][target] >= absYDistanceFromIndexToIndex[parent.index][target]) {
		if (yTravel < 0) minAxisPolarity = -1;
		if (xTravel < 0) maxAxisPolarity = -1;
		comma = absXTravel / absYTravel % 1;
		for (var k = 0; k < absYTravel; k++) {
			if (currentIndex > 2425 && currentIndex < 2455) {
				pixelArray[currentIndex * 4 + 0] += 127;
				break; // ad hoc shadow-creating barrier
			} else {
				var nextXTravel = absXDistanceFromIndexToIndex[currentIndex][target] / absYDistanceFromIndexToIndex[currentIndex][target] - comma;
				for (var i = 0; i < nextXTravel; i++) {
					line.push(
						currentIndex
					);
					pixelArray[currentIndex * 4 + 0] += parent.spotlight.brightness / distanceFromIndexToIndex[parent.index][currentIndex];
					currentIndex += maxAxisPolarity;
				}
				currentIndex += minAxisPolarity * pixelsPerRow;
			}
		}
	} else {
		if (xTravel < 0) minAxisPolarity = -1;
		if (yTravel < 0) maxAxisPolarity = -1;
		comma = absYTravel / absXTravel % 1;
		for (var j = 0; j < absXTravel; j++) {
			var nextYTravel = absYDistanceFromIndexToIndex[currentIndex][target] / absXDistanceFromIndexToIndex[currentIndex][target] - comma;
			for (var m = 0; m < nextYTravel; m++) {
				if (currentIndex > 2425 && currentIndex < 2455) {
					// NOTE: this check goes in whichever one of the two nested loops only increments 1 per loop, so that a barrier doesn't get skipped over
					pixelArray[currentIndex * 4 + 0] += 127;
					break; // ad hoc shadow-creating barrier
				} else {
					line.push( // maybe unnecessary
						currentIndex
					);
					pixelArray[currentIndex * 4 + 0] += parent.spotlight.brightness / distanceFromIndexToIndex[parent.index][currentIndex];
					currentIndex += maxAxisPolarity * pixelsPerRow;
				}
			}
			currentIndex += minAxisPolarity;
		}
	}
	parent.spotlight.lines.push(line); // maybe unnecessary
}

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

function updateEntities(entityArray) {
	// for each entity:
	// 		acceleration limited and applied to speed
	// 		speed limited and applied to position
	// 		position rounded to integer (for lookup tables) and constrained to canvas
	// 		nearest array index stored on entity object
	for (var i = 0; i < entityArray.length; i++) {
		var entity = entityArray[i];
		// acceleration limited
		var absDx = entity.vx, // absolute values
			absDy = entity.vy;
		if (absDx < 0) absDx = -absDx;
		if (absDy < 0) absDy = -absDy;
		if (absDx + absDy > entity.maxAcceleration) {
			entity.dx *= entity.maxAcceleration / (absDx + absDy);
			entity.dy *= entity.maxAcceleration / (absDx + absDy);
		}
		// acceleration applied to speed
		entity.vx += entity.dx;
		entity.vy += entity.dy;
		// speed limited
		var absVx = entity.vx, // absolute values
			absVy = entity.vy;
		if (absVx < 0) absVx = -absVx;
		if (absVy < 0) absVy = -absVy;
		if (absVx + absVy > entity.maxSpeed) {
			entity.vx *= entity.maxSpeed / (absVx + absVy);
			entity.vy *= entity.maxSpeed / (absVx + absVy);
		}
		// friction applied to speed
		entity.vx *= 0.84;
		entity.vy *= 0.84;
		
		// speed applied to position
		entity.x += entity.vx;
		entity.y += entity.vy;
		
		// x and y rounded (important or indexOfCoordinates[entity.x][enitity.y] won't work)
		// avoiding a Math.round() function call
		// WARNING: Rounding here will create some subtle inconsistencies in movement.
		//				Might be better to round just before an integer is needed (like when using
		//				entity coordinates as indices for a distance table).
		// maybe there's a more elegant way to do this.
		// note: there shouldn't ever be any negative coordinates, but this covers possibility anyway.
		if (entity.x % 1 >= 0.5) entity.x += 1 - entity.x % 1;
		if (entity.x % 1 < 0.5 && entity.x % 1 > -0.5) entity.x -= entity.x % 1;
		if (entity.x % 1 <= -0.5) entity.x -= 1 + entity.x % 1;
		if (entity.y % 1 >= 0.5) entity.y += 1 - entity.y % 1;
		if (entity.y % 1 < 0.5 && entity.y % 1 > -0.5) entity.y -= entity.y % 1;
		if (entity.y % 1 <= -0.5) entity.y -= 1 + entity.y % 1;
		// position constrainted to canvas
		if (entity.x < 0) entity.x = 0;
		if (entity.x > canvas.width - 1) entity.x = canvas.width - 1;
		if (entity.y < 0) entity.y = 0;
		if (entity.y > canvas.height - 1) entity.y = canvas.height - 1;
		// nearest array index assigned
		// NOTE: Assigning this every frame is only efficient if the entity's index is being referenced one or more times per frame.
		entity.index = indexOfCoordinates[entity.x][entity.y];
	}
}

/*function linesExperiments(currentIndex, indexA, indexB) {
	var iC = {
		'x': coordinatesOfIndex[currentIndex].x,
		'y': coordinatesOfIndex[currentIndex].y
		},
		iA = {
			'x': coordinatesOfIndex[indexA].x,
			'y': coordinatesOfIndex[indexA].y
		},
		iB = {
			// WRONG: if this is mouse coords, then we're turning coords into an index into coords
			'x': coordinatesOfIndex[indexB].x,
			'y': coordinatesOfIndex[indexB].y
		};
	var dAB = distanceFromIndexToIndex[indexA][indexB],
		dAC = distanceFromIndexToIndex[currentIndex][indexA],
		dBC = distanceFromIndexToIndex[currentIndex][indexB],
		xDAB = xDistanceFromIndexToIndex[indexA][indexB],
		xDBA = xDistanceFromIndexToIndex[indexB][indexA],
		xDAC = xDistanceFromIndexToIndex[indexA][currentIndex],
		xDCA = xDistanceFromIndexToIndex[currentIndex][indexA],
		xDBC = xDistanceFromIndexToIndex[indexB][currentIndex],
		xDCB = xDistanceFromIndexToIndex[currentIndex][indexB],
		yDAB = yDistanceFromIndexToIndex[indexA][indexB],
		yDBA = yDistanceFromIndexToIndex[indexB][indexA],
		yDAC = yDistanceFromIndexToIndex[indexA][currentIndex],
		yDCA = yDistanceFromIndexToIndex[currentIndex][indexA],
		yDBC = yDistanceFromIndexToIndex[indexB][currentIndex],
		yDCB = yDistanceFromIndexToIndex[currentIndex][indexB];

	// bad to use this name that's a global var?
	var brightness = 0;
		brightness += (
			yDBC / xDBC
		);
	return brightness;
}*/

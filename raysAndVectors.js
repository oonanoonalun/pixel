function castSpotlight(parent, targetIndex, softness) {
	// NOTE: This function heavily duplicates contents from the castRay() function.

	var arrayOfTargetIndices = findSpotlightTargets(parent, targetIndex);

	for (var i = 0; i < arrayOfTargetIndices.length; i++) {
		// only draw half of the rays each frame
		//if (frameCounter % 2 === 0 && i % 2 === 0) continue;
		//if (frameCounter % 2 === 1 && i % 2 === 1) continue;
		// only using some of the target indices, drawing fewer rays, total
		//if (i % 3 < 2) continue;
		
		// vars
		var mag = distanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]], // assigning this as a var so that it only gets looked up once
			xStep = xDistanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]] / mag * scaledPixelSize,
			yStep = yDistanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]] /	mag * scaledPixelSize,
			currentIndex = parent.index,
			currentCoords = { // WRONG, sort of: I have no idea why I'm not being able to just do 'currentCoords = coordinatesOfIndex[currentIndex]'
				'x': coordinatesOfIndex[currentIndex].x,
				'y': coordinatesOfIndex[currentIndex].y
			},
			collided = false,
			roundedX = currentCoords.x,
			roundedY = currentCoords.y;
		while ( // for as long as the ray is on the canvas and hasn't collided with something solid
			currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 && // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
			currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1 &&
			!collided
		) {
			// round a version of coords so that they work with the indexOfCoordinates[x][y] lookup table
			// don't change the original coords, so that the ray's path remains smooth and consistent
			roundedX = currentCoords.x;
			roundedY = currentCoords.y;
			if (roundedX % 1 >= 0.5) roundedX += 1 - roundedX % 1;
			if (roundedX % 1 < 0.5 && roundedX % 1 > -0.5) roundedX -= roundedX % 1;
			if (roundedX % 1 <= -0.5) roundedX -= 1 + roundedX % 1;
			if (roundedY % 1 >= 0.5) roundedY += 1 - roundedY % 1;
			if (roundedY % 1 < 0.5 && roundedY % 1 > -0.5) roundedY -= roundedY % 1;
			if (roundedY % 1 <= -0.5) roundedY -= 1 + roundedY % 1;
	
			// check for collisions
			var illumination = parent.spotlight.brightness / distanceFromIndexToIndex[parent.index][currentIndex],
				diffusionFactor = 1.5; // illumination is divided by this when applied as softness/diffusion
				impactEnhancementScale = 4; // illumation due to impact is multiplied by this, making edges stand out in a beam
			if (propertiesOfIndex[currentIndex].solid) {
				// if the ray collides with something solid
				// light the impacted surface
				pixelArray[currentIndex * 4 + 0] += illumination * impactEnhancementScale;
				if (softness) {
					// diffuse the impact lighting effect
					for (var k = 0; k < neighborsOfIndexInRadius[currentIndex][softness].length; k++) {
						pixelArray[neighborsOfIndexInRadius[currentIndex][softness][k] * 4 + 0] += illumination / diffusionFactor * impactEnhancementScale;
					}
				}
				// stop drawing the ray
				collided = true; // NOTE: it seems like I could just 'return' here and not use the 'collided' var, but just replacing this with 'return' and deleting the 'collided' var didn't work, offhand.
			} else {
				// if the ray hasn't collided with something solid
				// light the ray's path
				currentIndex = indexOfCoordinates[roundedX][roundedY];
				pixelArray[currentIndex * 4 + 0] += illumination;
				if (softness) {
					// diffuse the brightening effect of the ray
					for (var j = 0; j < neighborsOfIndexInRadius[currentIndex][softness].length; j++) {
						pixelArray[neighborsOfIndexInRadius[currentIndex][softness][j] * 4 + 0] += illumination / diffusionFactor;
					}
				}
			}

			// increment the coordinates for next loop
			currentCoords.x += xStep;
			currentCoords.y += yStep;
		}
	}
}

function findSpotlightTargets(parent, targetIndex) {
	var beamCenterTargetIndex = castRayToPerimeter(
            parent.index,
            xDistanceFromIndexToIndex[parent.index][targetIndex],
            yDistanceFromIndexToIndex[parent.index][targetIndex]
        );
	var radius = 60 / parent.spotlight.narrowness * (distanceFromIndexToIndex[parent.index][beamCenterTargetIndex] / maxScreenDistance); // add this to equation somehow: distanceFromIndexToIndex[parent.index][beamCenterTargetIndex]
	if (radius > maxNeighborRadius) radius = maxNeighborRadius;
	if (radius < 4) radius = 4;
	
	// rounding
	if (radius % 1 >= 0.5) radius += 1 - radius % 1;
	if (radius % 1 < 0.5 && radius % 1 > -0.5) radius -= radius % 1;
	if (radius % 1 <= -0.5) radius -= 1 + radius % 1;
	
	return neighborsOfIndexInRadius[beamCenterTargetIndex][radius];
}

function castRayToPerimeter(originIndex, xMagnitude, yMagnitude) {
	// WRONG: see castSpotlight() for fewer vars
	var currentIndex = originIndex,
		currentCoords = {
			'x': coordinatesOfIndex[currentIndex].x,
			'y': coordinatesOfIndex[currentIndex].y
		},
		xStep,
		yStep,
		mag,
		absXMag = xMagnitude,
		absYMag = yMagnitude,
		roundedX = currentCoords.x,
		roundedY = currentCoords.y;
	if (absXMag < 0) absXMag = -absXMag;
	if (absYMag < 0) absYMag = -absYMag;
	mag = absXMag + absYMag;
	xStep = xMagnitude / mag * scaledPixelSize;
	yStep = yMagnitude / mag * scaledPixelSize;
	while (
		currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 &&  // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
		currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1
	) {
		// rounding checked coords so that they work with the indexOfCoordinates[x][y] lookup table
		roundedX = currentCoords.x;
		roundedY = currentCoords.y;
		if (roundedX % 1 >= 0.5) roundedX += 1 - roundedX % 1;
		if (roundedX % 1 < 0.5 && roundedX % 1 > -0.5) roundedX -= roundedX % 1;
		if (roundedX % 1 <= -0.5) roundedX -= 1 + roundedX % 1;
		if (roundedY % 1 >= 0.5) roundedY += 1 - roundedY % 1;
		if (roundedY % 1 < 0.5 && roundedY % 1 > -0.5) roundedY -= roundedY % 1;
		if (roundedY % 1 <= -0.5) roundedY -= 1 + roundedY % 1;

		currentIndex = indexOfCoordinates[roundedX][roundedY];
		
		// incrementing for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
	return currentIndex; // This *should* be a perimeter index, but we could also check each step against perimeterIndices[] (but almost certainly shouldn't)
}

function castAltitudeAndCollisionOrthogonalRay(originEntity, direction) {
	var currentIndex = originEntity.index,
		previousIndex = currentIndex,
		currentCoords = {
			'x': originEntity.x,
			'y': originEntity.y
		},
		xStep = 0,
		yStep = 0,
		roundedX = originEntity.x,
		roundedY = originEntity.y,
		roundedXPlusVX = originEntity.x + originEntity.vx,
		roundedYPlusVY = originEntity.y + originEntity.vy,
		nextFrameIndex; // this is the index the entity would be in next frame if it maintained its speed in the ray's
						//		direction and didn't move on the other axis. Checked against the altitude check's collision index
						//		to see if the entity would collide next frame in this direction.
	
	// rounding for indexOfCoordinates[][]
	if (roundedX % 1 >= 0.5) roundedX += 1 - roundedX % 1;
	if (roundedX % 1 < 0.5 && roundedX % 1 > -0.5) roundedX -= roundedX % 1;
	if (roundedX % 1 <= -0.5) roundedX -= 1 + roundedX % 1;
	if (roundedY % 1 >= 0.5) roundedY += 1 - roundedY % 1;
	if (roundedY % 1 < 0.5 && roundedY % 1 > -0.5) roundedY -= roundedY % 1;
	if (roundedY % 1 <= -0.5) roundedY -= 1 + roundedY % 1;
	if (roundedXPlusVX % 1 >= 0.5) roundedXPlusVX += 1 - roundedXPlusVX % 1;
	if (roundedXPlusVX % 1 < 0.5 && roundedXPlusVX % 1 > -0.5) roundedXPlusVX -= roundedXPlusVX % 1;
	if (roundedXPlusVX % 1 <= -0.5) roundedXPlusVX -= 1 + roundedXPlusVX % 1;
	if (roundedYPlusVY % 1 >= 0.5) roundedYPlusVY += 1 - roundedYPlusVY % 1;
	if (roundedYPlusVY % 1 < 0.5 && roundedYPlusVY % 1 > -0.5) roundedYPlusVY -= roundedYPlusVY % 1;
	if (roundedYPlusVY % 1 <= -0.5) roundedYPlusVY -= 1 + roundedYPlusVY % 1;
	
	if (direction === 'down') {
		yStep = scaledPixelSize;
		if (
			indexOfCoordinates[roundedX] &&
			indexOfCoordinates[roundedX][roundedYPlusVY]
		) nextFrameIndex = indexOfCoordinates[roundedX][roundedYPlusVY];
		else nextFrameIndex = null;
	}
	if (direction === 'up') {
		yStep = -scaledPixelSize;
		if (
			indexOfCoordinates[roundedX] &&
			indexOfCoordinates[roundedX][roundedYPlusVY]
		) nextFrameIndex = indexOfCoordinates[roundedX][roundedYPlusVY];
		else nextFrameIndex = null;
	}
	if (direction === 'left') {
		xStep = -scaledPixelSize;
		if (
			indexOfCoordinates[roundedXPlusVX] &&
			indexOfCoordinates[roundedXPlusVX][roundedY] 
		) nextFrameIndex = indexOfCoordinates[roundedXPlusVX][roundedY];
		else nextFrameIndex = null;
	}
	if (direction === 'right') {
		xStep = scaledPixelSize;
		if (
			indexOfCoordinates[roundedXPlusVX] &&
			indexOfCoordinates[roundedXPlusVX][roundedY]
		) nextFrameIndex = indexOfCoordinates[roundedXPlusVX][roundedY];
		else nextFrameIndex = null;
	}
	// while the ray is still on the canvas
	while (
		currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 && // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
		currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1
	) {
		currentIndex = indexOfCoordinates[currentCoords.x][currentCoords.y];
		
		// draw the vector
		//pixelArray[currentIndex * 4 + 2] = 0;
		
		// collision
		if (propertiesOfIndex[currentIndex].solid || propertiesOfIndex[currentIndex].perimeter) { // WRONG, maybe. Maybe should handle perimeter collision differently.
			var altitude = distanceFromIndexToIndex[currentIndex][originEntity.index] / scaledPixelSize;
			if (altitude < 0) altitude = -altitude;
			// NOTE: could I avoid these 'if' checks for something I already checked for?
			//		The only thing I can think aof is to duplicate the whole 'while' loop inside the initial
			//		'if' checks for direction.
			if (direction === 'down') {
				originEntity.altitude.down = altitude - 1;
				if (nextFrameIndex === currentIndex || !nextFrameIndex) return coordinatesOfIndex[previousIndex].y;
				else return null;
			}
			if (direction === 'up') {
				originEntity.altitude.up = altitude - 1;
				if (nextFrameIndex === currentIndex || !nextFrameIndex) return coordinatesOfIndex[previousIndex].y;
				else return null;
			}
			if (direction === 'left') {
				originEntity.altitude.left = altitude - 1;
				if (nextFrameIndex === currentIndex || !nextFrameIndex) return coordinatesOfIndex[previousIndex].x;
				else return null;
			}
			if (direction === 'right') {
				originEntity.altitude.right = altitude - 1;
				if (nextFrameIndex === currentIndex || !nextFrameIndex) return coordinatesOfIndex[previousIndex].x;
				else return null;
			}
		}
		
		// storing the previous index in case there's a collision next step and we need to return the last non-collided location.
		previousIndex = currentIndex;
		
		// incrementing the coordinates for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
}

// OLD/OUTDATED but might be worth keeping for now
function castCollisionVector(originIndex, magnitudeX, magnitudeY) {
	// WRONG to slide along surfaces, we'll need to return something other than just an index
	var currentIndex = originIndex,
		previousIndex = currentIndex,
		absMagX = magnitudeX,
		absMagY = magnitudeY,
		mag,
		currentCoords = { // WRONG-ish. Don't know why it's not working to just do 'currentCoords = coordinatesOfIndex[currentIndex]'
			'x': coordinatesOfIndex[currentIndex].x,
			'y': coordinatesOfIndex[currentIndex].y
		},
		previousCoords = currentCoords,
		xStep,
		yStep,
		absXStep, // used for decrementing the mag as we count down the length we want to draw
		absYStep,
		absStepMag,
		roundedX,
		roundedY;
	if (absMagX < 0) absMagX = -absMagX;
	if (absMagY < 0) absMagY = -absMagY;
	mag = absMagX + absMagY;
	xStep = magnitudeX / mag * scaledPixelSize;
	yStep = magnitudeY / mag * scaledPixelSize;
	absXStep = xStep;
	absYStep = yStep;
	if (absXStep < 0) absXStep = -absXStep;
	if (absYStep < 0) absYStep = -absYStep;
	absStepMag = absXStep + absYStep; // this is always scaledPixelSize, or almost, but I think I want to calculate it in case something else changes
	while (
		mag > 0 - scaledPixelSize && // making sure the vector never gets so short that it doesn't check an adjacent cell
		currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 && // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
		currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1
	) {
		// rounding checked coords so that they work with the indexOfCoordinates[x][y] lookup table
		roundedX = currentCoords.x;
		roundedY = currentCoords.y;
		if (roundedX % 1 >= 0.5) roundedX += 1 - roundedX % 1;
		if (roundedX % 1 < 0.5 && roundedX % 1 > -0.5) roundedX -= roundedX % 1;
		if (roundedX % 1 <= -0.5) roundedX -= 1 + roundedX % 1;
		if (roundedY % 1 >= 0.5) roundedY += 1 - roundedY % 1;
		if (roundedY % 1 < 0.5 && roundedY % 1 > -0.5) roundedY -= roundedY % 1;
		if (roundedY % 1 <= -0.5) roundedY -= 1 + roundedY % 1;
		
		currentIndex = indexOfCoordinates[roundedX][roundedY];
		
		// draw the vector. NOTE: it will probably be too short to see if the entity is moving at normal speeds
		//pixelArray[currentIndex * 4 + 2] = 0;
		
		// collision
		if (propertiesOfIndex[currentIndex].solid) {
			return coordinatesOfIndex[previousIndex].y;
		}
		
		// counting down how long we want to draw, "using up the vector's magnitude"
		mag -= absStepMag;
		// storing last index so we can tell what direction the collision came from.
		previousIndex = currentIndex;
		previousCoords = currentCoords; // WRONG I don't think we need coords
		
		// incrementing the coordinates for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
	return null;
}

// OLD/OUTDATED but might be worth keeping for now
function castAltitudeRay(originIndex) {
	var currentIndex = originIndex,
		currentCoords = {
			'x': coordinatesOfIndex[currentIndex].x,
			'y': coordinatesOfIndex[currentIndex].y
		},
		xStep = 0,
		yStep = 0;
	if (platformer.gravity.direction === 'down') yStep = scaledPixelSize;
	if (platformer.gravity.direction === 'up') yStep = -scaledPixelSize;
	if (platformer.gravity.direction === 'left') xStep = -scaledPixelSize;
	if (platformer.gravity.direction === 'right') xStep = scaledPixelSize;
	while (
		currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 && // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
		currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1
	) {
		currentIndex = indexOfCoordinates[currentCoords.x][currentCoords.y];
		
		// draw the vector
		//pixelArray[currentIndex * 4 + 2] = 0;
		
		// collision
		if (propertiesOfIndex[currentIndex].solid) {
			var altitude = distanceFromIndexToIndex[currentIndex][originIndex] / scaledPixelSize;
			if (altitude < 0) altitude = -altitude;
			return altitude - 1;
		}
		
		// incrementing the coordinates for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
	return 'over abyss'; // WRONG this might cause problems, depending on what we use castAltitudeRay() for.
}
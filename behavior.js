var currentMousePosition = relativeMousePosition(canvas);

function patrol(entity, arrayOfTargets, acceleration) {
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
	chasing(entity, entity.target, acceleration);
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
//		This would make fleeing() more distinct from chasing(), decreasing the likelihood that it would be worthwhile to collapse them into a single function.
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

// WRONG, maybe. I think this should just be called "castSpotlight()," since I don't think it relies on any external object that it's updating.
function updateSpotlight(parent, targetIndex, brightness) {
	// NOTE: This function heavily duplicates contents from the castRay() function.

	var arrayOfTargetIndices = findSpotlightTargets(parent.index, targetIndex, parent.spotlight.narrowness);

	for (var i = 0; i < arrayOfTargetIndices.length; i++) {
		// only draw half of the rays each frame
		// NOTE: could maybe do this even more broken up if the target density is high?
		if (frameCounter % 2 === 0 && i % 2 === 0) continue;
		if (frameCounter % 2 === 1 && i % 2 === 1) continue;
		
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
		while (
			currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 && // DON'T CHANGE: Rounding means these have to be '<= canvas.width/height - 1' rather than '< canvas.width/height'
			currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1 &&
			!collided
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
	
			// checking for collisions
			if (propertiesOfIndex[currentIndex].solid) {
				pixelArray[currentIndex * 4 + 0] += 127;
				collided = true;
			} else {
				// applying lighting
				currentIndex = indexOfCoordinates[roundedX][roundedY];
				pixelArray[currentIndex * 4 + 0] += parent.spotlight.brightness / distanceFromIndexToIndex[parent.index][currentIndex];
			}

			// incrementing for next loop
			currentCoords.x += xStep;
			currentCoords.y += yStep;
		}
	}
}

function findSpotlightTargets(originIndex, targetIndex, narrowness) {
	var targetIndices = [];
	var beamCenterTargetIndex = castRayToPerimeter(
            originIndex,
            xDistanceFromIndexToIndex[originIndex][targetIndex],
            yDistanceFromIndexToIndex[originIndex][targetIndex]
        );
    for (var beamTargetSearch = 0; beamTargetSearch < perimeterIndices.length; beamTargetSearch++) {
        var perimIndex = perimeterIndices[beamTargetSearch];
        if (
            distanceFromIndexToIndex[perimIndex][beamCenterTargetIndex] <
            distanceFromIndexToIndex[beamCenterTargetIndex][originIndex] / narrowness
        ) {
            targetIndices.push(perimIndex);
        }
    }
	return targetIndices;
}

function castRay(originIndex, xMagnitude, yMagnitude, brightness) {
	// WRONG: see updateSpotlight() for fewer vars
	var currentIndex = originIndex,
		currentCoords = {
			'x': coordinatesOfIndex[currentIndex].x,
			'y': coordinatesOfIndex[currentIndex].y
		},
		collided = false,
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
		currentCoords.y >= 0 && currentCoords.y <= canvas.height - 1 &&
		!collided
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

		// checking for collisions
		if (propertiesOfIndex[currentIndex].solid) {
				pixelArray[currentIndex * 4 + 0] += 127;
				collided = true;
		} else {
			// applying lighting
			currentIndex = indexOfCoordinates[roundedX][roundedY];
			pixelArray[currentIndex * 4 + 0] += brightness / distanceFromIndexToIndex[originIndex][currentIndex];
		}
		
		// incrementing for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
}

function castRayToPerimeter(originIndex, xMagnitude, yMagnitude) {
	// WRONG: see updateSpotlight() for fewer vars
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

function castTargetVector(originIndex, magnitudeX, magnitudeY, minRange, maxRange) {
	// WARNING: This code is heavily duplicated from castCollisionVector. Maybe reuse the code in one more-adaptable function?
	var currentIndex = originIndex,
		absMagX = magnitudeX,
		absMagY = magnitudeY,
		mag,
		currentCoords = { // WRONG-ish. Don't know why it's not working to just do 'currentCoords = coordinatesOfIndex[currentIndex]'
			'x': coordinatesOfIndex[currentIndex].x,
			'y': coordinatesOfIndex[currentIndex].y
		},
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
	if (mag < minRange) mag = minRange;
	if (mag > maxRange) mag = maxRange;
	xStep = magnitudeX / mag * scaledPixelSize;
	yStep = magnitudeY / mag * scaledPixelSize;
	absXStep = xStep;
	absYStep = yStep;
	if (absXStep < 0) absXStep = -absXStep;
	if (absYStep < 0) absYStep = -absYStep;
	absStepMag = absXStep + absYStep; // this is always scaledPixelSize, or almost, but I think I want to calculate it in case something else changes
	if (absStepMag < scaledPixelSize * 0.5) {
		return currentIndex;
	}
	while (
		mag > 0 &&
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
		
		// draw the vector
		pixelArray[currentIndex * 4 + 2] = 0;
		
		// collision
		if (propertiesOfIndex[currentIndex].solid) return currentIndex;
		
		// counting down how long we want to draw, "using up the vector's magnitude"
		mag -= absStepMag;
		
		// incrementing the coordinates for next loop
		currentCoords.x += xStep;
		currentCoords.y += yStep;
	}
	return currentIndex;
}

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

function updateEntities(entitiesArray) {
	// for each entity:
	// 		acceleration limited and applied to speed
	// 		speed limited and applied to position
	// 		position rounded to integer (for lookup tables) and constrained to canvas
	// 		nearest array index stored on entity object
	for (var i = 0; i < entitiesArray.length; i++) {
		var entity = entitiesArray[i],
			collision = null;
		
		// gravity
		//entity.vy++;
		
		// acceleration limited
		var absDx = entity.vx, // absolute values
			absDy = entity.vy;
		if (absDx < 0) absDx = -absDx;
		if (absDy < 0) absDy = -absDy;
		if (absDx + absDy > entity.maxAcceleration) {
			entity.dx *= entity.maxAcceleration / (absDx + absDy);
			entity.dy *= entity.maxAcceleration / (absDx + absDy);
		}
		
		// WRONG, maybe. Shouldn't this be necessary? Should log dx and dy sometimes.
		//		You wouldn't want to be still, but have an old dx/dy to overcome when you start moving.
		// acceleration decays
		//entity.dx *= 0.5;
		//entity.dy *= 0.5;
		
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
		entity.vx *= 0.9;
		entity.vy *= 0.9;
		
		// check for collisions next frame
		// WARNING!!! If I use controls to move all the entities (WHICH I SHOULDN'T), then moving the camera will
		//		cast collision vectors for things it shouldn't.
		/*if (entity.vx || entity.vy) */if (!entity.noCollision) collision = castCollisionVector(entity.index, entity.vx, entity.vy);
		
		// slide or remove if collide
		if (!collision) { // speed applied to position
			entity.x += entity.vx;
			entity.y += entity.vy;
		} else {
			// WRONG ad-hoc only accounts for colliding with something below or above
			entity.x += entity.vx;
			entity.y = collision;
		}
	
		// coordinates rounded (important or indexOfCoordinates[entity.x][enitity.y] and propertiesOfIndex[] won't work)
		// avoiding a Math.round() function call
		// WARNING: Rounding here will create some subtle inconsistencies in movement.
		//		Might be better to round just before an integer is needed (like when using
		//		entity coordinates as indices for a distance table), or to have "pure" coords
		//		and rounded ones both stored on the entity.
		// maybe there's a more elegant way to do this.
		// note: onscreen things won't have negative coords, but offscreen ones might, so this covers that.
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
		// NOTE: Changing an entities index won't move it, as its coords will just reset its index.
		//			To move an entity, change its coordinates.
		entity.index = indexOfCoordinates[entity.x][entity.y];
	}
}

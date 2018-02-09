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

function updateSpotlight(parent, centerTargetIndex, brightness) {
	// NOTE: This function heavily duplicates contents from the castRay() function.
	var arrayOfTargetIndices = [
		centerTargetIndex,
		centerTargetIndex - 1,
		centerTargetIndex - 2,
		centerTargetIndex - 3,
		centerTargetIndex + 1,
		centerTargetIndex + 2,
		centerTargetIndex + 3,
		centerTargetIndex - 1 * pixelsPerRow,
		centerTargetIndex - 2 * pixelsPerRow,
		centerTargetIndex - 3 * pixelsPerRow,
		centerTargetIndex + 1 * pixelsPerRow,
		centerTargetIndex + 2 * pixelsPerRow,
		centerTargetIndex + 3 * pixelsPerRow,
		// denser:
		centerTargetIndex - 1 * pixelsPerRow - 1,
		centerTargetIndex - 2 * pixelsPerRow - 1,
		centerTargetIndex - 3 * pixelsPerRow - 1,
		centerTargetIndex + 1 * pixelsPerRow + 1,
		centerTargetIndex + 2 * pixelsPerRow + 1,
		centerTargetIndex + 3 * pixelsPerRow + 1,
		centerTargetIndex - 1 * pixelsPerRow + 1,
		centerTargetIndex - 2 * pixelsPerRow + 1,
		centerTargetIndex - 3 * pixelsPerRow + 1,
		centerTargetIndex + 1 * pixelsPerRow - 1,
		centerTargetIndex + 2 * pixelsPerRow - 1,
		centerTargetIndex + 3 * pixelsPerRow - 1,
	];
	// creating the target line;
	for (var i = 0; i < arrayOfTargetIndices.length; i++) {
		// only draw half of the rays each frame
		if (frameCounter % 2 === 0 && i % 2 === 0) continue;
		if (frameCounter % 2 === 1 && i % 2 === 1) continue;
		
		// vars
		var mag = distanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]], // assigning this as a var so that it only gets looked up once
			xStep = xDistanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]] / mag * scaledPixelSize,
			yStep = yDistanceFromIndexToIndex[parent.index][arrayOfTargetIndices[i]] /	mag * scaledPixelSize,
			currentIndex = parent.index,
			currentCoords = {
				'x': coordinatesOfIndex[currentIndex].x,
				'y': coordinatesOfIndex[currentIndex].y
			},
			collided = false,
			roundedX = currentCoords.x,
			roundedY = currentCoords.y;
		while (
			currentIndex < pixelsPerGrid && currentIndex >= 0 &&
			currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 &&
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
			if (currentIndex > 2425 && currentIndex < 2455) {
				pixelArray[currentIndex * 4 + 0] += 127;
				collided = true; // ad hoc shadow-creating barrier
			} else {
				// applying lighting
				currentIndex = indexOfCoordinates[roundedX][roundedY];
				pixelArray[currentIndex * 4 + 0] += brightness / distanceFromIndexToIndex[parent.index][currentIndex];
			}

			// incrementing for next loop
			currentCoords.x += xStep;
			currentCoords.y += yStep;
		}
	}
}

function castRay(originIndex, xMagnitude, yMagnitude, brightness) {
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
		currentIndex < pixelsPerGrid && currentIndex >= 0 &&
		currentCoords.x >= 0 && currentCoords.x <= canvas.width - 1 &&
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
		if (currentIndex > 2425 && currentIndex < 2455) {
			pixelArray[currentIndex * 4 + 0] += 127;
			collided = true; // ad hoc shadow-creating barrier
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
		if (!entity.parent) { // entity is not a child of another entity
			// acceleration limited
			var absDx = entity.vx, // absolute values
				absDy = entity.vy;
			if (absDx < 0) absDx = -absDx;
			if (absDy < 0) absDy = -absDy;
			if (absDx + absDy > entity.maxAcceleration) {
				entity.dx *= entity.maxAcceleration / (absDx + absDy);
				entity.dy *= entity.maxAcceleration / (absDx + absDy);
			}
			
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
		} else { // entity is a child of another entity and moves with it
			entity.x = entity.parent.x + entity.childDisplacement.x;
			entity.y = entity.parent.y + entity.childDisplacement.y;
		}
		
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

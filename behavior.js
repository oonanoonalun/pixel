function chasing(entity, targetX, targetY, accelerationScale) {
	var entityIndex = indexOfCoordinates[entity.x][entity.y],
		targetIndex = indexOfCoordinates[targetX][targetY],
		xDistance = xDistanceFromIndexToIndex[entityIndex][targetIndex],
		yDistance = yDistanceFromIndexToIndex[entityIndex][targetIndex],
		magnitude = distanceFromIndexToIndex[entityIndex][targetIndex];
	if (magnitude === 0) magnitude = 0.001; // keeps us from dividing by zero
	entity.dx += xDistance / magnitude * accelerationScale;
	entity.dy += yDistance / magnitude * accelerationScale;
}

function fleeing(entity, targetX, targetY, accelerationScale) {
	var entityIndex = indexOfCoordinates[entity.x][entity.y],
		targetIndex = indexOfCoordinates[targetX][targetY],
		xDistance = xDistanceFromIndexToIndex[entityIndex][targetIndex],
		yDistance = yDistanceFromIndexToIndex[entityIndex][targetIndex],
		magnitude = distanceFromIndexToIndex[entityIndex][targetIndex];
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

function softLines(currentIndex, entitiesArray, areVertical) {
	// WRONG is only vertical lines right now
	// WRONG make lines able to freely rotate?
	var brightness = 0;
	if (areVertical) { // vertical lines
		for (var i = 0; i < entitiesArray.length; i++) {
			if (brightness > 0) brightness += entitiesArray[i].brightness / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
			else brightness -= entitiesArray[i].brightness / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		}
	} else { // horizontal lines
		
	}
	return brightness;
}

function softPoints(currentIndex, entitiesArray) {
	var brightness = 0;
    for (var i = 0; i < entitiesArray.length; i++) {
		brightness += entitiesArray[i].brightness /
		distanceFromIndexToIndex[currentIndex][indexOfCoordinates[entitiesArray[i].x][entitiesArray[i].y]];
		if (i === 0) {
			if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
		}
		if (i === 1) {
			if (pixelArray[currentIndex * 4 + 1] < brightness) pixelArray[currentIndex * 4 + 1] += brightness / 20;
		}
		if (i > 1) {
			if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
		}
	}
	//if (pixelArray[currentIndex * 4 + 0] < brightness) pixelArray[currentIndex * 4 + 0] += brightness / 20;
	//return brightness;
}

function pace(entity, pixelsMovedPerFrame, isVertical) {
	// WRONG should be able to start moving in the opposite direction (add an 'startsMovingPositively' parameter)
	// WRONG should be more-accurately-descriptive term than "indexArrayIndex"
	// WRONG if the speed is more than 1, the index will turn around prematurely.
	//		It should split its speed between getting to the edge and going back the other direction some.
	// WRONG, maybe. Could check distances instead of indices for hitting edges?
	if (isVertical) { // moving vertically
		if (
			entity.index < pixelsPerGrid - pixelsPerRow * pixelsMovedPerFrame && // i.e. wouldn't hit the bottom edge next frame
			(entity.isIndexMovingPositively || entity.isIndexMovingPositively === undefined)
		) {
			entity.index += pixelsPerRow * pixelsMovedPerFrame; // moves down
		} else entity.isIndexMovingPositively = false;
		if (entity.isIndexMovingPositively === false && entity.index >= pixelsPerRow * pixelsMovedPerFrame) {
			entity.index -= pixelsPerRow * pixelsMovedPerFrame;
		} else entity.isIndexMovingPositively = true;
	} else { // moving horizontally
		if (
			entity.index % pixelsPerRow < pixelsPerRow - pixelsMovedPerFrame && // i.e. wouldn't hit the right edge next frame
			(entity.isIndexMovingPositively || entity.isIndexMovingPositively === undefined)
		) {
			entity.index += pixelsMovedPerFrame; // moves down
		} else entity.isIndexMovingPositively = false;
		if (entity.isIndexMovingPositively === false && entity.index % pixelsPerRow >= pixelsMovedPerFrame) { // i.e. wouldn't hit the left edge next frame
			entity.index -= pixelsMovedPerFrame;
		} else entity.isIndexMovingPositively = true;
	}
}

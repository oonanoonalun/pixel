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

function chasing(entity, target, accelerationScale) {
	var xDistance = xDistanceFromIndexToIndex[entity.index][target.index],
		yDistance = yDistanceFromIndexToIndex[entity.index][target.index],
		magnitude = distanceFromIndexToIndex[entity.index][target.index];
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


function lineFromIndexToIndex(currentIndex, indexA, indexB, lineBrightness) {
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
	// WRONG: Math.round function call
	// this version lights up only the relevant points
	/*if (
			indexOfCoordinates[
				Math.round(paraY * (maxX - minX) + minX)
			][
				Math.round(paraX * (maxY - minY) + minY)
			] ===
			currentIndex
	) {
		return 2048;
	}*/
	// this version lights up any points selected by the heuristic based on their distance from the line-points
	// in-line rounding to avoid a function call
	var lineX = Math.round(paraY * xDiff + minX),
		lineY = Math.round(paraX * yDiff + minY);
	if (lineX % 1 >= 0.5) lineX += 1 - lineX % 1;
	if (lineX % 1 < 0.5 && lineX % 1 > -0.5) lineX -= lineX % 1;
	if (lineX % 1 <= -0.5) lineX -= 1 + lineX % 1;
	if (lineY % 1 >= 0.5) lineY += 1 - lineY % 1;
	if (lineY % 1 < 0.5 && lineY % 1 > -0.5) lineY -= lineY % 1;
	if (lineY % 1 <= -0.5) lineY -= 1 + lineY % 1;
	// WRONG: this could be dividing by 0, I'm pretty sure
	return lineBrightness / distanceFromIndexToIndex[currentIndex][indexOfCoordinates[lineX][lineY]];
}

function softLines(currentIndex, entitiesArray) {
	var localBrightness = 0;
	for (var i = 0; i < entitiesArray.length; i++) {
		localBrightness += entitiesArray[i].brightnessFront / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		localBrightness += entitiesArray[i].brightnessBack / -xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		//else brightness -= entitiesArray[i].brightness / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
	}
	return localBrightness;
}

function softPoints(currentIndex, entitiesArray) {
	var localBrightness = 0;
    for (var i = 0; i < entitiesArray.length; i++) {
		localBrightness += entitiesArray[i].brightness /
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
	return localBrightness;
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
		//entity.vx *= 0.5;
		//entity.vy *= 0.5;
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

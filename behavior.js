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

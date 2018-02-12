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
		entity.dx *= 0.9;
		entity.dy *= 0.9;
		
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
		if (entity === entities.points[0].altitude && entities.points[0].altitude === 0) {
			// friction higher when grounded
			entity.vx *= 0.6;
			entity.vy *= 0.6;
		} else {
			entity.vx *= 0.9;
			entity.vy *= 0.9;
		}
		
		// check for collisions next frame
		if (!entity.noCollision) collision = castCollisionVector(entity.index, entity.vx, entity.vy);
		var collisionUp = castAltitudeAndCollisionOrthogonalRay(entity, 'up');
		var collisionDown = castAltitudeAndCollisionOrthogonalRay(entity, 'down');
		var collisionLeft = castAltitudeAndCollisionOrthogonalRay(entity, 'left');
		var collisionRight = castAltitudeAndCollisionOrthogonalRay(entity, 'right');
		
		// slide or remove if collide
		if (!collisionUp && !collisionDown && !collisionLeft && !collisionRight) { // speed applied to position
			entity.x += entity.vx;
			entity.y += entity.vy;
		} else {
			if (collisionUp) {
				entity.x += entity.vx;
				entity.y = collisionUp;
			}
			if (collisionDown) {
				entity.x += entity.vx;
				entity.y = collisionDown;
			}
			if (collisionLeft) {
				entity.x = collisionLeft;
				entity.y += entity.vy;
			}
			if (collisionRight) {
				entity.x = collisionRight;
				entity.y += entity.vy;
			}
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
		// notification if player touches the edge of the screen
		if (entity.x < 0) {
			entity.x = 0;
			if (entity === entities.points[0]) console.log('player offscreen!');
		}
		if (entity.x > canvas.width - 1) {
			entity.x = canvas.width - 1;
			if (entity === entities.points[0]) console.log('player offscreen!');
		}
		if (entity.y < 0) {
			entity.y = 0;
			if (entity === entities.points[0]) console.log('player offscreen!');
		}
		if (entity.y > canvas.height - 1) {
			entity.y = canvas.height - 1;
			if (entity === entities.points[0]) console.log('player offscreen!');
		}
		
		// nearest array index assigned
		// NOTE: Changing an entities index won't move it, as its coords will just reset its index.
		//			To move an entity, change its coordinates.
		entity.index = indexOfCoordinates[entity.x][entity.y];
	}
}

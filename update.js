function updateEntities(entitiesArray) {
	// for each entity:
	// 		acceleration limited and applied to speed
	// 		speed limited and applied to position
	// 		position rounded to integer (for lookup tables) and constrained to canvas
	// 		nearest array index stored on entity object
	for (var i = 0; i < entitiesArray.length; i++) {
		var entity = entitiesArray[i],
			collisionUp = null,
			collisionDown = null,
			collisionLeft = null,
			collisionRight = null;
		
		// gravity
		// will maybe do gravity here. For now it's just for the player in input.js.
		
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
		var friction = 0.9;
		if (
			(platformer.gravity.direction === 'down' && entities.points[0].altitude.down === 0) ||
			(platformer.gravity.direction === 'up' && entities.points[0].altitude.up === 0) ||
			(platformer.gravity.direction === 'left' && entities.points[0].altitude.left === 0) ||
			(platformer.gravity.direction === 'right' && entities.points[0].altitude.right === 0)
		) {
			// friction higher when grounded
			friction = 0.6;
		} else {
			friction = 0.9;
		}
		// logging player friction
		//if (entity === entities.points[0] && frameCounter % 15 === 0) console.log(friction);
		entity.vx *= friction;
		entity.vy *= friction;
		
		// check for collisions next frame
		if (!entity.noCollision) {
			collisionUp = castAltitudeAndCollisionOrthogonalRay(entity, 'up');
			collisionDown = castAltitudeAndCollisionOrthogonalRay(entity, 'down');
			collisionLeft = castAltitudeAndCollisionOrthogonalRay(entity, 'left');
			collisionRight = castAltitudeAndCollisionOrthogonalRay(entity, 'right');
		}
		/*if (entity === entities.points[0] && frameCounter % 15 === 0) {
			console.log('collision udlr:', collisionUp, collisionDown, collisionLeft, collisionRight);
			console.log('altitude udlr:', entity.altitude.up, entity.altitude.down, entity.altitude.left, entity.altitude.right);
		}*/
		
		// stop on colliding axis, apply speed on non-colliding axes
		// WRONG should spawn a visual impact effect based on vx/y at time of impact
		if (!collisionUp && !collisionDown) entity.y += entity.vy;
		if (!collisionLeft && !collisionRight) entity.x += entity.vx;
		if (collisionUp) {
			entity.dy = 0;
			entity.vy = 0;
			entity.y = collisionUp;
		}
		if (collisionDown) {
			entity.dy = 0;
			entity.vy = 0;
			entity.y = collisionDown;
		}
		if (collisionLeft) {
			entity.dx = 0;
			entity.vx = 0;
			entity.x = collisionLeft;
		}
		if (collisionRight) {
			entity.dx = 0;
			entity.vx = 0;
			entity.x = collisionRight;
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

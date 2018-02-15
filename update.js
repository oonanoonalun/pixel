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
		
		// TEMP altitude might be integrated with collision... or not. For now it's isolated:
		castAltitudeRay(entity, 'down');
		castAltitudeRay(entity, 'up');
		castAltitudeRay(entity, 'left');
		castAltitudeRay(entity, 'right');
		castAltitudeRay(entity, 'downLeft');
		castAltitudeRay(entity, 'downRight');
		castAltitudeRay(entity, 'upLeft');
		castAltitudeRay(entity, 'upRight');
		
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
		// TEMP that this is commented out. Moving collision to later in the main loop.
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
		// TEMP that this is commented out. Moving collision to later in the main loop.
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
		
		// TEMP This only commented in if collision is commented out
		//entity.x += entity.vx;
		//entity.y += entity.vy;
	
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

function collision() {
    // WRONG, maybe. This might repeat work that could be instead stored on the entity during earlier raycasting and movment steps.
    for (var entityNumber = 0; entityNumber < entities.all.length; entityNumber++) {
        var entity = entities.all[entityNumber];
        if (!entity.noCollision) {
            if (propertiesOfIndex[entity.index].solid) {
                // NOTE: should some of these vars be calculated every frame and stored on the entity?
				//		Like maybe the player should have a vector with a magnitude of 1 at all times, plus a speed. That would
				//		would streamline some things that find all this stuff constantly.
                // WRONG, I think. Maybe just walk back x and y indices separately, index by index,
				//		then ... ? Something to lock the entities coorindate on on colliding axis and apply .v? on non-colliding axis.
				var absVx = entity.vx,
                    absVy = entity.vy,
                    backVx = -entity.vx,
                    backVy = -entity.vy;
                if (absVx < 0) absVx = -absVx;
                if (absVy < 0) absVy = -absVy;
                var vectorMag = absVx + absVy,
					xStepBack = backVx / vectorMag * scaledPixelSize,
					yStepBack = backVy / vectorMag * scaledPixelSize;
                while (
					propertiesOfIndex[entity.index].solid &&
					!propertiesOfIndex[entity.index].perimeter
				) {
                    entity.x += xStepBack;
                    entity.y += yStepBack;
                    var roundedX = entity.x,
						roundedY = entity.y;
                    if (roundedX % 1 >= 0.5) roundedX += 1 - roundedX % 1;
                    if (roundedX % 1 < 0.5 && roundedX % 1 > -0.5) roundedX -= roundedX % 1;
                    if (roundedX % 1 <= -0.5) roundedX -= 1 + roundedX % 1;
                    if (roundedY % 1 >= 0.5) roundedY += 1 - roundedY % 1;
                    if (roundedY % 1 < 0.5 && roundedY % 1 > -0.5) roundedY -= roundedY % 1;
                    if (roundedY % 1 <= -0.5) roundedY -= 1 + roundedY % 1;
                    entity.index = indexOfCoordinates[roundedX][roundedY];
                }
				castAltitudeRay(entity, 'down');
				console.log(entity.altitude.down);
            }
        }
    }
}

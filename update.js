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
			collisionRight = null,
			collisionUpLeft = null,
			collisionUpRight = null,
			collisionDownLeft = null,
			collisionDownRight = null;
		
		entity.collided = false;
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
		entity.absVx = entity.vx;
		if (entity.absVx < 0) entity.absVx = -entity.absVx;
		entity.absVy = entity.vy;
		if (entity.absVy < 0) entity.absVy = -entity.absVy;
		entity.v = entity.absVx + entity.absVy;
		
		// speed limited
		var absVx = entity.vx, // absolute values
			absVy = entity.vy;
		if (absVx < 0) absVx = -absVx;
		if (absVy < 0) absVy = -absVy;
		if (absVx + absVy > entity.maxSpeed) {
			entity.vx *= entity.maxSpeed / (absVx + absVy);
			entity.vy *= entity.maxSpeed / (absVx + absVy);
		}
		
		// TEMP altitude might be integrated with collision... or not.
		/*castAltitudeRay(entity, 'down');
		castAltitudeRay(entity, 'up');
		castAltitudeRay(entity, 'left');
		castAltitudeRay(entity, 'right');
		castAltitudeRay(entity, 'downLeft');
		castAltitudeRay(entity, 'downRight');
		castAltitudeRay(entity, 'upLeft');
		castAltitudeRay(entity, 'upRight');*/
		
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
			collisionUp = castAltitudeAndCollisionRay(entity, 'up');
			collisionDown = castAltitudeAndCollisionRay(entity, 'down');
			collisionLeft = castAltitudeAndCollisionRay(entity, 'left');
			collisionRight = castAltitudeAndCollisionRay(entity, 'right');
			collisionUpLeft = castAltitudeAndCollisionRay(entity, 'upLeft');
			collisionUpRight = castAltitudeAndCollisionRay(entity, 'upRight');
			collisionDownLeft = castAltitudeAndCollisionRay(entity, 'downLeft');
			collisionDownRight = castAltitudeAndCollisionRay(entity, 'downRight');
			if (frameCounter % 15 === 0 && entity === entities.points[0]) {
				console.log('altitude down:', entity.altitude.down, 'altitude right:', entity.altitude.right);
			}
		}
		if (entity.noCollision) {
			entity.x += entity.vx;
			entity.y += entity.vy;
		}
		
		if (!entity.collided) {
			entity.x += entity.vx;
			entity.y += entity.vy;
		}
		
		// position constrainted to canvas
 		// notification if player touches the edge of the screen
 		if (entity.x < 0) {
 			entity.x = 0;
 			//if (entity === entities.points[0]) console.log('player offscreen!');
 		}
 		if (entity.x > canvas.width - 1) {
 			entity.x = canvas.width - 1;
 			//if (entity === entities.points[0]) console.log('player offscreen!');
 		}
 		if (entity.y < 0) {
 			entity.y = 0;
 			//if (entity === entities.points[0]) console.log('player offscreen!');
 		}
 		if (entity.y > canvas.height - 1) {
 			entity.y = canvas.height - 1;
 			//if (entity === entities.points[0]) console.log('player offscreen!');
 		}
	
		// coordinates rounded (important or indexOfCoordinates[entity.x][enitity.y] and propertiesOfIndex[] won't work)
		// avoiding a Math.round() function call
		// note: onscreen things won't have negative coords, but offscreen ones might, so this covers that.
		entity.xRounded = entity.x;
		entity.yRounded = entity.y;
		if (entity.xRounded % 1 >= 0.5) entity.xRounded += 1 - entity.xRounded % 1;
		if (entity.xRounded % 1 < 0.5 && entity.xRounded % 1 > -0.5) entity.xRounded -= entity.xRounded % 1;
		if (entity.xRounded % 1 <= -0.5) entity.xRounded -= 1 + entity.xRounded % 1;
		if (entity.yRounded % 1 >= 0.5) entity.yRounded += 1 - entity.yRounded % 1;
		if (entity.yRounded % 1 < 0.5 && entity.yRounded % 1 > -0.5) entity.yRounded -= entity.yRounded % 1;
		if (entity.yRounded % 1 <= -0.5) entity.yRounded -= 1 + entity.yRounded % 1;
		
		// nearest array index assigned
		// NOTE: Changing an entities index won't move it, as its coords will just reset its index.
		//			To move an entity, change its coordinates.
		entity.previousIndex = entity.index; // WRONG, maybe. Is there any point in doing this?
		entity.index = indexOfCoordinates[entity.xRounded][entity.yRounded];
	}
}

// WRONG DOESN'T WORK and not used. It's intended purpose is to deal with interactions where a moving bit of level geometry would overlap,
//		an entity's position, and should instead push that entity, but it doesn't do that.
function interiorCollision() {
    // WRONG, maybe. This might repeat work that could be instead stored on the entity during earlier raycasting and movment steps.
    for (var entityNumber = 0; entityNumber < entities.all.length; entityNumber++) {
        var entity = entities.all[entityNumber];
        if (!entity.noCollision) {
            if (solidOfIndex[entity.index]) {
                // NOTE: should some of these vars be calculated every frame and stored on the entity?
				//		Like maybe the player should have a vector with a magnitude of 1 at all times, plus a speed. That would
				//		would streamline some things that find all this stuff constantly. Some version of this work correctly under very limited conditions.
				var absVx = entity.vx,
                    absVy = entity.vy,
                    backVx = -entity.vx,
                    backVy = -entity.vy;
                if (absVx < 0) absVx = -absVx;
                if (absVy < 0) absVy = -absVy;
                var vectorMag = absVx + absVy,
					xStepBack = backVx / vectorMag * scaledPixelSize,
					yStepBack = backVy / vectorMag * scaledPixelSize;
				// WRONG this doesn't work for lots of reasons, so I'm adding this for the moment:
				xStepBack = scaledPixelSize;
				yStepBack = scaledPixelSize;
                while (
					solidOfIndex[entity.index] &&
					!perimeterOfIndex[entity.index]
				) {
					console.log("interiorCollision() 'while' loop");
					// WRONG. This doesn't work when solids overtake the entity, both moving in the same direction
					// 		Also doesn't work if entity isn't moving.
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
					
                    entity.index = indexOfCoordinates[roundedX][roundedX];
                }
				//castAltitudeRay(entity, 'down');
				//console.log(entity.altitude.down);
            }
        }
    }
}

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
		var absDx = entity.dx, // absolute values
			absDy = entity.dy;
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
			/*if (frameCounter % 15 === 0 && entity === entities.points[0]) {
				console.log('altitude down:', entity.altitude.down, 'altitude right:', entity.altitude.right);
			}*/
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
		// NOTE: Changing an entity's index won't move it, as its coords will just reset its index.
		//			To move an entity, change its coordinates.
		entity.previousIndex = entity.index; // WRONG, maybe. Is there any point in doing this?
		// non- '3D'
		if (entity.z === undefined) entity.index = indexOfCoordinates[entity.xRounded][entity.yRounded];
		
		// '3D' test:
		if (entity.z !== undefined) {
			// 'sx' and 'sy' mean 'screenX' and 'screenY'
			var zoomFactor = entity.z * entity.z * 50e-5 + 1; // '+ 1' prevents dividing by zero
			if (entity.x > 0.5 * canvas.width) entity.sx = canvas.width * 0.5 + ((entity.x - canvas.width * 0.5) / zoomFactor);
			else entity.sx = canvas.width * 0.5 - ((canvas.width * 0.5 - entity.x) / zoomFactor);
			if (entity.y > 0.5 * canvas.height) entity.sy = canvas.height * 0.5 + ((entity.y - canvas.height * 0.5) / zoomFactor);
			else entity.sy = canvas.height * 0.5 - ((canvas.height * 0.5 - entity.y) / zoomFactor);
			
			entity.sxRounded = entity.sx;
			entity.syRounded = entity.sy;
			
			if (entity.sxRounded % 1 >= 0.5) entity.sxRounded += 1 - entity.sxRounded % 1;
			if (entity.sxRounded % 1 < 0.5 && entity.sxRounded % 1 > -0.5) entity.sxRounded -= entity.sxRounded % 1;
			if (entity.sxRounded % 1 <= -0.5) entity.sxRounded -= 1 + entity.sxRounded % 1;
			if (entity.syRounded % 1 >= 0.5) entity.syRounded += 1 - entity.syRounded % 1;
			if (entity.syRounded % 1 < 0.5 && entity.syRounded % 1 > -0.5) entity.syRounded -= entity.syRounded % 1;
			if (entity.syRounded % 1 <= -0.5) entity.syRounded -= 1 + entity.syRounded % 1;
			
			entity.index = indexOfCoordinates[entity.sxRounded][entity.syRounded];
		}
	}
}

/*updateMeshes(meshArray) {
	for (var i = 0; i < meshArray.length; i++) {
		var mesh = meshArray[i];
		
		// acceleration limited
		var absDx = mesh.dx, // absolute values
			absDy = mesh.dy,
			absDz = mesh.dz;
		if (absDx < 0) absDx = -absDx;
		if (absDy < 0) absDy = -absDy;
		if (absDz < 0) absDz = -absDz;
		mesh.d = absDx + absDy + absDz;
		if (d > mesh.maxAcceleration) {
			mesh.dx *= mesh.maxAcceleration / mesh.d;
			mesh.dy *= mesh.maxAcceleration / mesh.d;
			mesh.dz *= mesh.maxAcceleration / mesh.d;
		}
		
		// WRONG, maybe. Shouldn't this be necessary? Should log dx and dy sometimes.
		//		You wouldn't want to be still, but have an old dx/dy to overcome when you start moving.
		// acceleration decays
		var accelerationDecay = 0.9;
		mesh.dx *= accelerationDecay;
		mesh.dy *= accelerationDecay;
		mesh.dz *= accelerationDecay;
		
		// acceleration applied to speed
		mesh.vx += mesh.dx;
		mesh.vy += mesh.dy;
		mesh.vz += mesh.dz;
		
		// speed limited
		mesh.absVx = mesh.vx; // absolute values
		mesh.absVy = mesh.vy;
		mesh.absVz = mesh.vz;
		if (mesh.absVx < 0) mesh.absVx = -mesh.absVx;
		if (mesh.absVy < 0) mesh.absVy = -mesh.absVy;
		if (mesh.absVz < 0) mesh.absVz = -mesh.absVz;
		mesh.v = mesh.absVx + mesh.absVy + mesh.absVz;
		if (mesh.v > mesh.maxSpeed) {
			mesh.vx *= mesh.maxSpeed / mesh.v;
			mesh.vy *= mesh.maxSpeed / mesh.v;
			mesh.vz *= mesh.maxSpeed / mesh.v;
		}
		
		// friction applied to speed
		var friction = 0.9;
		mesh.vx *= friction;
		mesh.vy *= friction;
		mesh.vz *= friction;
		
		// collision could go here
		if (mesh.noCollision) {
			mesh.x += mesh.vx;
			mesh.y += mesh.vy;
			mesh.z += mesh.vz;
		}
		
		// position constrainted to canvas
 		// notification if player touches the edge of the screen
 		if (mesh.x < 0) {
 			mesh.x = 0;
 			//if (mesh === entities.points[0]) console.log('player offscreen!');
 		}
 		if (mesh.x > canvas.width - 1) {
 			mesh.x = canvas.width - 1;
 			//if (mesh === entities.points[0]) console.log('player offscreen!');
 		}
 		if (mesh.y < 0) {
 			mesh.y = 0;
 			//if (mesh === entities.points[0]) console.log('player offscreen!');
 		}
 		if (mesh.y > canvas.height - 1) {
 			mesh.y = canvas.height - 1;
 			//if (mesh === entities.points[0]) console.log('player offscreen!');
 		}
		if (mesh.z < 0) {
			mesh.z = 0;
		}
		if (mesh.z > canvas.height - 1) {
			mesh.z = canvas.height - 1;
		}

		// coordinates rounded (important or indexOfCoordinates[mesh.x][enitity.y] and propertiesOfIndex[] won't work)
		// avoiding a Math.round() function call
		// note: onscreen things won't have negative coords, but offscreen ones might, so this covers that.
		
		// WRONG: vert coords are still in global space
		
		for (var v = 0; v < mesh.verts.length; v++) {
			let vert = mesh.verts[v];
			mesh.vertsRounded[v] = [vert[0], vert[1], vert[2], 0];
			var vertR = mesh.vertsRounded[v]; // i.e. vert rounded
			if (vertR[0] % 1 >= 0.5) vertR[0] += 1 - vertR[0] % 1;
			if (vertR[0] % 1 < 0.5 && vertR[0] % 1 > -0.5) vertR[0] -= vertR[0] % 1;
			if (vertR[0] % 1 <= -0.5) vertR[0] -= 1 + vertR[0] % 1;
			if (vertR[1] % 1 >= 0.5) vertR[1] += 1 - vertR[1] % 1;
			if (vertR[1] % 1 < 0.5 && vertR[1] % 1 > -0.5) vertR[1] -= vertR[1] % 1;
			if (vertR[1] % 1 <= -0.5) vertR[1] -= 1 + vertR[1] % 1;
			if (vertR[2] % 1 >= 0.5) vertR[2] += 1 - vertR[2] % 1;
			if (vertR[2] % 1 < 0.5 && vertR[2] % 1 > -0.5) vertR[2] -= vertR[2] % 1;
			if (vertR[2] % 1 <= -0.5) vertR[2] -= 1 + vertR[2] % 1;
			
			// nearest array index assigned
			// NOTE: Changing an entity's index won't move it, as its coords will just reset its index.
			//			To move an vert, change its coordinates.
			// non-'3D', or at the front plane
			if (!vertR[2]) vert[3] = indexOfCoordinates[vertR[0]][vertR[1]];
			
			
			// WRONG FROM HERE DOWN. working on translating the below stuff into something that works with vert format
			// '3D', or with a nonzero z value
			if (vertR[2]) {
				// 'sx' and 'sy' mean 'screenX' and 'screenY'
				// WRONG: this '* 50e-5' should just be dividing by a big integer
				var zoomFactor = vert[2] * vert[2] * 50e-5 + 1; // '+ 1' prevents dividing by zero
				if (vert[0] > 0.5 * canvas.width) vert.sx = canvas.width * 0.5 + ((vert.x - canvas.width * 0.5) / zoomFactor);
				else vert.sx = canvas.width * 0.5 - ((canvas.width * 0.5 - vert.x) / zoomFactor);
				if (vert[1] > 0.5 * canvas.height) vert.sy = canvas.height * 0.5 + ((vert.y - canvas.height * 0.5) / zoomFactor);
				else vert.sy = canvas.height * 0.5 - ((canvas.height * 0.5 - vert.y) / zoomFactor);
				
				vert.sxRounded = vert.sx;
				vert.syRounded = vert.sy;
				
				if (vert.sxRounded % 1 >= 0.5) vert.sxRounded += 1 - vert.sxRounded % 1;
				if (vert.sxRounded % 1 < 0.5 && vert.sxRounded % 1 > -0.5) vert.sxRounded -= vert.sxRounded % 1;
				if (vert.sxRounded % 1 <= -0.5) vert.sxRounded -= 1 + vert.sxRounded % 1;
				if (vert.syRounded % 1 >= 0.5) vert.syRounded += 1 - vert.syRounded % 1;
				if (vert.syRounded % 1 < 0.5 && vert.syRounded % 1 > -0.5) vert.syRounded -= vert.syRounded % 1;
				if (vert.syRounded % 1 <= -0.5) vert.syRounded -= 1 + vert.syRounded % 1;
				
				vert.index = indexOfCoordinates[vert.sxRounded][vert.syRounded];
			}
		}
	}
}*/

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

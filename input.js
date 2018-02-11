var KEY_W = 87,
        KEY_S = 83,
        KEY_A = 65,
        KEY_D = 68,
        KEY_SPACE = 32,
        KEY_Q = 81,
        KEY_E = 69,
        KEY_Z = 90,
        KEY_X = 88,
        KEY_C = 67,
        KEY_0 = 48,
        KEY_1 = 49,
        KEY_2 = 50,
        KEY_3 = 51,
        KEY_4 = 52,
        KEY_5 = 53,
        KEY_6 = 54,
        KEY_7 = 55,
        KEY_8 = 56,
        KEY_9 = 57,
        KEY_I = 73,
        KEY_J = 74,
        KEY_K = 75,
        KEY_L = 76,
        KEY_O = 79,
        KEY_U = 85,
        KEY_M = 77,
        KEY_R = 82,
        KEY_V = 86,
        KEY_F = 70,
        KEY_P = 80,
        KEY_SEMICOLON = 186,
        KEY_SLASH = 220,
        KEY_COMMA = 188,
        KEY_PERIOD = 190,
        keysDown = {};
		
$('body').on('keydown', event => {
   keysDown[event.which] = true;
});
$('body').on('keyup', event => {
   keysDown[event.which] = false;
});
//////////////////////
// MOUSE
/////////////////////////////////////////////
// All from Chris for mouse cursor tracking

var mouseX = 0,
	 mouseY = 0;

$(document).on("mousemove", event => {
	mouseX = event.pageX;
	mouseY = event.pageY;
});

var relativeMousePosition = (element) => {
	var elementOffset = $(element).offset();
	// constraining the returned values to inside the canvas
	// could remove these vars and just do Math.max(0, ...), but it might be slower(?)
	var localX = mouseX - elementOffset.left,
	    localY = mouseY - elementOffset.top;
	if (localX < 0) localX = 0;
	if (localY < 0) localY = 0;
	if (localX > canvas.width - 1) localX = canvas.width - 1;
	if (localY > canvas.height - 1) localY = canvas.height - 1;
	// rounding // NOTE: for a while, the mouse coords were always integers (without rounding), but then they weren't (x always had an extra 0.800007 or something). I don't know what happened.
	if (localX % 1 >= 0.5) localX += 1 - localX % 1;
	if (localX % 1 < 0.5 && localX % 1 > -0.5) localX -= localX % 1;
	if (localX % 1 <= -0.5) localX -= 1 + localX % 1;
	if (localY % 1 >= 0.5) localY += 1 - localY % 1;
	if (localY % 1 < 0.5 && localY % 1 > -0.5) localY -= localY % 1;
	if (localY % 1 <= -0.5) localY -= 1 + localY % 1;
	return {x: localX, y: localY, index: indexOfCoordinates[localX][localY]}; // assigning mouse position index. Only more efficient overall if its being referenced one or more times per frame.
};

// end mouse stuff from Chris
/////////////////////////////////////////////



// end mouse
//////////////////////////

function controls(acceleration, beamNarrowness, bControlSpotlight) {
	// movement
	// left handed
	if (keysDown[KEY_E]) entities.points[0].dy -= acceleration;
	if (keysDown[KEY_D]) entities.points[0].dy += acceleration;
	if (keysDown[KEY_S]) entities.points[0].dx -= acceleration;
	if (keysDown[KEY_F]) entities.points[0].dx += acceleration;
	
	// right handed
	if (keysDown[KEY_I]) entities.points[0].dy -= acceleration;
	if (keysDown[KEY_K]) entities.points[0].dy += acceleration;
	if (keysDown[KEY_J]) entities.points[0].dx -= acceleration;
	if (keysDown[KEY_L]) entities.points[0].dx += acceleration;
	
	// spotlight control
	// mouse aims spotlight
	entities.points[1].x = currentMousePosition.x;
	entities.points[1].y = currentMousePosition.y;
	
	// change spotlight width
	if ((keysDown[KEY_R] || keysDown[KEY_U]) && player.spotlight.narrowness < 8) player.spotlight.narrowness += 0.25;
	if ((keysDown[KEY_W] || keysDown[KEY_O]) && player.spotlight.narrowness > 2) player.spotlight.narrowness -= 0.5;
}


function controlsPlatformer(acceleration, jumpAcceleration, beamNarrowness, bControlSpotlight) {
	var player = entities.points[0];
	// calculate altitude
	player.altitude = castAltitudeRay(player.index);
	
	// initializing jump
	if (frameCounter === 1) {
		var secondsOfJumpThrust = 0.1;
		entities.points[0].maxJumpEnergy = jumpAcceleration * secondsOfJumpThrust * frameRate;
		entities.points[0].jumpEnergy = entities.points[0].maxJumpEnergy;
		player.jumpRechargeDelayOnDepletion = 45; // frames after depleting jump energy completely before jump energy begins recharging
	}
	
	// gravity
	if (platformer.gravity.direction === 'down') player.vy += platformer.gravity.magnitude;
	if (platformer.gravity.direction === 'up') player.vy -= platformer.gravity.magnitude;
	if (platformer.gravity.direction === 'right') player.vx += platformer.gravity.magnitude;
	if (platformer.gravity.direction === 'left') player.vx -= platformer.gravity.magnitude;
	
	// movement left handed
	if (platformer.gravity.direction === 'left' || platformer.gravity.direction === 'right') {
		if (keysDown[KEY_E]) player.dy -= acceleration;
		if (keysDown[KEY_D]) player.dy += acceleration;
	}
	if (platformer.gravity.direction === 'up' || platformer.gravity.direction === 'down') {
		if (keysDown[KEY_S]) player.dx -= acceleration;
		if (keysDown[KEY_F]) player.dx += acceleration;
	}
	// movement right handed
	if (platformer.gravity.direction === 'left' || platformer.gravity.direction === 'right') {
		if (keysDown[KEY_I]) player.dy -= acceleration;
		if (keysDown[KEY_K]) player.dy += acceleration;
	}
	if (platformer.gravity.direction === 'up' || platformer.gravity.direction === 'down') {
		if (keysDown[KEY_J]) player.dx -= acceleration;
		if (keysDown[KEY_L]) player.dx += acceleration;
	}
	
	// jump (jetpack)
	if (platformer.gravity.direction === 'down') {
		if ((keysDown[KEY_E] || keysDown[KEY_I]) && player.jumpEnergy > 0) {
			player.dy -= jumpAcceleration;
			player.jumpEnergy -= jumpAcceleration;
		}
	}
	if (platformer.gravity.direction === 'up') {
		if ((keysDown[KEY_D] || keysDown[KEY_K]) && player.jumpEnergy > 0) {
			player.dy += jumpAcceleration;
			player.jumpEnergy -= jumpAcceleration;
		}
	}
	if (platformer.gravity.direction === 'left') {
		if ((keysDown[KEY_F] || keysDown[KEY_L]) && player.jumpEnergy > 0) {
			player.dx += jumpAcceleration;
			player.jumpEnergy -= jumpAcceleration;
		}
	}
	if (platformer.gravity.direction === 'right') {
		if ((keysDown[KEY_S] || keysDown[KEY_J]) && player.jumpEnergy > 0) {
			player.dx -= jumpAcceleration;
			player.jumpEnergy -= jumpAcceleration;
		}
	}
	
	// jump energy management
	if (player.altitude === 0) player.jumpEnergy = player.maxJumpEnergy;
	
	// spotlight control
	// mouse aims spotlight
	entities.points[1].x = currentMousePosition.x;
	entities.points[1].y = currentMousePosition.y;
	
	// change spotlight width
	if ((keysDown[KEY_R] || keysDown[KEY_U]) && player.spotlight.narrowness < 8) player.spotlight.narrowness += 0.25;
	if ((keysDown[KEY_W] || keysDown[KEY_O]) && player.spotlight.narrowness > 2) player.spotlight.narrowness -= 0.5;
}

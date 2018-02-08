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

function pointZeroControls(acceleration) {
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
}


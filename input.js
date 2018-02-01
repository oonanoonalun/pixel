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
	return {x: mouseX - elementOffset.left, y: mouseY - elementOffset.top};
};

// end mouse stuff from Chris
/////////////////////////////////////////////



// end mouse
//////////////////////////


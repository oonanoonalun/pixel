var canvas = $('canvas')[0],
    context = canvas.getContext('2d'),
	pixelsPerRow = 80,
	pixelsPerColumn = Math.round(canvas.height / canvas.width * pixelsPerRow), // the Math.round() doesn't matter for the 80x60 resolution, but the system
	pixelsPerGrid = pixelsPerRow * pixelsPerColumn,
	scaledPixelSize = canvas.width / pixelsPerRow,
    imageData = context.createImageData(pixelsPerRow, pixelsPerColumn),
	pixelArray = imageData.data,
	entities = {
		'points': [],
		'meshes': [],
		'all': []
	},
	effects = {
		'snow': {},
		'snowflakes': []
	},
	platformer = {
		'gravity': {
			'direction': 'right', // valid entries are 'up', 'down', 'left', and 'right'
			'magnitude': 1
		}
	},
	frameCounter = 1;

initializeRGBAChannels();

function initializePointEntities() {
	// key (numbers are entities.points[n]):
	//		0 = player
	//		1 = player spotlight target or general-purpose target
	//		2 = autonomous agent with light
	//		3 = autonomous agent with box of collision
	entities.points = [];
	for (var j = 0; j < 4; j++) {
		point = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'z': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'absVx': 0,
			'dy': 0,
			'vy': 0,
			'absVy': 0,
			'dz': 0,
			'vz': 0,
			'absVz': 0,
			'v': 0,
			'maxAcceleration': 5,
			'maxSpeed': 4,
			'noCollision': true,
			'altitude': {
				'up': null,
				'down': null,
				'left': null,
				'right': null,
				'forward': null,
				'back': null
			},
			'brightness': 256,
			'type': 'point',
			'target': null,	// WRONG, maybe. Doesn't need to be initialized? Same for lines.
			'shouldBeRemoved': false // WRONG: Doesn't need to be initialized. Same for lines.
		};
		point.index = indexOfCoordinates[point.x][point.y];
		point.previousIndex = point.index;
		point.xRounded = point.x;
		point.yRounded = point.y;
		entities.points.push(point);
		entities.all.push(point);
	}
	// point 0
	entities.points[0].spotlight = {
		'brightness': 384,
		'narrowness': 3.75
	};
	entities.points[0].noCollision = false;
	// point 1
	entities.points[1].maxSpeed = 25;
	entities.points[1].z = 0;
	// point 2
	entities.points[2].noCollision = true; // WRONG this is weird. Think about how to deal with obstacle-obstacle collision. If this isn't true, the object collides with the solid things built around it if all the blocks around it are built as solid.
	entities.points[2].spotlight = {
		'brightness': 384,
		'narrowness': 1
	};
	entities.points[2].maxSpeed = 4;
}

function initializeMeshEntities() {
	// key (numbers are entities.points[n]):
	//		0 = player
	//		1 = player spotlight target or general-purpose target
	//		2 = autonomous agent with light
	//		3 = autonomous agent with box of collision
	entities.meshes = [];
	for (var j = 0; j < 1; j++) {
		mesh = {
			'x': Math.round(Math.random() * (canvas.width - 1)),
			'y': Math.round(Math.random() * (canvas.height - 1)),
			'z': Math.round(Math.random() * (canvas.height - 1)),
			'dx': 0,
			'vx': 0,
			'absVx': 0,
			'dy': 0,
			'vy': 0,
			'absVy': 0,
			'dz': 0,
			'vz': 0,
			'absVz': 0,
			'v': 0,
			'verts': [],
			'vertsRounded': [],
			'scale': scaledPixelSize * 4,
			'maxAcceleration': 5,
			'maxSpeed': 4,
			'noCollision': true,
			'brightness': 256,
			'type': 'mesh',
			'target': null,	// WRONG, maybe. Doesn't need to be initialized? Same for lines.
			'shouldBeRemoved': false // WRONG: Doesn't need to be initialized. Same for lines.
		};
		mesh.index = indexOfCoordinates[mesh.x][mesh.y];
		mesh.previousIndex = mesh.index;
		mesh.xRounded = mesh.x;
		mesh.yRounded = mesh.y;
		mesh.zRounded = mesh.z;
		entities.meshes.push(mesh);
		entities.all.push(mesh);
	}
	entities.meshes[0].verts = [
		// cube corners
		// x, y, and z displacements from mesh origin
		// last item is index, which won't actually be set until the first time updateMeshes() runs.
		[1, 1, 1, 0],
		[1, 1, -1, 0],
		[1, -1, 1, 0],
		[-1, 1, 1, 0],
		[-1, -1, 1, 0],
		[1, -1, -1, 0],
		[-1, 1, -1, 0],
		[-1, -1, -1, 0]
	];
	entities.meshes[0].verts = scaleMesh(entities.meshes[0].verts, entities.meshes[0].scale);
}

function scaleMesh(meshVerts, scale) {
	var scaledVerts = [];
	for (var i = 0; i < meshVerts.length; i++) {
		scaledVerts.push([]);
		for (var j = 0; j < 3; j++) {
			scaledVerts[i].push(meshVerts[i][j] * scale);
		}
	}
	return scaledVerts;
}

function initializeRGBAChannels() {
	for (var i = 0; i < pixelArray.length; i++) {
		pixelArray[i * 4 + 0] = 0;
		pixelArray[i * 4 + 1] = 0;
		pixelArray[i * 4 + 2] = 48;
		pixelArray[i * 4 + 3] = 255;
	}
}
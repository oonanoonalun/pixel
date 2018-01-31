
// non-object-based version
function pace(entity, pixelsMovedPerFrame, isVertical) {
	// WRONG should be able to start moving in the opposite direction (add an 'startsMovingPositively' parameter)
	// WRONG should be more-accurately-descriptive term than "indexArrayIndex"
	// WRONG if the speed is more than 1, the index will turn around prematurely.
	//		It should split its speed between getting to the edge and going back the other direction some.
	// WRONG, maybe. Could check distances instead of indices for hitting edges?
	if (isVertical) { // moving vertically
		if (
			entity.index < pixelsPerGrid - pixelsPerRow * pixelsMovedPerFrame && // i.e. wouldn't hit the bottom edge next frame
			(entity.isIndexMovingPositively || entity.isIndexMovingPositively === undefined)
		) {
			entity.index += pixelsPerRow * pixelsMovedPerFrame; // moves down
		} else entity.isIndexMovingPositively = false;
		if (entity.isIndexMovingPositively === false && entity.index >= pixelsPerRow * pixelsMovedPerFrame) {
			entity.index -= pixelsPerRow * pixelsMovedPerFrame;
		} else entity.isIndexMovingPositively = true;
	} else { // moving horizontally
		if (
			entity.index % pixelsPerRow < pixelsPerRow - pixelsMovedPerFrame && // i.e. wouldn't hit the right edge next frame
			(entity.isIndexMovingPositively || entity.isIndexMovingPositively === undefined)
		) {
			entity.index += pixelsMovedPerFrame; // moves down
		} else entity.isIndexMovingPositively = false;
		if (entity.isIndexMovingPositively === false && entity.index % pixelsPerRow >= pixelsMovedPerFrame) { // i.e. wouldn't hit the left edge next frame
			entity.index -= pixelsMovedPerFrame;
		} else entity.isIndexMovingPositively = true;
	}
}

function softLines(currentIndex, entitiesArray, areVertical) {
	// WRONG is only vertical lines right now
	// WRONG make lines able to freely rotate?
	var brightness = 0;
	if (areVertical) { // vertical lines
		for (var i = 0; i < entitiesArray.length; i++) {
			if (brightness > 0) brightness += 2048 / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
			else brightness -= entitiesArray[i].brightness / xDistanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
		}
	} else { // horitzontal lines
		
	}
	return brightness / entitiesArray.length;
}

function softPoints(currentIndex, entitiesArray) {
	var brightness = 0;
    for (var i = 0; i < entitiesArray.length; i++) {
		brightness += entitiesArray[i].brightness / distanceFromIndexToIndex[currentIndex][entitiesArray[i].index];
	}
	return brightness / entitiesArray.length;
}

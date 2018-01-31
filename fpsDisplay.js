var fpsDisplay = {
		'frameCounter': 0,
		'framesSinceLastDisplay': 0,
		'framesSinceLastDisplayLongTerm': 0
	};

function countFps(displayIntervalInSeconds, displayIntervalLongTermInSeconds) {
    fpsDisplay.frameCounter++;
    fpsDisplay.framesSinceLastDisplay++;
    fpsDisplay.framesSinceLastDisplayLongTerm++;
    // short-term average
    if (fpsDisplay.noFpsDisplayUntil <= Date.now() || !fpsDisplay.noFpsDisplayUntil) {
        var averageFpsSinceLastDisplay,
            recentFrames = fpsDisplay.framesSinceLastDisplay;
        averageFpsSinceLastDisplay = Math.round(recentFrames / displayIntervalInSeconds);
        if (averageFpsSinceLastDisplay) console.log('FPS average over ' + displayIntervalInSeconds + ' seconds: ' + averageFpsSinceLastDisplay);
        fpsDisplay.framesSinceLastDisplay = 0;
        fpsDisplay.noFpsDisplayUntil = Date.now() + displayIntervalInSeconds * 1000;
    }
    // long-term average
    if (fpsDisplay.noFpsDisplayLongTermUntil <= Date.now() || !fpsDisplay.noFpsDisplayLongTermUntil) {
        var averageFpsSinceLastDisplayLongTerm,
            recentFramesLongTerm = fpsDisplay.framesSinceLastDisplayLongTerm;
        averageFpsSinceLastDisplayLongTerm = Math.round(recentFramesLongTerm / displayIntervalLongTermInSeconds);
        if (averageFpsSinceLastDisplayLongTerm) console.log('FPS average over ' + displayIntervalLongTermInSeconds + ' seconds: ' + averageFpsSinceLastDisplayLongTerm);
        fpsDisplay.framesSinceLastDisplayLongTerm = 0;
        fpsDisplay.noFpsDisplayLongTermUntil = Date.now() + displayIntervalLongTermInSeconds * 1000;
    }
}
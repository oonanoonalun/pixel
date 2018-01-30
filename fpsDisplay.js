var fpsDisplay = {
		'frameCounter': 0,
		'framesSinceLastDisplay': 0,
		'framesSinceLastDisplayLongTerm': 0
	};

function countFps(displayInterval, displayIntervalLongTerm) {
    fpsDisplay.frameCounter++;
    fpsDisplay.framesSinceLastDisplay++;
    fpsDisplay.framesSinceLastDisplayLongTerm++;
    // short-term average
    if (fpsDisplay.noFpsDisplayUntil <= Date.now() || !fpsDisplay.noFpsDisplayUntil) {
        var averageFpsSinceLastDisplay,
            recentFrames = fpsDisplay.framesSinceLastDisplay;
        averageFpsSinceLastDisplay = Math.round(recentFrames / (displayInterval / 1000));
        if (averageFpsSinceLastDisplay) console.log('FPS average over ' + displayInterval / 1000 + ' seconds: ' + averageFpsSinceLastDisplay);
        fpsDisplay.framesSinceLastDisplay = 0;
        fpsDisplay.noFpsDisplayUntil = Date.now() + displayInterval;
    }
    // long-term average
    if (fpsDisplay.noFpsDisplayLongTermUntil <= Date.now() || !fpsDisplay.noFpsDisplayLongTermUntil) {
        var averageFpsSinceLastDisplayLongTerm,
            recentFramesLongTerm = fpsDisplay.framesSinceLastDisplayLongTerm;
        averageFpsSinceLastDisplayLongTerm = Math.round(recentFramesLongTerm / (displayIntervalLongTerm / 1000));
        if (averageFpsSinceLastDisplayLongTerm) console.log('FPS average over ' + displayIntervalLongTerm / 1000 + ' seconds: ' + averageFpsSinceLastDisplayLongTerm);
        fpsDisplay.framesSinceLastDisplayLongTerm = 0;
        fpsDisplay.noFpsDisplayLongTermUntil = Date.now() + displayIntervalLongTerm;
    }
}
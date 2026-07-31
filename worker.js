// This file runs in a dedicated thread to survive background tab sleeping
setInterval(() => {
    // Post a message back to the main website window to trigger the network pulse
    self.postMessage('pulse');
}, 100*2); // Strict 10-second background maintenance loop

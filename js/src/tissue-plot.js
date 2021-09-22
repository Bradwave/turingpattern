/**
 * Plots a tissue of cells.
 * @param {Number} idNumber Id of the ring plot.
 * @param {*} inputTissue Tissue of cells.
 * @param {*} inputOptions Options
 */
let tissuePlot = function (idNumber, inputTissue, inputOptions = []) {

    /*_______________________________________
    |   General variables
    */

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /**
     * Tissue of cells.
     */
    let tissue;

    /**
     * True if the animation is playing, false if paused.
     */
    let isPlaying = false;

    /**
     * Updates the plot.
     * @param {cellsRing} inputTissue Tissue of cells.
     * @param {*} options
     */
    publicAPIs.updatePlot = (inputTissue, options = []) => {
        numOfRings = toDefaultIfUndefined(options.numOfRings, 3);
        vScale = toDefaultIfUndefined(options.verticalScale, 10);
        verticalOffsetScale = toDefaultIfUndefined(options.startingPosition, .5);
        squared = toDefaultIfUndefined(options.squared, false);

        tissue = inputTissue;
    }

    // Creates the plot
    publicAPIs.updatePlot(inputTissue, inputOptions);

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the plot.
     */
    let width;

    /**
     * Height of the plot.
     */
    let height;

    /*_______________________________________
    |   HTML elements
    */

    /**
     * Play/pause button.
     */
    let playPause = document.getElementById("play-pause-" + idNumber);

    /**
     * Next step button.
     */
    let skip = document.getElementById("skip-" + idNumber);

    /**
     * Refresh button.
     */
    let refresh = document.getElementById("refresh-" + idNumber);

    playPause.onclick = () => {
        // Turns play button into pause and viceversa
        playPause.innerHTML = isPlaying ? "play_arrow" : "pause";
        // Toggles the animation on and off
        toggleAnimation();
    }

    skip.onclick = () => {
        // Updates the ring status
        tissue.nextStep();
        // Draws the ring
        publicAPIs.drawCells();
    }

    if (refresh !== null) {
        refresh.onclick = () => {
            tissue.resetCells();
            publicAPIs.drawCells();
        }
    }

    /*_______________________________________
    |   Canvas
    */

    const canvas = document.getElementById("canvas-" + idNumber);
    const ctx = canvas.getContext('2d');

    /**
     * Device dpi.
     */
    let dpi;

    /**
     * Resize the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        // Get the device dpi
        dpi = window.devicePixelRatio;

        // Sets the canvas width and height based on the dpi resolution of the page
        const styleWidth = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        const styleHeight = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        const minDim = Math.min(styleWidth, styleHeight);
        canvas.setAttribute('height', Math.round(minDim * dpi));
        canvas.setAttribute('width', Math.round(minDim * dpi));

        // Saves the width and height of the resized canvas, multiplied by dpi?
        width = Math.round(canvas.offsetWidth * dpi);
        height = Math.round(canvas.offsetHeight * dpi);

        // Disable interpolation
        ctx.imageSmoothingEnabled = false;
    }

    /*_______________________________________
    |   Animation
    */

    /**
     * Toggles the animation on and off.
     */
    function toggleAnimation() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            // Starts the animation
            requestAnimationFrame(animate);
        }
    }

    /**
     * A (probably poor) implementation of the pause-able loop.
     * @returns Early return if not playing.
     */
    function animate() {
        if (!isPlaying) {
            return;
        }
        // Updates the ring status
        tissue.nextStep();
        // Draws the ring
        publicAPIs.drawCells();
        // Keeps executing this function
        requestAnimationFrame(animate);
    }

    document.addEventListener('keydown', (e) => {
        if (document.activeElement === canvas) {
            switch (e.code) {
                case "KeyN":
                    tissue.nextStep();
                    publicAPIs.drawCells();
                    break;
                case "KeyP":
                    // Turns play button into pause and viceversa
                    playPause.innerHTML = isPlaying ? "play_arrow" : "pause";
                    toggleAnimation();
            }
        }
    });

    /**
     * Draws the cells of the ring.
     */
    publicAPIs.drawCells = () => {
        let grid = tissue.getCells();
        const gridSize = grid.length;

        const cellSize = width / gridSize;

        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = grid[i][j].x;
                const y = grid[i][j].y;
                const alpha = 1 - (x - y);

                const xPos = Math.round(i * cellSize);
                const yPos = Math.round(j * cellSize)

                ctx.fillStyle = "rgba(0, 0, 0, " + alpha + ")";
                ctx.fillRect(
                    xPos, yPos,
                    Math.round((i + 1) * cellSize) - xPos,
                    Math.round((j + 1) * cellSize) - yPos
                );
            }
        }

    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawCells();

    // Returns public methods
    return publicAPIs;
}
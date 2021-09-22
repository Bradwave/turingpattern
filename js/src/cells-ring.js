/**
 * Ring of cells.
 */
class cellsRing {

    #cells;
    #newCells;

    /**
     * Constructor for the cell fo ring.
     */
    constructor(options) {
        this.numberOfCells = toDefaultIfUndefined(options.numberOfCells, 200);

        this.deltaTime = toDefaultIfUndefined(options.deltaTime, .05);
        this.maxTime = toDefaultIfUndefined(options.maxTime, Infinity);
        this.reps = toDefaultIfUndefined(options.reps, 1);
        this.t = 0;

        this.eqX = toDefaultIfUndefined(options.eqX, .5);
        this.eqY = toDefaultIfUndefined(options.eqY, .5);
        this.noiseFactor = toDefaultIfUndefined(options.noiseFactor, .05);
        this.noiseFactor2 = toDefaultIfUndefined(options.noiseFactor2, 0);

        this.mu = options.mu;
        this.nu = options.nu;
        this.a = options.a;
        this.b = options.b;
        this.c = options.c;
        this.d = options.d;

        this.resetCells();
    }

    /**
     * Sets cells to a disturbed initial status.
     */
    resetCells() {
        this.#cells = [...Array(this.numberOfCells)].map(() => {
            return {
                x: this.eqX + Math.random() * this.noiseFactor - this.noiseFactor / 2,
                y: this.eqY + Math.random() * this.noiseFactor - this.noiseFactor / 2
            }
        });

        this.t = 0;
    }

    /**
     * Moves system forward in time.
     */
    nextStep() {
        this.#newCells = [];
        for (let j = 0; j < this.reps; j++) {
            // Executes if time is in range
            if (this.t++ < this.maxTime) {
                for (let i = 0; i < this.numberOfCells; i++) {

                    // New indexes are calculated
                    const prevI = (this.numberOfCells + i - 1) % this.numberOfCells;
                    const nextI = (i + 1) % this.numberOfCells;

                    // xInc[r] = a * x[r] + b * y[r] + mu * (x[r - 1] + 2 * x[r] + x[r - 1])
                    const xInc = this.a * this.#cells[i].x + this.b * this.#cells[i].y
                        + this.mu * (this.#cells[prevI].x - 2 * this.#cells[i].x + this.#cells[nextI].x);

                    // yInc[r] = c * x[r] + d * y[r] + mu * (y[r - 1] + 2 * y[r] + y[r - 1])
                    const yInc = this.c * this.#cells[i].x + this.d * this.#cells[i].y
                        + this.nu * (this.#cells[prevI].y - 2 * this.#cells[i].y + this.#cells[nextI].y);

                    this.#newCells[i] = {
                        // x[r] += deltaTime * (xInc[r] + noise)
                        x: this.#cells[i].x
                            + this.deltaTime * (xInc + this.noiseFactor2 * (Math.random() - .5)),
                        // y[r] += deltaTime * (yInc[r] + noise)
                        y: this.#cells[i].y
                            + this.deltaTime * (yInc + this.noiseFactor2 * (Math.random() - .5))

                    }
                }
                // Cells are updated
                this.#cells = this.#newCells;
            } else {
                // Resets time and cells
                this.t = 0;
                this.resetCells();
            }
        }
    }

    /**
     * Returns the cells of the ring in the current status.
     * @returns {} Cells of the ring.
     */
    getCells() {
        return this.#cells;
    }
}

/**
 * Sets a variable to a default value if undefined.
 * @param {*} variable Variable to check.
 * @param {*} defaultValue Default value.
 * @returns Returns the default value if the variable is undefined, hte variable itself if not.
 */
const toDefaultIfUndefined = (variable, defaultValue) => {
    return (typeof variable === 'undefined' ? defaultValue : variable);
}

/**
 * Plots a ring of cells.
 * @param {Number} idNumber Id of the ring plot.
 * @param {cellsRing} inputRing Ring of cells.
 * @param {*} inputOptions Options
 */
let ringPlot = function (idNumber, inputRing, inputOptions = []) {

    /*_______________________________________
    |   General variables
    */

    // Public methods
    let publicAPIs = {};

    /**
     * 
     */
    let ring;

    /**
     * Number of rings plotted.
     */
    let numOfRings;

    /**
     * Vertical scale of the plot.
     */
    let vScale;

    /**
     * Vertical position of the starting equilibrium status.
     */
    let verticalOffsetScale;

    /**
     * Vertical position of the starting equilibrium status.
     */
    let squared;

    /**
     * True if the animation is playing, false if paused.
     */
    let isPlaying = false;

    /**
     * Updates the plot.
     * @param {cellsRing} inputRing Ring of cells.
     * @param {*} options
     */
    publicAPIs.updatePlot = (inputRing, options = []) => {
        numOfRings = toDefaultIfUndefined(options.numOfRings, 3);
        vScale = toDefaultIfUndefined(options.verticalScale, 10);
        verticalOffsetScale = toDefaultIfUndefined(options.startingPosition, .5);
        squared = toDefaultIfUndefined(options.squared, false);

        ring = inputRing;
    }

    // Creates the plot
    publicAPIs.updatePlot(inputRing, inputOptions);

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
        ring.nextStep();
        // Draws the ring
        publicAPIs.drawCells();
    }

    if (refresh !== null) {
        refresh.onclick = () => {
            ring.resetCells();
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
        canvas.setAttribute('height', Math.round(styleHeight * dpi));
        canvas.setAttribute('width', Math.round(styleWidth * dpi));

        // Saves the width and height of the resized canvas, multiplied by dpi?
        width = canvas.offsetWidth * dpi;
        height = canvas.offsetHeight * dpi;
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
        ring.nextStep();
        // Draws the ring
        publicAPIs.drawCells();
        // Keeps executing this function
        requestAnimationFrame(animate);
    }

    document.addEventListener('keydown', (e) => {
        if (document.activeElement === canvas) {
            switch (e.code) {
                case "KeyN":
                    ring.nextStep();
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
        // Gets the cells of the ring
        let cells = ring.getCells();

        // Computes the width of the cells
        let cellWidth = width / cells.length / numOfRings;
        // Computes the width of the ring
        let ringWidth = width / numOfRings;
        // Computes the index of the plotted rings
        let ringIndex = Math.floor(numOfRings / 2);
        // Computes the vertical offset
        let vOffset = - height * verticalOffsetScale;
        // Number of cells
        const numberOfCells = cells.length;

        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        // Draws a rounded rectangle representing the ring space
        ctx.fillStyle = "#00000010";
        ctx.strokeStyle = "#00000000"
        roundedRect(ringWidth * ringIndex, 0, ringWidth * ringIndex, height, 15);

        // Sets the line width
        ctx.lineWidth = 2;

        for (let i = 0; i < numberOfCells; i++) {
            for (let j = 0; j < numOfRings; j++) {

                // Draws the X morphogen in red 
                ctx.strokeStyle = "#B01A00" + (j != 1 ? "40" : "bb");

                ctx.beginPath();
                ctx.moveTo(
                    cellWidth * i + ringWidth * j,
                    vOffset + height - cells[i].x * vScale * dpi);
                if (squared) {
                    ctx.lineWidth = 3;
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[i].x * vScale * dpi);
                } else {
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[(i + 1) % numberOfCells].x * vScale * dpi);
                }
                ctx.stroke();

                // Draws the Y morphogen in black
                ctx.strokeStyle = "#000000" + (j != 1 ? "40" : "bb");

                ctx.beginPath();
                ctx.moveTo(
                    cellWidth * i + ringWidth * j,
                    vOffset + height - cells[i].y * vScale * dpi);
                if (squared) {
                    ctx.lineWidth = 3;
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[i].y * vScale * dpi);
                } else {
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[(i + 1) % numberOfCells].y * vScale * dpi);
                }
                ctx.stroke();

                // Draws vertical lines if the line is squared
                if (squared) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "#B01A00" + (j != 1 ? "15" : "40");
                    ctx.beginPath();
                    ctx.moveTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[i].x * vScale * dpi);
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[(i + 1) % numberOfCells].x * vScale * dpi);
                    ctx.stroke();

                    ctx.strokeStyle = "#000000" + (j != 1 ? "15" : "40");
                    ctx.beginPath();
                    ctx.moveTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[i].y * vScale * dpi);
                    ctx.lineTo(
                        cellWidth * (i + 1) + ringWidth * j,
                        vOffset + height - cells[(i + 1) % numberOfCells].y * vScale * dpi);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * Draws a rounded rectangle.
     * @param {Number} x Coordinate x of the anchor point.
     * @param {Number} y Coordinate y of the anchor point.
     * @param {Number} width Width of the rectangle.
     * @param {Number} height Height of the rectangle.
     * @param {Number} radius Radius of the rounded corner.
     */
    function roundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.lineTo(x + width - radius, y + height);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.lineTo(x + width, y + radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.lineTo(x + radius, y);
        ctx.arcTo(x, y, x, y + radius, radius);
        ctx.fill();
    }

    publicAPIs.resizeCanvas();
    publicAPIs.drawCells();

    // Returns public methods
    return publicAPIs;
}
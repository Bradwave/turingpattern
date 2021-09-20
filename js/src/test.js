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
        this.t = 0;

        this.eq = toDefaultIfUndefined(options.eq, .5);
        this.noiseFactor = toDefaultIfUndefined(options.noiseFactor, .05);

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
                x: this.eq + Math.random() * this.noiseFactor - this.noiseFactor / 2,
                y: this.eq + Math.random() * this.noiseFactor - this.noiseFactor / 2
            }
        });
    }

    /**
     * Moves system forward in time.
     */
    nextStep() {
        this.#newCells = [];

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
                    // x[r] += deltaTime * xInc[r]
                    x: this.#cells[i].x + this.deltaTime * xInc,
                    // y[r] += deltaTime * yInc[r]
                    y: this.#cells[i].y + this.deltaTime * yInc

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
 * @param {cellsRing} ring Ring of cells.
 * @param {*} options
 */
let ringPlot = function (idNumber, ring, options = []) {

    /*_______________________________________
    |   General variables
    */

    // Public methods
    let publicAPIs = {};

    /**
     * Number of rings plotted.
     */
    const numOfRings = toDefaultIfUndefined(options.numOfRings, 3);

    /**
     * Vertical scale of the plot.
     */
    const vScale = toDefaultIfUndefined(options.verticalScale, 10);

    /**
     * Vertical position of the starting equilibrium status.
     */
    const verticalOffsetScale = toDefaultIfUndefined(options.startingPosition, .5);

    /**
     * True if the animation is playing, false if paused.
     */
    let isPlaying = false;

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

    /*_______________________________________
    |   Canvas
    */

    const canvas = document.getElementById("canvas-" + idNumber);
    const ctx = canvas.getContext('2d');
    const dpi = window.devicePixelRatio;

    /**
     * Resize the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        // Saves the width and height of the resized canvas
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;

        // Sets the canvas width and height based on the dpi resolution of the page
        const styleWidth = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        const styleHeight = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        canvas.setAttribute('height', styleHeight * dpi);
        canvas.setAttribute('width', styleWidth * dpi);
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

        // Clears the canvas
        ctx.clearRect(0, 0, width, height);

        // Draws a rounded rectangle representing the ring space
        ctx.fillStyle = "#00000010";
        ctx.strokeStyle = "#00000000"
        roundedRect(ringWidth * ringIndex, 0, ringWidth * ringIndex, height, 15);

        // Sets the line width
        ctx.lineWidth = 2;

        for (let i = 0; i < cells.length; i++) {
            for (let j = 0; j < numOfRings; j++) {

                // Draws the X morphogen in red 
                ctx.strokeStyle = "#B01A00" + (j != 1 ? "60" : "ee");

                ctx.beginPath();
                ctx.moveTo(
                    cellWidth * i + ringWidth * j,
                    vOffset + height - cells[i].x * vScale);
                ctx.lineTo(
                    cellWidth * (i + 1) + ringWidth * j,
                    vOffset + height - cells[(i + 1) % cells.length].x * vScale);
                ctx.stroke();

                // Draws the Y morphogen in black
                ctx.strokeStyle = "#000000" + (j != 1 ? "60" : "ee");

                ctx.beginPath();
                ctx.moveTo(
                    cellWidth * i + ringWidth * j,
                    vOffset + height - cells[i].y * vScale);
                ctx.lineTo(
                    cellWidth * (i + 1) + ringWidth * j,
                    vOffset + height - cells[(i + 1) % cells.length].y * vScale);
                ctx.stroke();
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

/**
 * Manages plots, sort of...
 */
let plotsManager = new function () {

    /**
     * Number of milliseconds to wait after resizing.
     * @type {Number}
     */
    const waitTime = 200;

    let resizeTimeout;

    /**
     * Spinning loaders
     */
    let loaders = document.getElementsByClassName("plot loader");

    /**
     * Case A.
     */
    const ring1 = new cellsRing({
        numberOfCells: 200, maxTime: 42, noiseFactor: .02,
        mu: .25, nu: .25, a: 1, b: 1, c: 1, d: 1
    });

    /**
     * Case B.
     */
    const ring2 = new cellsRing({
        numberOfCells: 200, maxTime: 120,
        mu: .25, nu: .25, a: 1, b: 1, c: -1, d: 1
    });

    /**
     * Ring plots.
     */
    let plots = [
        new ringPlot(1, ring1, { startingPosition: .25 }),
        new ringPlot(2, ring2, { startingPosition: .25 })
    ];


    window.onresize = () => {
        plots.forEach((plot) => {
            // Resize the canvas
            plot.resizeCanvas();
        });

        loaders.forEach((loader) => {
            // Displays the loader while waiting
            loader.style.visibility = "visible";
            loader.style.animationPlayState = "running";
        });

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            plots.forEach((plot) => {
                // Draws the ring after waiting (for better performances)
                plot.drawCells();
            });

            loaders.forEach((loader) => {
                // Displays the loader while waiting
                loader.style.visibility = "hidden";
                loader.style.animationPlayState = "paused";
            });
        }, waitTime);
    }

    window.onclick = (e) => {
        e.target.focus();
    }
}
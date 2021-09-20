/**
 * Ring of cells.
 */
class cellsRing {

    #cells;
    #newCells;

    /**
     * Constructor for the cell fo ring.
     * @param {Number} numberOfCells Number of cells in the ring.
     * @param {Number} eq Equilibrium status.
     * @param {Number} mu Diffusion coefficient for x.
     * @param {Number} nu Diffusion coefficient for y.
     * @param {Number} a Marginal reaction rate a.
     * @param {Number} b Marginal reaction rate b.
     * @param {Number} c Marginal reaction rate c.
     * @param {Number} d Marginal reaction rate d.
     */
    constructor(numberOfCells, eq, mu, nu, a, b, c, d) {
        this.numberOfCells = numberOfCells;
        this.eq = eq;
        this.mu = mu;
        this.nu = nu;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;

        this.resetCells();
    }

    /**
     * Sets cells to a disturbed initial status.
     */
    resetCells() {
        this.#cells = [...Array(this.numberOfCells)].map(() => {
            return {
                x: this.eq + Math.random() * .05 - .025,
                y: this.eq + Math.random() * .05 - .025
            }
        });
    }

    /**
     * Moves system forward in time.
     */
    nextStep() {
        this.#newCells = [];
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
                x: this.#cells[i].x + .05 * xInc,
                // y[r] += deltaTime * yInc[r]
                y: this.#cells[i].y + .05 * yInc

            }
        };

        // Cells are updated
        this.#cells = this.#newCells;
    }

    /**
     * Returns the cells of the ring in the current status.
     * @returns {{x: Number, y: Number}} Cells of the ring.
     */
    getCells() {
        return this.#cells;
    }
}

let cellsRingPlot = new p5((sketch) => {

    /*_______________________________________
    |   HTML elements
    */

    let parentDiv;
    let pageDiv;

    /*_______________________________________
    |   Resizing variables
    */

    let resizeTimeout;

    /** Number of milliseconds to wait after resizing.
     * @type {number} */
    const waitTime = 200;

    const loopN = 1;
    const reps = 3;
    const vScale = 10;

    let c1;

    sketch.setup = function () {
        const I = 0.25;
        c1 = new cellsRing(100, 0, 1, .5, I - 2, 2.5, -1.25, I + 1.5);

        initHTMLComponents();

        let canvas = sketch.createCanvas(parentDiv.offsetWidth, parentDiv.offsetWidth * 0.75);

        sketch.noLoop();
        drawCells();
    }

    function initHTMLComponents() {
        parentDiv = document.getElementById("canvas-1");
        pageDiv = document.getElementById("page-content");
    }

    sketch.windowResized = function () {
        parentDiv.style = "width: " + pageDiv.style.offsetWidth;
        sketch.resizeCanvas(parentDiv.offsetWidth, parentDiv.offsetWidth * 0.75);

        sketch.clear();

        // Waits before drawing
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {    

            // Hides loader after waiting

            // Draws cells
            drawCells();

        }, waitTime);
    }

    function drawCells() {
        let cells = c1.getCells();

        let cellWidth = sketch.width / cells.length / reps;
        let ringWidth = sketch.width / reps;
        let repsOffSet = Math.floor(reps / 2);
        let vOffset = - sketch.height / 4;

        sketch.clear();

        sketch.stroke(100);
        sketch.line(ringWidth * repsOffSet, 0, ringWidth * repsOffSet, sketch.height);
        sketch.line(ringWidth * (repsOffSet + 1), 0, ringWidth * (repsOffSet + 1), sketch.height);

        for (let i = 0; i < cells.length - 1; i++) {
            for (let j = 0; j < reps; j++) {
                sketch.stroke('#B01A00');
                sketch.line(
                    cellWidth * i + ringWidth * j, vOffset + sketch.height - cells[i].x * vScale,
                    cellWidth * (i + 1) + ringWidth * j, vOffset + sketch.height - cells[i + 1].x * vScale
                );

                sketch.stroke(0);
                sketch.line(
                    cellWidth * i + ringWidth * j, vOffset + sketch.height - cells[i].y * vScale,
                    cellWidth * (i + 1) + ringWidth * j, vOffset + sketch.height - cells[i + 1].y * vScale
                );
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code == "KeyN") {
            for (let i = 0; i < loopN; i++) { c1.nextStep(); }
            drawCells();
        }
    })

}, "canvas-1");
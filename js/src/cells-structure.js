/**
 * Structure of cells.
 */
class cellsStructure {

    /**
     * 
     * @param {Number} numberOfCells Number of cells.
     * @param {Number} deltaTime dt.
     * @param {Number} maxTime Max number of iterations.
     * @param {Number} reps Iterations per time tick.
     * @param {Number} noiseFactor Noise factor.
     * @param {Number} noiseFactor2 Continuos noise factor.
     */
    constructor(numberOfCells, deltaTime, maxTime, reps, noiseFactor, noiseFactor2) {
        this.cells = [];
        this.newCells = [];

        this.numberOfCells = numberOfCells;

        this.deltaTime = deltaTime;
        this.maxTime = maxTime;
        this.reps = reps;

        this.noiseFactor = noiseFactor;
        this.noiseFactor2 = noiseFactor2;
    }

    /**
     * Reset cells.
     */
    resetCells() { }

    /**
     * Moves system forward in time.
     */
    nextStep() { }

    /**
     * Returns the cells of the ring in the current status.
     * @returns {*} Cells of the ring.
     */
    getCells() {
        return this.cells;
    }
}

/**
 * Ring of cells.
 */
class cellsRing extends cellsStructure {

    /**
     * Constructor for the cell fo ring.
     */
    constructor(options) {
        super(
            toDefaultIfUndefined(options.numberOfCells, 200),
            toDefaultIfUndefined(options.deltaTime, .05),
            toDefaultIfUndefined(options.maxTime, Infinity),
            toDefaultIfUndefined(options.reps, 1),
            toDefaultIfUndefined(options.noiseFactor, .05),
            toDefaultIfUndefined(options.noiseFactor2, 0)
        );

        this.t = 0;

        this.eqX = toDefaultIfUndefined(options.eqX, .5);
        this.eqY = toDefaultIfUndefined(options.eqY, .5);

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
        this.cells = [...Array(this.numberOfCells)].map(() => {
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
        this.newCells = [];
        for (let j = 0; j < this.reps; j++) {
            // Executes if time is in range
            if (this.t++ < this.maxTime) {
                for (let i = 0; i < this.numberOfCells; i++) {

                    // New indexes are calculated
                    const prevI = (this.numberOfCells + i - 1) % this.numberOfCells;
                    const nextI = (i + 1) % this.numberOfCells;

                    // xInc[r] = a * x[r] + b * y[r] + mu * (x[r - 1] + 2 * x[r] + x[r - 1])
                    const xInc = this.a * this.cells[i].x + this.b * this.cells[i].y
                        + this.mu * (this.cells[prevI].x - 2 * this.cells[i].x + this.cells[nextI].x);

                    // yInc[r] = c * x[r] + d * y[r] + mu * (y[r - 1] + 2 * y[r] + y[r - 1])
                    const yInc = this.c * this.cells[i].x + this.d * this.cells[i].y
                        + this.nu * (this.cells[prevI].y - 2 * this.cells[i].y + this.cells[nextI].y);

                    this.newCells[i] = {
                        // x[r] += deltaTime * (xInc[r] + noise)
                        x: this.cells[i].x
                            + this.deltaTime * (xInc + this.noiseFactor2 * (Math.random() - .5)),
                        // y[r] += deltaTime * (yInc[r] + noise)
                        y: this.cells[i].y
                            + this.deltaTime * (yInc + this.noiseFactor2 * (Math.random() - .5))

                    }
                }
                // Cells are updated
                this.cells = this.newCells;
            } else {
                // Resets time and cells
                this.t = 0;
                this.resetCells();
            }
        }
    }
}

/**
 * Tissue of cells.
 */
class cellsTissue extends cellsStructure {

    /**
     * Constructor for the tissue of cells.
     */
    constructor(options) {
        super(
            toDefaultIfUndefined(options.numberOfCells, 200),
            toDefaultIfUndefined(options.deltaTime, 1),
            toDefaultIfUndefined(options.maxTime, Infinity),
            toDefaultIfUndefined(options.reps, 1),
            toDefaultIfUndefined(options.noiseFactor, .1),
            toDefaultIfUndefined(options.noiseFactor2, 0)
        );

        this.margin = toDefaultIfUndefined(options.torusWrap, true) == true ? 0 : 1;

        this.eqX = constrain(toDefaultIfUndefined(options.eqX, 1), this.noiseFactor, 1);
        this.eqY = constrain(toDefaultIfUndefined(options.eqY, 0), 0, 1 - this.noiseFactor);

        this.mu = options.mu;
        this.nu = options.nu;
        this.feed = options.feed;
        this.kill = options.kill;

        this.resetCells();
    }

    /**
     * Sets cells to a disturbed initial status.
     */
    resetCells() {
        for (let i = 0; i < this.numberOfCells; i++) {
            this.cells[i] = [];
            this.newCells[i] = [];
            for (let j = 0; j < this.numberOfCells; j++) {
                this.cells[i][j] = {
                    x: this.eqX - Math.random() * this.noiseFactor,
                    y: this.eqY + Math.random() * this.noiseFactor
                };
            }
        }

        // Creates a patch of different cells
        for (let i = Math.round(this.numberOfCells * 0.45);
            i < Math.round(this.numberOfCells * .55); i++) {
            for (let j = Math.round(this.numberOfCells * 0.45);
                j < Math.round(this.numberOfCells * 0.55); j++) {

                this.cells[i][j].y = this.eqX - Math.random() * this.noiseFactor;
            }
        }

        this.t = 0;
    }

    /**
     * Moves system forward in time.
     */
    nextStep() {
        for (let rep = 0; rep < this.reps; rep++) {
            // Executes if time is in range
            if (this.t++ < this.maxTime) {
                for (let i = this.margin; i < this.numberOfCells - this.margin; i++) {
                    for (let j = this.margin; j < this.numberOfCells - this.margin; j++) {
                        const x = this.cells[i][j].x;
                        const y = this.cells[i][j].y;
                        const laplacian = this.calcLaplacian(i, j);

                        const xInc = this.mu * laplacian.x - x * y * y + this.feed * (1 - x);
                        const yInc = this.nu * laplacian.y + x * y * y - (this.kill + this.feed) * y;

                        this.newCells[i][j] = {
                            x: constrain(
                                x + (xInc + this.noiseFactor2 * (Math.random() - .5)) * this.deltaTime,
                                0, 1),
                            y: constrain(
                                y + (yInc + this.noiseFactor2 * (Math.random() - .5)) * this.deltaTime,
                                0, 1)
                        };
                    }
                }

                // Cells are updated
                [this.cells, this.newCells] = [this.newCells, this.cells];
            } else {
                // Resets time and cells
                this.t = 0;
                this.resetCells();
            }
        }
    }

    calcLaplacian(i, j) {
        const nextI = (i + 1) % this.cells.length;
        const nextJ = (j + 1) % this.cells[0].length;
        const prevI = (this.cells.length + i - 1) % this.cells.length;
        const prevJ = (this.cells[0].length + j - 1) % this.cells[0].length;

        const x = - this.cells[i][j].x
            + .2 * (this.cells[nextI][j].x + this.cells[prevI][j].x
                + this.cells[i][nextJ].x + this.cells[i][prevJ].x)
            + .05 * (this.cells[nextI][nextJ].x + this.cells[nextI][prevJ].x
                + this.cells[prevI][nextJ].x + this.cells[prevI][prevJ].x);
        const y = - this.cells[i][j].y
            + .2 * (this.cells[nextI][j].y + this.cells[prevI][j].y
                + this.cells[i][nextJ].y + this.cells[i][prevJ].y)
            + .05 * (this.cells[nextI][nextJ].y + this.cells[nextI][prevJ].y
                + this.cells[prevI][nextJ].y + this.cells[prevI][prevJ].y);

        return { x: x, y: y };
    }
}
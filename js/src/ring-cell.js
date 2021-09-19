class cellsRing {

    #cells;
    #newCells;

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

    resetCells() {
        this.#cells = [...Array(this.numberOfCells)].map(() => {
            return {
                x: this.eq + Math.random() * .005 - .0025,
                y: this.eq + Math.random() * .005 - .0025
            }
        });
        this.#newCells = this.#cells;
    }

    nextStep() {
        this.#newCells = [];
        for (let i = 0; i < this.numberOfCells; i++) {

            let prevI = (this.numberOfCells + i - 1) % this.numberOfCells;
            let nextI = (i + 1) % this.numberOfCells;

            let xInc = this.a * this.#cells[i].x + this.b * this.#cells[i].y
                + this.mu * (this.#cells[prevI].x - 2 * this.#cells[i].x + this.#cells[nextI].x);

            let yInc = this.c * this.#cells[i].x + this.d * this.#cells[i].y
                + this.nu * (this.#cells[prevI].y - 2 * this.#cells[i].y + this.#cells[nextI].y)

            this.#newCells[i] = {
                // x[r] += a * x[r] + b * y[r] + mu * (x[r - 1] + 2 * x[r] + x[r - 1])
                x: this.#cells[i].x + xInc, // > 0 ? this.#cells[i].x + xInc : 0,
                // y[r] += c * x[r] + d * y[r] + mu * (y[r - 1] + 2 * y[r] + y[r - 1])
                y: this.#cells[i].y + yInc  // > 0 ? this.#cells[i].y + yInc : 0
            }
        };
        this.#cells = this.#newCells;
    }

    getMorphogenX() {
        this.#cells.forEach((cell, i) => {
            console.log(i + ": " + cell.x);
        });
    }

    getCells() {
        return this.#cells;
    }
}

const loopN = 1;
const reps = 3;
const vScale = 1;

let cellsRingPlot = new p5((sketch) => {

    let c1;

    sketch.setup = function () {
        c1 = new cellsRing(20, 1, 1, .5, -6, 2.5, -1.25, -2.5);

        let parentDiv = document.getElementById("canvas-1");
        sketch.createCanvas(parentDiv.offsetWidth, parentDiv.offsetWidth * 0.75);

        sketch.noLoop();
        drawCells();
    }

    function drawCells() {
        let cells = c1.getCells();

        let cellWidth = sketch.width / cells.length / reps;
        let ringWidth = sketch.width / reps;
        let repsOffSet = Math.floor(reps / 2);
        let vOffset = - sketch.height / 3;

        sketch.stroke(255);
        sketch.rect(0, 0, sketch.width, sketch.height);

        sketch.stroke(100);
        sketch.line(ringWidth * repsOffSet, 0, ringWidth * repsOffSet, sketch.height);
        sketch.line(ringWidth * (repsOffSet + 1), 0, ringWidth * (repsOffSet + 1), sketch.height);

        cells.forEach((cell, i) => {
            for (let j = 0; j < reps; j++) {
                sketch.stroke('#B01A00');
                sketch.line(
                    cellWidth * i + ringWidth * j, vOffset + sketch.height - cell.x * vScale,
                    cellWidth * (i + 1) + ringWidth * j, vOffset + sketch.height - cell.x * vScale
                );

                sketch.stroke(0);
                sketch.line(
                    cellWidth * i + ringWidth * j, vOffset + sketch.height - cell.y * vScale,
                    cellWidth * (i + 1) + ringWidth * j, vOffset + sketch.height - cell.y * vScale
                );
            }
        })

    }

    sketch.keyPressed = function () {
        if (sketch.keyCode === sketch.RIGHT_ARROW) {
            for (let i = 0; i < loopN; i++) { c1.nextStep(); }
            drawCells();
        }
    }

}, "canvas-1");
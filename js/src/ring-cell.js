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
                x: .5 - Math.random() * .05,
                y: .5 - Math.random() * .05
            }
        });
        // for (let i = Math.round(this.#cells.length * 0.45); i < Math.round(this.#cells.length * 0.55); i++) {
        //     this.#cells[i].y = 1 - Math.random() * .05;
        // }
        // this.#newCells = this.#cells;
    }

    nextStep() {
        this.#newCells = [];
        for (let i = 0; i < this.numberOfCells; i++) {

            const prevI = (this.numberOfCells + i - 1) % this.numberOfCells;
            const nextI = (i + 1) % this.numberOfCells;

            // x[r] += a * x[r] + b * y[r] + mu * (x[r - 1] + 2 * x[r] + x[r - 1])
            const xInc = this.a * this.#cells[i].x + this.b * this.#cells[i].y
                + this.mu * (this.#cells[prevI].x - 2 * this.#cells[i].x + this.#cells[nextI].x);
            // y[r] += c * x[r] + d * y[r] + mu * (y[r - 1] + 2 * y[r] + y[r - 1])
            const yInc = this.c * this.#cells[i].x + this.d * this.#cells[i].y
                + this.nu * (this.#cells[prevI].y - 2 * this.#cells[i].y + this.#cells[nextI].y)

            const newX = this.#cells[i].x + .05 * xInc;
            const newY = this.#cells[i].y + .05 * yInc;

            this.#newCells[i] = {
                x: newX, // < 0 ? 0 : (newX > 1 ? 1 : newX),
                y: newY // < 0 ? 0 : (newY > 1 ? 1 : newY)
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
const vScale = 10;

let cellsRingPlot = new p5((sketch) => {

    let c1;

    sketch.setup = function () {
        const I = 0.25;
        c1 = new cellsRing(100, 0, 1, .5, I - 2, 2.5, -1.25, I + 1.5);

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
        let vOffset = - sketch.height / 4;

        sketch.stroke(255);
        sketch.rect(0, 0, sketch.width, sketch.height);

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
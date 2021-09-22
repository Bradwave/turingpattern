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

    const JC1 = .28, JC2 = .21, JC3 = .2, JC4 = .25;
    const JD1 = 0, JD2 = -.1, JD3 = .1;

    /**
     * Ring plots.
     */
    let plots = [
        // Stationary, extreme long wave length, unstable
        new ringPlot(1, new cellsRing({
            numberOfCells: 200, deltaTime: .005, maxTime: 408,
            noiseFactor: .02,
            eqX: .2, eqY: .8,
            mu: .25, nu: .25, a: 1, b: 1, c: 1, d: 1
        }), {
            startingPosition: .25
        }),
        // Stationary, extreme long wave length, stable
        new ringPlot(2, new cellsRing({
            numberOfCells: 200,
            noiseFactor: .14,
            eqX: -.1, eqY: .1,
            mu: .25, nu: .25, a: -1, b: 1, c: 1, d: -1
        }), {
            startingPosition: .5,
            verticalScale: 200
        }),
        // Stationary, extreme long wave length, stable, with noise
        new ringPlot(3, new cellsRing({
            numberOfCells: 200,
            noiseFactor: .14, noiseFactor2: .1,
            eqX: -.1, eqY: .1,
            mu: .25, nu: .25, a: -1, b: 1, c: 1, d: -1
        }), {
            startingPosition: .5,
            verticalScale: 200
        }),
        // Oscillatory, extreme long wave length, unstable
        new ringPlot(4, new cellsRing({
            numberOfCells: 200, maxTime: 120,
            eqX: -.3, eqY: .3,
            mu: .25, nu: .25, a: 1, b: 1, c: -1, d: 1
        }), {
            startingPosition: .5
        }),
        // Oscillatory, extreme long wave length, stable
        new ringPlot(5, new cellsRing({
            numberOfCells: 200,
            noiseFactor: .14,
            eqX: -.3, eqY: .3,
            mu: .25, nu: .25, a: -1, b: 1, c: -1, d: -1
        }), {
            startingPosition: .5,
            verticalScale: 100
        }),
        // Oscillatory, extreme long wave length, stable, with noise
        new ringPlot(6, new cellsRing({
            numberOfCells: 200,
            noiseFactor: .14, noiseFactor2: .3,
            eqX: -.3, eqY: .3,
            mu: .25, nu: .25, a: -1, b: 1, c: -1, d: -1
        }), {
            startingPosition: .5,
            verticalScale: 100
        }),
        // Stationary, extreme short wave length, lots of cells
        new ringPlot(7, new cellsRing({
            numberOfCells: 100, reps: 2, maxTime: 1000,
            noiseFactor: 0.025,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: JC1 - 1, b: 1, c: -1, d: JC1
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        // Stationary, extreme short wave length, lots of cells, stable
        new ringPlot(8, new cellsRing({
            numberOfCells: 100, reps: 5, maxTime: 6000,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: JC2 - 1, b: 1, c: -1, d: JC2
        }), {
            startingPosition: .5,
            verticalScale: 1500
        }),
        // Stationary, extreme short wave length, lots of cells, very stable
        new ringPlot(9, new cellsRing({
            numberOfCells: 100, reps: 5, maxTime: 6000,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: JC3 - 1, b: 1, c: -1, d: JC3
        }), {
            startingPosition: .5,
            verticalScale: 1500
        }),
        // Stationary, extreme short wave length, even number of cells
        new ringPlot(10, new cellsRing({
            numberOfCells: 10, reps: 10, maxTime: 3600,
            noiseFactor: .0025,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: JC4 - 1, b: 1, c: -1, d: JC4
        }), {
            squared: true,
            startingPosition: .5,
            verticalScale: 300
        }),
        // Stationary, extreme short wave length, odd number of cells
        new ringPlot(11, new cellsRing({
            numberOfCells: 11, reps: 10, maxTime: 3600,
            noiseFactor: .0025,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: JC4 - 1, b: 1, c: -1, d: JC4
        }), {
            squared: true,
            startingPosition: .5,
            verticalScale: 300
        }),
        // Stationary, finite short wave
        new ringPlot(13, new cellsRing({
            numberOfCells: 100, maxTime: 1000,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: .5, a: JD1 - 2, b: 2.5, c: -1.25, d: JD1 + 1.5
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        // Stationary, finite short wave, unstable
        new ringPlot(14, new cellsRing({
            numberOfCells: 100, maxTime: 800,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: .5, a: JD2 - 2, b: 2.5, c: -1.25, d: JD2 + 1.5
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        // Stationary, finite short wave, stable
        new ringPlot(15, new cellsRing({
            numberOfCells: 100, maxTime: 400,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: .5, a: JD3 - 2, b: 2.5, c: -1.25, d: JD3 + 1.5
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        // General plot
        new ringPlot(16, new cellsRing({
            numberOfCells: 100, maxTime: 400,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: -.1, b: 1, c: -1, d: .1
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
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

    let inputs = new Map();

    let ids = [
        'iters', 'v-scale', 'v-offset',
        'num-of-cells', 'dt', 'noise', 'noise-2',
        'eq-x', 'eq-y', 'squared',
        'mu', 'nu', 'a', 'b', 'c', 'd'
    ];

    ids.forEach((id) => {
        inputs.set(id, document.getElementById(id));
    })

    inputs.forEach((input) => {
        input.onchange = () => {
            changePlot();
        }
    });

    function changePlot() {
        // Checks for infinity
        let iters = inputs.get('iters').value;
        if (iters.localeCompare("inf") == 0) {
            iters = Infinity;
        } else {
            iters = getInputNumber('iters')
        }   

        let squared = inputs.get('squared').value;
        if (squared.localeCompare("true") == 0) {
            squared = true;
        } else {
            squared = false;
            inputs.get('squared').value = "false";
        }

        try {
            plots[14].updatePlot(new cellsRing({
                numberOfCells: getInputNumber('num-of-cells'),
                dt: getInputNumber('dt'), maxTime: iters,
                noiseFactor: getInputNumber('noise'), noiseFactor2: getInputNumber('noise-2'),
                eqX: getInputNumber('eq-x'), eqY: getInputNumber('eq-y'),
                mu: getInputNumber('mu'), nu: getInputNumber('nu'),
                a: getInputNumber('a'), b: getInputNumber('b'),
                c: getInputNumber('c'), d: getInputNumber('d')
            }), {
                squared: squared,
                startingPosition: getInputNumber('v-offset'),
                verticalScale: getInputNumber('v-scale')
            });
        } catch (e) {
            console.log(e);
        }

        plots[14].drawCells();
    }

    const getInputNumber = (id) => {
        let newValue = parseFloat(inputs.get(id).value);
        inputs.get(id).value = newValue;
        return newValue;
    }

}
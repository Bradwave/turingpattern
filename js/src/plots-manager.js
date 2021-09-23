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
    let loaders = [...document.getElementsByClassName("plot loader")];

    /*_______________________________________
    |   Ring plots
    */

    // Ring plots variables
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
        // General ring plot
        new ringPlot(16, new cellsRing({
            numberOfCells: 100, maxTime: 400,
            noiseFactor: 0.05,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: -.1, b: 1, c: -1, d: .1
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        // General tissue plot
        new tissuePlot(17, new cellsTissue({
            numberOfCells: 100, reps: 5,
            eqX: 1, eqY: 0,
            noiseFactor: 0.25, noiseFactor2: 0.05,
            mu: 1, nu: 0.5, feed: .055, kill: 0.062
        }), {

        }),
        // Three morphogens, short wave length
        new ringPlot(20, new cellsRing({
            numberOfCells: 100, maxTime: 1200,
            noiseFactor: 0.01, threeMorphogens: true,
            eqX: 0, eqY: 0, eqZ: 0,
            mu: 2 / 3, nu: 1 / 3, muZ: 0,
            a: -10 / 3, b: 3, a13: -1,
            c: -2, d: 7 / 3, a23: 0,
            a31: 3, a32: -4, a33: 0
        }), {
            startingPosition: .5,
            verticalScale: 800
        }),
        // Three morphogens, finite wave length
        new ringPlot(21, new cellsRing({
            numberOfCells: 20, maxTime: 800,
            noiseFactor: 0.5, threeMorphogens: true,
            eqX: 0, eqY: 0, eqZ: 0,
            mu: 1, nu: 0, muZ: 0,
            a: -1, b: -1, a13: 0,
            c: 1, d: 0, a23: -1,
            a31: 0, a32: 1, a33: 0
        }), {
            squared: true,
            startingPosition: .5,
            verticalScale: 200
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

    /*_______________________________________
    |   Inputs for ring plots
    */

    /**
     * Ids of input boxes for the ring plot.
     */
    let ringIds = [
        'iters', 'v-scale', 'v-offset',
        'num-of-cells', 'dt', 'noise', 'noise-2',
        'eq-x', 'eq-y', 'squared',
        'mu', 'nu', 'a', 'b', 'c', 'd'
    ];

    /**
     * Input boxes for ring plot.
     */
    let ringInputs = new Map();

    ringIds.forEach((id) => {
        ringInputs.set(id, document.getElementById(id));
    })

    // Sets listeners
    ringInputs.forEach((input) => {
        input.onchange = () => {
            changeRingPlot();
        }
    });

    /**
     * Update ring plot when input boxes change.
     */
    function changeRingPlot() {
        // Checks for infinity
        let iters = ringInputs.get('iters').value;
        if (iters.localeCompare("inf") == 0) {
            iters = Infinity;
        } else {
            iters = getInputNumber(ringInputs, 'iters')
        }

        let squared = ringInputs.get('squared').value;
        if (squared.localeCompare("true") == 0) {
            squared = true;
        } else {
            squared = false;
            ringInputs.get('squared').value = "false";
        }

        try {
            plots[14].updatePlot(new cellsRing({
                maxTime: iters,
                numberOfCells: getInputNumber(ringInputs, 'num-of-cells'),
                dt: getInputNumber(ringInputs, 'dt'),
                noiseFactor: getInputNumber(ringInputs, 'noise'),
                noiseFactor2: getInputNumber(ringInputs, 'noise-2'),
                eqX: getInputNumber(ringInputs, 'eq-x'),
                eqY: getInputNumber(ringInputs, 'eq-y'),
                mu: getInputNumber(ringInputs, 'mu'),
                nu: getInputNumber(ringInputs, 'nu'),
                a: getInputNumber(ringInputs, 'a'),
                b: getInputNumber(ringInputs, 'b'),
                c: getInputNumber(ringInputs, 'c'),
                d: getInputNumber(ringInputs, 'd')
            }), {
                squared: squared,
                startingPosition: getInputNumber(ringInputs, 'v-offset'),
                verticalScale: getInputNumber(ringInputs, 'v-scale')
            });
        } catch (e) {
            console.log(e);
        }

        plots[14].drawCells();
    }

    /*_______________________________________
    |   Tissue plot
    */

    let tissueInputs = new Map();

    let tissueIds = [
        'iters', 'num-of-cells', 'reps', 'dt',
        'eq-x', 'eq-y', 'noise', 'noise-2',
        'mu', 'nu', 'feed', 'kill'
    ];

    tissueIds.forEach((id) => {
        tissueInputs.set(id, document.getElementById("t-" + id));
    })

    // Sets listeners
    tissueInputs.forEach((input) => {
        input.onchange = () => {
            changeTissuePlot();
        }
    });

    /**
     * Update tissue plot when input boxes change.
     */
    function changeTissuePlot() {
        // Checks for infinity
        let iters = tissueInputs.get('iters').value;
        if (iters.localeCompare("inf") == 0) {
            iters = Infinity;
        } else {
            iters = getInputNumber(tissueInputs, 'iters')
        }

        try {
            plots[15].updatePlot(new cellsTissue({
                maxTime: iters,
                numberOfCells: getInputNumber(tissueInputs, 'num-of-cells'),
                reps: getInputNumber(tissueInputs, 'reps'),
                dt: getInputNumber(tissueInputs, 'dt'),
                eqX: getInputNumber(tissueInputs, 'eq-x'),
                eqY: getInputNumber(tissueInputs, 'eq-y'),
                noiseFactor: getInputNumber(tissueInputs, 'noise'),
                noiseFactor2: getInputNumber(tissueInputs, 'noise-2'),
                mu: getInputNumber(tissueInputs, 'mu'),
                nu: getInputNumber(tissueInputs, 'nu'),
                feed: getInputNumber(tissueInputs, 'feed'),
                kill: getInputNumber(tissueInputs, 'kill'),
            }), {

            });
        } catch (e) {
            console.log(e);
        }

        plots[15].drawCells();
    }

    /**
     * Converts the input value to float and sets the input box value.
     * @param {*} id Id of the input box. 
     * @returns Returns the float value of the input box.
     */
    const getInputNumber = (inputsMap, id) => {
        let newValue = parseFloat(inputsMap.get(id).value);
        inputsMap.get(id).value = newValue;
        return newValue;
    }

}
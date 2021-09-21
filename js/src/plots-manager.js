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

    const I1 = .26;
    const I2 = .21
    const I3 = 0;

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
        // Stationary, extreme short wave length, even number of cells
        new ringPlot(7, new cellsRing({
            numberOfCells: 10, reps: 10, maxTime: 3600,
            noiseFactor: .0025,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: I1 - 1, b: 1, c: -1, d: I1
        }), {
            squared: true,
            startingPosition: .5,
            verticalScale: 300
        }),
        // Stationary, extreme short wave length, odd number of cells
        new ringPlot(8, new cellsRing({
            numberOfCells: 11, reps: 10, maxTime: 3600,
            noiseFactor: .0025,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: I1 - 1, b: 1, c: -1, d: I1
        }), {
            squared: true,
            startingPosition: .5,
            verticalScale: 300
        }),
        // Stationary, extreme short wave length, a lot of cells
        new ringPlot(9, new cellsRing({
            numberOfCells: 100, reps: 5, maxTime: 2200,
            noiseFactor: 0.005,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: I1 - 1, b: 1, c: -1, d: I1
        }), {
            startingPosition: .5,
            verticalScale: 600
        }),
        new ringPlot(10, new cellsRing({
            numberOfCells: 100, reps: 5,
            noiseFactor: 0.005,
            eqX: 0, eqY: 0,
            mu: 1, nu: 0, a: I2 - 1, b: 1, c: -1, d: I2
        }), {
            startingPosition: .5,
            verticalScale: 20000
        }),
        // Stationary, finite short wave
        new ringPlot(11, new cellsRing({
            numberOfCells: 100, maxTime: 500,
            noiseFactor: 0.005,
            eqX: 0, eqY: 0,
            mu: 1, nu: .5, a: I3 - 2, b: 2.5, c: -1.25, d: I3 + 1.5
        }), {
            startingPosition: .5,
            verticalScale: 600
        })
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

    let inputs = document.getElementsByClassName("input-box");

    inputs.forEach((input) => {
        input.onchange = () => {
            changePlot();
        }
    });

    function changePlot() {
        let iters, vScale, vOffset;
        let numOfCells, dt, noise, noise2;
        let mu, nu, a, b, c, d;
        inputs.forEach((input) => {
            switch (input.id) {
                case "iters":
                    iters = parseInt(input.value);
                    break;
                case "v-scale":
                    vScale = parseInt(input.value);
                    break;
                case "v-offset":
                    vOffset = parseInt(input.value);
                    break;
                case "num-of-cells":
                    numOfCells = parseInt(input.value);
                    break;
                case "dt":
                    dt = parseInt(input.value);
                    break;
                case "noise":
                    noise = parseInt(input.value);
                    break;
                case "noise-2":
                    noise2 = parseInt(input.value);
                    break;
                case "mu":
                    mu = parseInt(input.value);
                    break;
                case "nu":
                    nu = parseInt(input.value);
                    break;
                case "a":
                    a = parseInt(input.value);
                    break;
                case "b":
                    break;
                case "c":
                    break;
                case "d":
                    break;
            }
        });
    }

}
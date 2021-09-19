let presentationController = new function () {

    let currentSlideIndex = 0;
    let presentationMode = false;

    let slides = document.getElementsByClassName("slide");
    let presentationPlay = document.getElementById("presentation-play");
    let presentationPause = document.getElementById("presentation-pause");
    let presentationControls = document.getElementById("presentation-controls");
    let progressBar = document.getElementById("progress-bar");

    presentationPlay.onclick = () => {
        togglePresentation();
    };

    presentationPause.onclick = () => {
        togglePresentation();
    };

    document.getElementById("next").onclick = () => {
        nextSlide();
    };

    document.getElementById("previous").onclick = () => {
        previousSlide();
    };

    document.addEventListener('keydown', (e) => {
        switch (e.code) {

            case "KeyS":
                togglePresentation();
                break;

            case "ArrowRight":
                nextSlide();
                break;

            case "ArrowLeft":
                previousSlide();
                break;

            default:
                break;
        }
    });

    function togglePresentation() {
        presentationMode = !presentationMode;

        document.body.style = "background: " + (presentationMode ? "var(--hidden)" : "var(--background)") + ";";
        presentationControls.style = "visibility: " + (presentationMode ? "visible" : "hidden") + ";";
        presentationPlay.style = "visibility: " + (presentationMode ? "hidden" : "visible") + ";";
        presentationPause.style = "visibility: " + (presentationMode ? "visible" : "hidden") + ";";

        if (presentationMode) {
            updateSlides();
        } else {
            slides.forEach(slide => {
                slide.style = "background: var(--background);"
            });
        }
    }

    function nextSlide() {
        if (presentationMode) {
            if (++currentSlideIndex > slides.length - 1) {
                currentSlideIndex = 0;
            }
            updateSlides();
        }
    }

    function previousSlide() {
        if (presentationMode) {
            if (--currentSlideIndex < 0) {
                currentSlideIndex = slides.length - 1;
            }
            updateSlides();
        }
    }

    function updateSlides() {
        slides.forEach((slide, i) => {
            slide.style = "background: " + (i == currentSlideIndex ? "var(--background)" : "var(--hidden)") + ";";
        });
        progressBar.style = "width: " + (currentSlideIndex / (slides.length - 1) * 100) + "%";
        setTimeout(() => {
            slides[currentSlideIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 0);
    }
}
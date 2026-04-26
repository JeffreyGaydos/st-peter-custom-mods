{
    let numSlides = undefined;
    function getAllSliderData() {
        const sliderData = [];
        document.querySelectorAll("#sp-slider ul.lcp_catlist li").forEach((_, i) => {
            sliderData.push(getOneSlideData(i + 1));
        });
        console.log({sliderData});
        numSlides = sliderData.length;
        return sliderData;
    }

    function getOneSlideData(index) {
        const slideData = {};
        const listSelector = `#sp-slider ul.lcp_catlist li:nth-child(${index}) `;

        slideData.title = document.querySelector(listSelector + "a:first-child").innerText;
        slideData.href = document.querySelector(listSelector + "a:first-child").getAttribute("href");
        slideData.date = document.querySelector(listSelector + "span.lcp_date").innerText;
        slideData.excerpt = document.querySelector(listSelector + "div.lcp_excerpt").innerText;

        slideData.img = {};
        slideData.img.src = document.querySelector(listSelector + "img.lcp_thumb")?.getAttribute("src");
        slideData.img.srcset = document.querySelector(listSelector + "img.lcp_thumb")?.getAttribute("srcset");
        slideData.img.originalSrc = document.querySelector(listSelector + "img.lcp_thumb")?.getAttribute("src").replace(/-[0-9]{3}x[0-9]{3}/g, "");
        slideData.img.alt = document.querySelector(listSelector + "img.lcp_thumb")?.getAttribute("alt");

        if(slideData.img.src === undefined) {
            slideData.img = undefined;
        }

        return slideData;
    }

    function constructSlider(data) {
        document.querySelector("#sp-slider ul.lcp_catlist").remove();

        const sliderElement = document.querySelector("#sp-slider");
        data.forEach((sd, i) => {
            constructSlide(sd, i, sliderElement);
        });
    }

    function constructSlide(slideData, index, parent) {
        const slideElement = document.createElement("DIV");
        slideElement.id = "sp-slide-" + index;
        slideElement.classList.add("sp-slide");
        slideElement.setAttribute("data-active", index === 0);
        slideElement.inert = index !== 0;
        if(slideData.img !== undefined) {
            const image = document.createElement("IMG");
            image.src = slideData.img.originalSrc;
            // image.srcset = slideData.img.srcset;
            image.alt = slideData.img.alt;
            slideElement.appendChild(image);
        }
        const contentBox = document.createElement("DIV");
        contentBox.classList.add("sp-slide-text-box");
        const titleElement = document.createElement("h1");
        titleElement.innerText = slideData.title;
        const dateElement = document.createElement("P");
        dateElement.classList.add("sp-slide-date");
        dateElement.innerText = "Published on " + slideData.date;
        const excerptElement = document.createElement("P");
        excerptElement.classList.add("sp-slide-excerpt");
        excerptElement.innerText = slideData.excerpt;
        const buttonElement = document.createElement("BUTTON");
        buttonElement.classList.add("sp-slide-button");
        buttonElement.innerText = "Read More";
        buttonElement.onClick = "window.location.href = " + slideData.href;
        contentBox.appendChild(titleElement);
        contentBox.appendChild(dateElement);
        contentBox.appendChild(excerptElement);
        contentBox.appendChild(buttonElement);
        slideElement.appendChild(contentBox);

        parent.appendChild(slideElement);
    }

    function injectCss() {
        var style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/wp-content/plugins/st-peter-custom-mods/includes/css/spc_slider.css?v1.107";
        style.id = "spc_slider_styles";
        style.blocking = "render";
        document.head.appendChild(style);
    }

    let sp_slider_paused = false;
    let sp_slider_index = 0;
    let sp_slider_interval = undefined;

    function constructSliderControls() {
        const parent = document.querySelector("#sp-slider");

        const leftArrow = constructSliderArrow(true, parent);
        const rightArrow = constructSliderArrow(false, parent);
        const positionIndicators = constructIndicators(parent);
    }

    function constructSliderArrow(left, parent) {
        const arrow = document.createElement("BUTTON");
        arrow.classList.add("arrow");
        arrow.classList.add(left ? "left" : "right");
        arrow.addEventListener("click",
            left
                ? () => { previousSlide(true); }
                : () => { nextSlide(true); }
        );
        parent.appendChild(arrow);
    }

    function constructIndicators(parent) {
        if(numSlides) {
            const container = document.createElement("DIV");
            container.classList.add("indicators");
            for(let i = 0; i < numSlides; i++) {
                const indicator = document.createElement("BUTTON");
                indicator.classList.add("indicator");
                indicator.classList.add("hover-scale-2");
                indicator.setAttribute("data-active", i === 0);
                indicator.addEventListener("click", () => {
                    jumpToSlide(i);
                });
                container.appendChild(indicator);
            }
            parent.appendChild(container);
        }
    }

    function startSliderAutoPlay() {
        sp_slider_interval = setInterval(() => {
            nextSlide();
        }, 10000);
    }

    function stopSliderAutoPlay() {
        clearInterval(sp_slider_interval);
        sp_slider_interval = undefined;
    }

    function getCurrentSlideSelector() {
        return `#sp-slider .sp-slide:nth-child(${sp_slider_index + 1})`;
    }

    function getCurrentIndicatorSelector() {
        return `#sp-slider .indicators .indicator:nth-child(${sp_slider_index + 1})`;
    }

    function setCurrentSlideState(on) {
        if(on) {
            document.querySelector(getCurrentSlideSelector()).setAttribute("data-active", "true");
            document.querySelector(getCurrentSlideSelector()).inert = false;
            document.querySelector(getCurrentIndicatorSelector()).setAttribute("data-active", "true");
        } else {
            document.querySelector(getCurrentSlideSelector()).setAttribute("data-active", "false");
            document.querySelector(getCurrentSlideSelector()).inert = true;
            document.querySelector(getCurrentIndicatorSelector()).setAttribute("data-active", "false");
        }
    }

    function nextSlide(manual=false) {
        if(manual && sp_slider_interval !== undefined) {
            stopSliderAutoPlay();
        }
        setCurrentSlideState(false);
        sp_slider_index = (sp_slider_index + 1) % numSlides;
        setCurrentSlideState(true);
    }

    function previousSlide(manual=false) {
        if(manual && sp_slider_interval !== undefined) {
            stopSliderAutoPlay();
        }
        setCurrentSlideState(false);
        sp_slider_index = ((sp_slider_index - 1) + numSlides) % numSlides;
        setCurrentSlideState(true);
    }

    function jumpToSlide(newIndex) {
        //inherently manual, this is never used as part of autoplay
        if(/*manual && */sp_slider_interval !== undefined) {
            stopSliderAutoPlay();
        }
        setCurrentSlideState(false);
        sp_slider_index = newIndex;
        setCurrentSlideState(true);
    }

    if(!!document.querySelector("#sp-slider")) {
        injectCss();
        constructSlider(getAllSliderData());
        constructSliderControls();
        startSliderAutoPlay();
    }

    //For mobile compat: find the largest post in the slider and clamp to that with room for the read more button
    function HandleResize() {
        let maxHeight = 0;
        document.querySelectorAll("#sp-slider .sp-slide .sp-slide-text-box").forEach(s => {
            let thisSlidesHeight = 0;
            s.querySelectorAll("*").forEach(e => {
                thisSlidesHeight += e.getBoundingClientRect().height;
            });
            if(maxHeight < thisSlidesHeight) {
                maxHeight = thisSlidesHeight;
            }
        });
        document.querySelector("#sp-slider").style.setProperty('--sp-slider-height', `${Math.max(400, maxHeight + 135)}px`);
    }

    document.addEventListener("DOMContentLoaded", function() {
        HandleResize();
    });

    window.addEventListener("resize", () => {
        HandleResize();
    });
}
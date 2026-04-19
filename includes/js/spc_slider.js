{
    function getAllSliderData() {
        const sliderData = [];
        document.querySelectorAll("#sp-slider ul.lcp_catlist li").forEach((_, i) => {
            sliderData.push(getOneSlideData(i + 1));
        });
        console.log({sliderData});
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
        if(slideData.img !== undefined) {
            const image = document.createElement("IMG");
            image.src = slideData.img.src;
            image.srcset = slideData.img.srcset;
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
        style.href = "/wp-content/plugins/st-peter-custom-mods/includes/css/spc_slider.css?v1.19";
        style.id = "spc_slider_styles";
        style.blocking = "render";
        document.head.appendChild(style);
    }

    injectCss();
    constructSlider(getAllSliderData());
}
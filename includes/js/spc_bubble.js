console.log("Bubble");

//No conditional, present on all pages
{
    function injectCss() {
        var style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/wp-content/plugins/st-peter-custom-mods/includes/css/spc_bubble.css?v1.68";
        style.id = "spc_bubble_styles";
        style.blocking = "render";
        document.head.appendChild(style);
    }

    function createBubble() {
        var bubble = document.createElement("BUTTON");
        bubble.id = "mass-times-bubble";
        bubble.classList.add("hover-scale");
        bubble.addEventListener("mouseover", (e) => {
            e.target.classList.add("hovered");
        });
        bubble.addEventListener("mouseout", (e) => {
            e.target.classList.remove("hovered");
        });
        bubble.addEventListener("click", () => {
            showModal();
        });
        bubble.ariaLabel = "Open mass times & directions modal";
        var iconE = document.createElement("IMG");
        iconE.id = "e-icon";
        var iconC = document.createElement("IMG");
        iconC.id = "c-icon";
        var text = document.createElement("SPAN");
        text.innerHTML = "Mass Times <br />& Directions";
        
        bubble.appendChild(iconE);
        bubble.appendChild(iconC);
        bubble.appendChild(text);
        document.body.appendChild(bubble);
    }

    function createModal() {
        var dialogWrapper = document.createElement("DIV");
        dialogWrapper.role = "dialog";
        dialogWrapper.id = "mass-times-modal";
        dialogWrapper.classList.add("hide");
        var documentWrapper = document.createElement("DIV");
        documentWrapper.role = "document";
        var curtain = document.createElement("DIV");
        curtain.classList.add("curtain");
        curtain.addEventListener("click", () => {
            hideModal();
        });
        var content = document.createElement("DIV");
        content.classList.add("content");
        var contentTitle = document.createElement("DIV");
        contentTitle.classList.add("title");
        contentTitle.innerText = "Mass Times & Directions"
        var xButton = document.createElement("BUTTON");
        xButton.innerHTML = "&Cross;"
        xButton.ariaLabel = "close modal";
        xButton.addEventListener("click", () => {
            hideModal();
        });
        contentTitle.appendChild(xButton);
        var contentFlex = document.createElement("DIV");
        contentFlex.classList.add("spc-two-column-parent");
        var contentLeft = document.createElement("DIV");
        contentLeft.classList.add("spc-two-column-child");
        var contentLeftTitle = document.createElement("H3");
        contentLeftTitle.innerText = "Mass Schedule";
        var massTimesElement = document.createElement("spc_mass_times");
        contentLeft.appendChild(contentLeftTitle);
        contentLeft.appendChild(massTimesElement);
        var contentRight = document.createElement("DIV");
        contentRight.classList.add("spc-two-column-child");
        var contentRightTitle = document.createElement("H3");
        contentRightTitle.innerText = "Location & Directions";
        var contentRightLink = document.createElement("A");
        contentRightLink.setAttribute("href", "https://www.google.com/maps/place/St.+Peter+Catholic+Church/@41.5052582,-81.6829669,17.5z/data=!4m6!3m5!1s0x8830fa7b47b55fcd:0x245ee5e49c55ae4d!8m2!3d41.5055112!4d-81.6811127!16s%2Fm%2F0nhk152?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D");
        contentRightLink.title = "Open in Google Maps";
        contentRightLink.classList.add("hover-scale");
        contentRightLink.style.display = "inline-block";
        contentRightLink.style.marginTop = "-20px";
        contentRightLink.style.height = "380px";
        var contentRightImage = document.createElement("IMG");
        contentRightImage.src = "/wp-content/plugins/st-peter-custom-mods/images/MapLocation.png"
        contentRightImage.style.maxHeight = "350px";
        contentRightImage.alt = "Google Maps view of St. Peter Parish";
        var contentRightHint = document.createElement("P");
        contentRightHint.innerText = "Click the above image to see directions on Google Maps";
        contentRight.appendChild(contentRightTitle);
        contentRightLink.appendChild(contentRightImage);
        contentRight.appendChild(contentRightLink);
        contentRight.appendChild(contentRightHint);

        content.appendChild(contentTitle);
        contentFlex.appendChild(contentLeft);
        contentFlex.appendChild(contentRight);
        content.appendChild(contentFlex);
        documentWrapper.appendChild(curtain);
        documentWrapper.appendChild(content);
        dialogWrapper.appendChild(documentWrapper);

        document.body.appendChild(dialogWrapper);

        RefreshAllMassTimePreviews();
    }

    function showModal() {
        spc_safe_remove_class(document.querySelector("#mass-times-modal"), "hide");
        document.addEventListener("keydown", HandleFinalElementTabLoop);
        document.addEventListener("keydown", HandleFirstElementTabLoop);
        document.querySelector("#mass-times-modal .title button")?.focus();
    }

    function hideModal() {
        document.querySelector("#mass-times-modal").classList.add("hide");
        document.removeEventListener("keydown", HandleFinalElementTabLoop);
        document.removeEventListener("keydown", HandleFirstElementTabLoop);
        document.querySelector("#mass-times-bubble")?.focus();
    }

    function HandleFinalElementTabLoop(e) {
        if(document.activeElement === document.querySelector("#mass-times-modal a")) {
            if(e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                document.querySelector("#mass-times-modal .title button")?.focus();
            }
        }
    }

    function HandleFirstElementTabLoop(e) {
        if(document.activeElement === document.querySelector("#mass-times-modal .title button")) {
            if(e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                document.querySelector("#mass-times-modal a")?.focus();
            }
        }
    }

    injectCss();
    createBubble();
    createModal();
}
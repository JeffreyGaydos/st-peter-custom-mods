console.log("Bubble");

//No conditional, present on all pages
{
    function injectCss() {
        var style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/wp-content/plugins/st-peter-custom-mods/includes/css/spc_bubble.css?v1.43";
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
        })
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

    injectCss();
    createBubble();
}
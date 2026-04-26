<?php
/*
    This section of code deals with linking the php and data from the backend to the respective functionality detailed in javascript
*/

/********************************************************************
 * SPC Init
 ********************************************************************/
add_action("wp_head", "spc_init", 1);

if( !function_exists("spc_init") ) {
    function spc_init() {
        wp_enqueue_script( 'spc-init', plugins_url('/js/spc_init.js', __FILE__), '', '1.0');
    }
}

/********************************************************************
 * Routing Mass Times System
 ********************************************************************/
if(get_option('spc_masstimes') == 'on') {
    add_action("wp_head", "spc_masstimes", 10);
}

if( !function_exists("spc_masstimes") ) {
    function spc_masstimes() {
        wp_enqueue_script( 'spc-masstimes', plugins_url('/js/spc_masstimes.js', __FILE__), '', '1.1');
    }
}

/********************************************************************
 * Routing Slider UI
 ********************************************************************/
if(get_option('spc_slider') == 'on') {
    add_action("wp_head", "spc_slider", 10);
}

if( !function_exists("spc_slider") ) {
    function spc_slider() {
        wp_enqueue_script( 'spc-slider', plugins_url('/js/spc_slider.js', __FILE__), '', '1.285');
    }
}

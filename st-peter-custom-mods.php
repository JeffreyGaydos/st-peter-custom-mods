<?php
/*
Plugin Name: St. Peter Custom Mods
Version: 0.0.1 | Author: Jeffrey Gaydos | Github Repo: https://github.com/JeffreyGaydos/te-custom-mods

Description: A plugin created for St. Peter Parish for any and all customizations that could be easily implemented in a plugin
*/

//Including all files contained within "includes/tp-functions.php". Require Once denotes that this plugin will not run without finding and compiling this file
require_once plugin_dir_path(__FILE__) . 'includes/spc-functions.php';

/*
 *  Menu/Settings Page Initialization and Creation
 *  - Initializes the Menu Page
 *  - Creates the Menu Page
 *  - Updates data in the wordpress backend for use in plugin (see ./includes/spc-functions.php)
 */

//Hooking the menu creation and initialization functions to their appropriate hooks
add_action( 'admin_menu', 'spc_settings_menu' );
add_action( 'admin_init', 'update_spc_info' );
add_action('admin_footer', 'load_admin_scripts'); //footer to make sure all the HTML in here has loaded so we can immediately reference them in the script

//tells wordpress that we are going to a create a menu page for this plugin (with various details)
function spc_settings_menu() {
    $page_title = 'St. Peter Custom Mods';
    $menu_title = 'St. Peter Custom Mods';
    $capability = 'manage_options';
    $menu_slug  = 'spc-settings';
    $function   = 'spc_acp_page';
    $icon_url   = 'dashicons-admin-customizer';
    //$icon_url   = plugins_url('images/icon.png'); - for custom images
    $position = 60;
    add_menu_page( $page_title, $menu_title, $capability, $menu_slug, $function, $icon_url, $position);
}

function load_admin_scripts( $hook ) {
    wp_enqueue_script( 'spc-admin-panel', plugins_url('/includes/js/spc_admin_panel.js', __FILE__), '', '1.0');
}

//Creates the html of the plugin's setting page, passing data through the backend as needed
if( !function_exists("spc_acp_page") ) {
    function spc_acp_page() {
        ?>
            <h1>St. Peter Custom Mods</h1>
            <p>Make sure you click the "Save Changes" button at the bottom otherwise nothing will actually change</p>
            <br>
            <form method="post" action="options.php">
            <?php
                settings_fields( 'spc-settings' );
            ?>
            <?php
                do_settings_sections( 'spc-settings' );
            ?>
            <h2>Mass Schedule</h2>
            <input type="checkbox" name="spc_masstimes" <?php spc_get_checked('spc_masstimes') ?> >Turn Off Mass Schedule System</input>
            <p>Use the dropdowns to set a mass schedule to display. The current mass schedule is listed below the dropdowns. Click the cancel checkbox on a specific mass time to cancel the mass time just for this week. Click the x button on a specific mass time to remove it forever.</p>
            <p>Current "Default" Mass Times</p>
            <ul>
                <li>Sunday, 11:30 AM Every Week<input type="checkbox" name="ms-cancel">Cancel</input><button id="ms-delete">x</button></li>
                <li>Sunday, 7:00 PM Every Week</li>
            </ul>
            <button>+ Add Another Day</button>
            <select name="ms-day-of-week">
                <option value="-1" disabled selected>Select a day...</option>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
            </select>
            <input type="time" id="ms-time">
            
            <?php
                submit_button();
            ?>
            </form>
        <?php
    }
}

//Checks the status of the checkbox according to the database, setting the "checked" parameter as necessary
//Helper function for "spc_acp_page()" (above)
if( !function_exists("spc_get_checked") ) {
    function spc_get_checked($option) {
        if(get_option($option) == 'on') {
            echo 'checked';
        }
        else {
            echo '';
        }
    }
}

if( !function_exists("spc_get_text") ) {
    function spc_get_text($option) {
        return get_option($option);
    }
}

//TODO add an x button
if( !function_exists("spc_generate_list_from_text") ) {
    function spc_generate_list_from_text($text) {
        $names = preg_split("/::::/", $text, -1, PREG_SPLIT_NO_EMPTY);
        foreach($names as &$name) {
            echo '<li style="list-style: inside">'.$name.'</li>';
        }
    }
}

if( !function_exists("update_spc_info") ) {
    function update_spc_info() {
        register_setting( 'spc-settings', 'spc_masstimes' );
    }
}
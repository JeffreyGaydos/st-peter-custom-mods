<?php
/*
Plugin Name: St. Peter Custom Mods
Version: 0.0.4 | Author: Jeffrey Gaydos | Github Repo: https://github.com/JeffreyGaydos/st-peter-custom-mods

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
    wp_enqueue_script( 'spc-masstimes', plugins_url('/includes/js/spc_masstimes.js', __FILE__), '', '1.0');
    wp_enqueue_script( 'spc-admin-panel', plugins_url('/includes/js/spc_admin_panel.js', __FILE__), '', '1.8');
    wp_enqueue_style( 'spc-admin-panel-css', plugins_url('/includes/css/spc_admin_panel.css', __FILE__), '', '1.2');
}

//Creates the html of the plugin's setting page, passing data through the backend as needed
if( !function_exists("spc_acp_page") ) {
    function spc_acp_page() {
        ?>
        <div class="sp-admin-panel">
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
            <h2>Custom Slider</h2>
            <input type="checkbox" name="spc_slider" <?php spc_get_checked('spc_slider') ?> ><span>Turn On/Off Custom Slider</span></input>
            <h2>Mass Schedule</h2>
            <input type="checkbox" name="spc_masstimes" <?php spc_get_checked('spc_masstimes') ?> ><span>Turn On/Off Mass Schedule System</span></input>
            <h2>Mass Times Bubble</h2>
            <input type="checkbox" name="spc_bubble" <?php spc_get_checked('spc_bubble') ?> ><span>Turn On/Off Mass Times Bubble</span></input>
            <textarea type="text" name="spc_masstimes_json" id="ms-json-constant" style="display: none"><?php echo spc_get_text('spc_masstimes_json'); ?></textarea>
            <?php
                submit_button();
            ?>
            </form>
            <form id="ms-add-form" method="post" action="options.php">
                <?php
                    settings_fields( 'spc-settings' );
                ?>
                <?php
                    do_settings_sections( 'spc-settings' );
                ?>
                <!-- Each form in WordPress has to have ALL settings in it, so if you want to have multiple forms, you must include each "oroginal" setting in that form, which is what we've done with these hidden inputs. Consider if breaking this up into multiple sidebar admin pannels would be easier-->
                <input type="checkbox" name="spc_masstimes" style="display: none;" <?php spc_get_checked('spc_masstimes') ?> ><span style="display: none">Turn On/Off Mass Schedule System</span></input>
                <input type="checkbox" name="spc_slider" style="display: none;" <?php spc_get_checked('spc_slider') ?> ><span style="display: none">Turn On/Off Custom Slider</span></input>
                <input type="checkbox" name="spc_bubble" style="display: none;" <?php spc_get_checked('spc_bubble') ?> ><span style="display: none">Turn On/Off Mass Times Bubble</span></input>

                <h2>Mass Schedule Configuration</h2>
                <textarea type="text" name="spc_masstimes_json" id="ms-json-add" style="display: none"><?php echo spc_get_text('spc_masstimes_json'); ?></textarea>
                <p>
                    <a href="https://github.com/JeffreyGaydos/st-peter-custom-mods/blob/main/MassTimesReadme.md">Help / Instructions</a>
                </p>
                <h4 id="ms-add-loading-indicator">Loading...</h4>
            
                <fieldset id="ms-add-time-fs" style="display: none">
                    <legend>Add a New Mass Time</legend>
                    <label for="ms-frequency">Frequency: </label>
                    <select id="ms-frequency" class="ms-frequency" disabled>
                        <option style="display: none" value="-1" disabled selected>Select Mass frequency...</option>
                    </select>
                    <br/>
                    <label for="ms-day-of-week">Day of Week</label>
                    <select id="ms-day-of-week" class="ms-day-of-week" disabled>
                        <option style="display: none" value="-1" disabled selected>Select a day...</option>
                    </select>
                    <br/>
                    <label for="ms-date">Date</label>
                    <input type="date" id="ms-date" class="ms-date" disabled>
                    <br/>
                    <label for="ms-time">Time of Day</label>
                    <input type="time" id="ms-time" disabled>
                    <br/>
                    <label for="ms-additional-notes">Additional Notes</label>
                    <input type="text" id="ms-additional-notes" disabled/>
                    <span style="font-style: italic">(HTML code Supported)</span>
                    <br/>
                    <br/>
                    <input type="submit" id="ms-add-button" class="button button-primary" value="Add this Mass Time" disabled />
                </fieldset>
            </form>
            <form id="ms-edit-form" method="post" action="options.php">
                <?php
                    settings_fields( 'spc-settings' );
                ?>
                <?php
                    do_settings_sections( 'spc-settings' );
                ?>
                <!-- Each form in WordPress has to have ALL settings in it, so if you want to have multiple forms, you must include each "oroginal" setting in that form, which is what we've done with these hidden inputs. Consider if breaking this up into multiple sidebar admin pannels would be easier-->
                <input type="checkbox" name="spc_masstimes" style="display: none;" <?php spc_get_checked('spc_masstimes') ?> ><span style="display: none">Turn On/Off Mass Schedule System</span></input>
                <input type="checkbox" name="spc_slider" style="display: none;" <?php spc_get_checked('spc_slider') ?> ><span style="display: none">Turn On/Off Custom Slider</span></input>
                <input type="checkbox" name="spc_bubble" style="display: none;" <?php spc_get_checked('spc_bubble') ?> ><span style="display: none">Turn On/Off Mass Times Bubble</span></input>
                <textarea type="text" name="spc_masstimes_json" id="ms-json-edit" style="display: none"><?php echo spc_get_text('spc_masstimes_json'); ?></textarea>
                <div>
                    <h3>Current Configured Mass Times</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Time</th>
                                <th>Cancel</th>
                                <th>Additional Notes</th>
                                <th>Delete</th>
                                <th>Is Actually Saved</th>
                            </tr>
                        </thead>
                        <tbody id="ms-tbody">
                            <h4 id="ms-existing-loading-indicator">Loading...</h4>
                        </tbody>
                    </table>
                </div>
                <input type="submit" class="button button-primary" id="ms-edit-button" value="Save Edits" disabled />
                <div>
                    <h3>Mass Times Preview:</h3>
                    <div id="ms-preview-window">
                        <h3>Mass Times:</h3>
                        <spc_mass_times></spc_mass_times>
                    </div>
                </div>
                <br />
                <br />
            </form>
        </div>
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
        register_setting( 'spc-settings', 'spc_masstimes_json');
        register_setting( 'spc-settings', 'spc_slider' );
        register_setting( 'spc-settings', 'spc_bubble' );
    }
}
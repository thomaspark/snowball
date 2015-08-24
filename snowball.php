<?php

/*
 * Plugin Name: Snowball
 * Plugin URI: http://snowball.openhtml.org
 * Description: A block-based editor for authoring and styling modern, immersive multimedia articles
 * Version: 0.2.0
 * Author: openHTML
 * Author URI: http://openhtml.org
 * License: MIT
 */

$path = plugin_dir_path(__FILE__);

// Create custom post type
require_once("inc/snowball-config.php");

// Add scripts and stylesheets
require_once("inc/snowball-enqueue.php");

// Database gets and sets
require_once("inc/snowball-database.php");

?>

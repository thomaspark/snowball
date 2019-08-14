<?php

/*
 * Plugin Name: Snowball
 * Plugin URI: https://snowball.openhtml.org
 * Description: A block-based editor for authoring modern, immersive longform web articles
 * Version: 0.4.20
 * Author: openHTML
 * Author URI: http://openhtml.org
 * License: GPLv2
 */

$path = plugin_dir_path(__FILE__);

// Create custom post type
require_once("inc/snowball-config.php");

// Add scripts and stylesheets
require_once("inc/snowball-enqueue.php");

// Database gets and sets
require_once("inc/snowball-database.php");

?>

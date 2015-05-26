<?php

/*
 * Plugin Name: Snowball
 * Plugin URI: http://URI_Of_Page_Describing_Plugin_and_Updates
 * Description: A brief description of the plugin.
 * Version: The plugin's version number. Example: 1.0.0
 * Author: Name of the plugin author
 * Author URI: http://URI_Of_The_Plugin_Author
 * Text Domain: Optional. Plugin's text domain for localization. Example: mytextdomain
 * Domain Path: Optional. Plugin's relative directory path to .mo files. Example: /locale/
 * Network: Optional. Whether the plugin can only be activated network wide. Example: true
 * License: A short license name. Example: GPL2
 */

/*
 * Create custom post type
 */

function snowball_create_post_type() {
  register_post_type('snowball',
    array(
      'labels' => array(
        'name' => __('Snowball'),
        'all_items' => __('All Articles'),
        'singular_name' => __('Article'),
        'add_new' => __('Add New'),
        'edit_item' => __('Edit Article'),
        'view_item' => __('View Article')
      ),
      'menu_icon' => 'dashicons-marker',
      'public' => true,
      'has_archive' => true
    )
  );
}
add_action('init', 'snowball_create_post_type');



/*
 * Add category and tag support
 */

// function add_tags_categories() {
//   register_taxonomy_for_object_type('category', 'snowball');
//   register_taxonomy_for_object_type('post_tag', 'snowball');
// }
// add_action('init', 'add_tags_categories');


/*
 * Force custom post type to have one column layout
 */

// function snowball_screen_layout_columns($columns) {
//   $columns['snowball'] = 1;
//   return $columns;
// }
// add_filter( 'screen_layout_columns', 'snowball_screen_layout_columns' );

function snowball_screen_layout_post() {
  return 1;
}
add_filter('get_user_option_screen_layout_snowball', 'snowball_screen_layout_post');



/*
 * Remove editor
 */

function snowball_remove_editor() {
  // remove_post_type_support('post', 'title');
  remove_post_type_support('snowball', 'editor');

}
add_action('admin_init', 'snowball_remove_editor');



/*
 * Remove metaboxes
 */

function snowball_remove_metaboxes() {
  remove_meta_box('slugdiv', 'snowball', 'normal'); // Slug
  // remove_meta_box('submitdiv', 'snowball', 'side'); // Publish box
}
add_action('add_meta_boxes', 'snowball_remove_metaboxes');



/*
 * Add metabox
 */

function snowball_add_metabox() {
  add_meta_box('snowball_meta', 'Editor', 'snowball_metabox_callback', 'snowball');
}
add_action('add_meta_boxes', 'snowball_add_metabox');

function snowball_metabox_callback() {
  wp_nonce_field(plugin_basename( __FILE__ ), 'snowball_metabox_content_nonce');
  $path = plugin_dir_path( __FILE__ );
  require('inc/snowball-editor.php');
}



/*
 * Use snowball-template.php for output
 */

function snowball_template($single_template) {
  if (get_post_type(get_the_id()) == 'snowball') {
    $single_template = dirname( __FILE__ ) . '/snowball-template.php';
  }
  return $single_template;
}
add_filter('single_template', 'snowball_template');



/*
 * Add scripts and stylesheets
 */

function snowball_admin_add_scripts_and_stylesheets() {
  if (get_post_type(get_the_id()) == 'snowball') {
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_style('snowball-css', plugins_url('snowball/styles/snowball-admin.css'));
    wp_enqueue_script('snowball-js', plugins_url('snowball/scripts/snowball-admin.js'), array('jquery', 'wp-color-picker'), '', true);

    // image uploads
    wp_enqueue_style('thickbox');
    wp_enqueue_script('media-upload');
    wp_enqueue_script('thickbox');
  }
}
add_action('admin_enqueue_scripts', 'snowball_admin_add_scripts_and_stylesheets');

function snowball_add_stylesheets() {
    echo '<link rel="stylesheet" href="' . plugins_url('snowball/styles/snowball.css') . '">';
}
add_action('snowball_enqueue_stylesheets', 'snowball_add_stylesheets');

function snowball_add_scripts() {
    echo '<script src="' . plugins_url('snowball/scripts/snowball.js') . '"></script>';
}
add_action('snowball_enqueue_scripts', 'snowball_add_scripts');



/*
 * Saving post
 */

function snowball_metabox_save($post_id) {
  if (defined( 'DOING_AUTOSAVE') && DOING_AUTOSAVE) 
  return;

  if (!wp_verify_nonce($_POST['snowball_metabox_content_nonce'], plugin_basename( __FILE__ )))
  return;

  if (!current_user_can('edit_page', $post_id))
  return;

  // $product_price = $_POST['product_price'];
  // update_post_meta($post_id, 'product_price', $product_price);
}
add_action('save_post', 'snowball_metabox_save');


/*
  Ajax calls
*/

add_action( 'admin_enqueue_scripts', 'add_block_ajax_enqueue' );
function add_block_ajax_enqueue($hook) {

  wp_enqueue_script( 'ajax-script', plugins_url( '/js/snowball-ajax.js', __FILE__ ), array('jquery') );

  // in JavaScript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
  wp_localize_script( 'ajax-script', 'ajax_object',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' )));
}

// THE HANDLER FUNCTION for the AJAX call
add_action( 'wp_ajax_add_blocks', 'add_block_callback' );
function add_block_callback() {
  
  wp_die();
}

/*
  Database calls
*/

global $snowball_db_version;
$snowball_db_version = '1.0';

// This should be only called once the plugin is installed
function snowball_install() {
  global $wpdb;
  global $snowball_db_version;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  
  $charset_collate = $wpdb->get_charset_collate();

  $sql = "CREATE TABLE $table_name (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    blocks_value longtext NOT NULL,
    UNIQUE KEY ID (id)
  ) $charset_collate;";

  require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
  dbDelta( $sql );

  add_option( 'snowball_db_version', $snowball_db_version );
}

// sample database change
function snowball_install_data() {
  global $wpdb;
  global $post;
  
  $table_name = $wpdb->prefix . 'snowball_blocks';
  
  $inserted = $wpdb->insert( 
    $table_name, 
    array( 
      'time' => current_time( 'mysql' ), 
      'post_id' => $post->ID, 
      'blocks_value' => "sample text", 
    ) ,
    array(
      "%s",
      "%d",
      "%s",
    )
  );

  if( $inserted ){
    $insert_id = $wpdb->insert_id;
  }else{
    //Insert failed
  }

}

function snowball_update_blocks() {

}

register_activation_hook( __FILE__, 'snowball_install' );
//register_activation_hook( __FILE__, 'snowball_install_data' );

?>

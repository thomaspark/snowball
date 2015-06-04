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
      'has_archive' => true,
      'supports' => array('title', 'author', 'comments')
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
// add_filter('screen_layout_columns', 'snowball_screen_layout_columns');

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
  wp_nonce_field(plugin_basename(__FILE__), 'snowball_metabox_content_nonce');
  $path = plugin_dir_path(__FILE__);
  require('inc/snowball-editor.php');
}



/*
 * Use snowball-template.php for output
 */

function snowball_template($single_template) {
  if (get_post_type(get_the_id()) == 'snowball') {
    $single_template = dirname(__FILE__) . '/snowball-template.php';
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
    wp_enqueue_script('snowball-js', plugins_url('snowball/scripts/snowball-admin.js'), array('jquery', 'jquery-ui-sortable', 'wp-color-picker'), '', true);

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
  if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) 
  return;

  if (isset($_POST['snowball_metabox_content_nonce']) && !wp_verify_nonce($_POST['snowball_metabox_content_nonce'], plugin_basename(__FILE__)))
  return;

  if (!current_user_can('edit_page', $post_id))
  return;

  // $product_price = $_POST['product_price'];
  // update_post_meta($post_id, 'product_price', $product_price);
}
// add_action('save_post', 'snowball_metabox_save');


/*
 * Ajax calls
 * TODO: add permissions and error traps
 */

function add_ajax_enqueue($hook) {
  global $post;
  wp_enqueue_script('ajax-script', plugins_url('/scripts/snowball-ajax.js', __FILE__), array('jquery'));

  // in JavaScript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
  wp_localize_script('ajax-script', 'ajax_object',
            array('ajax_url' => admin_url('admin-ajax.php'), 'post_id' => $post->ID));
}
add_action('admin_enqueue_scripts', 'add_ajax_enqueue');


/*
 * Handler function for the add-block 
 TODO: look into magic_quotes_gpc for the slash striping
 TODO: Is there a way to prevent XSS attacks, 
 also json_encode and stripslashes might be iffy
 */
function add_blocks_callback() {
  $post_id = $_POST['post_id'];
  $block_data = $_POST['blocks'];
  $block_data = json_encode($block_data);
  $block_data = wp_slash($block_data);
  $block_data = stripslashes($block_data);
  $insert_id = snowball_save_block($block_data, $post_id);
  $success = 'success';

  if ($insert_id == -1) {
    $success = 'failed';
  }

  echo $success;
  wp_die();
}
add_action('wp_ajax_nopriv_add_blocks', 'add_blocks_callback');
add_action('wp_ajax_add_blocks', 'add_blocks_callback');

/*
 * Handler function for add-article
*/
function add_article_callback() {
  $post_id = $_POST['post_id'];
  // removes the \ from the quotes before saving
  $article_data = $_POST['article'];
  $article_data = stripslashes($article_data);
  $insert_id = snowball_save_article($article_data, $post_id);
  $success = "success";
  if ($insert_id == -1) {
    $success = "failed";
  }
  echo $success;
  wp_die();
}
add_action('wp_ajax_nopriv_add_article', 'add_article_callback');
add_action('wp_ajax_add_article', 'add_article_callback');


/*
 * Returns a string representing the json.
 *  TODO: Does this prevent XSS attacks.
 */
function get_block_json($post_id) {
  $row = snowball_get_blocks($post_id);
  $block_json = '[]';

  if(isset($row)){
    $block_json = $row->blocks_value;
    $block_json = stripslashes($block_json);
    if(!isset($block_json)){
      $block_json = '[]';
    }
  }
  return $block_json;
}


/*
 * Database calls
 * TODO: add permissions and error traps
 */
global $snowball_db_version;
$snowball_db_version = '1.0';
/* 
  This is called only once, when the plugin is installed
  this creates the table needed for the plugin
*/
function snowball_install_dbtable() {
  global $wpdb;
  global $snowball_db_version;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  $table_name_articles = $wpdb->prefix . 'snowball_articles';

  $charset_collate = $wpdb->get_charset_collate();

  $snowball_blocks_table = "CREATE TABLE $table_name (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    blocks_value longtext NOT NULL,
    UNIQUE KEY ID (id)
 ) $charset_collate;";

  $snowball_articles_table = "CREATE TABLE $table_name_articles (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    article_html longtext NOT NULL,
    UNIQUE KEY ID (id)
 ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($snowball_blocks_table);
  dbDelta($snowball_articles_table);

  add_option('snowball_db_version', $snowball_db_version);
}
register_activation_hook(__FILE__, 'snowball_install_dbtable');


// if successful return insert_id
// if fails return -1
// TODO: error checking beginning and after the function.
function snowball_save_block($json_block, $post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  $json_block = mysql_real_escape_string($json_block);

  $was_updated = $wpdb->update(
    $table_name, 
    array(
      'time' => current_time('mysql'), 
      'blocks_value' => $json_block,
     ),
    array('post_id' => $post_id), 
    array('%s', '%s',),
    array('%d')
 );

  $was_successful = true;
  if ($was_updated === 0) {
    $was_successful = $wpdb->insert(
      $table_name, 
      array(
        'time' => current_time('mysql'), 
        'post_id' => $post_id, 
        'blocks_value' => $json_block,
     ),
      array(
        '%s',
        '%d',
        '%s',
     )
   );
  }

  // This isn't the best error checking done
  if($was_successful == false){
    //Insert failed
    return -1;
  }
  return $was_successful;
}

// if successful return insert_id
// if fails return -1
// TODO: error checking beginning and after the function.
function snowball_save_article($article, $post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';

  $was_updated = $wpdb->update(
    $table_name, 
    array(
      'time' => current_time('mysql'), 
      'article_html' => $article,
     ),
    array('post_id' => $post_id), 
    array('%s', '%s',),
    array('%d')
 );

  $was_successful = true;
  //$was_successful = $was_updated;
  if ($was_updated === 0 || $was_updated == false) {
    $was_successful = $wpdb->insert(
      $table_name, 
      array(
        'time' => current_time('mysql'), 
        'post_id' => $post_id, 
        'article_html' => $article,
     ),
      array(
        '%s',
        '%d',
        '%s',
     )
   );
  }
  // This isn't the best error checking done
  if($was_successful == false){
    //Insert failed
    return -1;
  }
  return $was_successful;
}

/*
 * Retrieves the blocks stored in the database with a post id of $post_id.
 * Returns the data as a string.
 * Just takes care of retrieving the data, not the formatting of it.
 */

function snowball_get_blocks($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_blocks';

  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE post_id = %d', $post_id));

  return $row;
}

/*
  Retrieves the blocks stored in the database with a post id of $post_id.
  Returns the data as a string.
*/
//TODO figure out a way to deal with when db table is empty
//this jawn don't work
function snowball_get_article($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';

  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM '.$table_name.' WHERE post_id = %d', $post_id));
  if($row) {
    $article = $row->article_html;
    if($article != NULL){
      return $article;
    }
  }

  return "<section></section>";
}

/*
 * Define shortcodes
 *
 */
add_shortcode('title', 'get_the_title');
add_shortcode('date', 'get_the_date');
add_shortcode('author', 'get_the_author');



?>

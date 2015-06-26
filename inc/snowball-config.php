<?php

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
  remove_meta_box('submitdiv', 'snowball', 'side'); // Publish box
  remove_meta_box('authordiv', 'snowball', 'normal');
  //remove_meta_box('commentsdiv', 'snowball', 'normal');
  remove_meta_box('commentstatusdiv', 'snowball', 'normal');
}
add_action('add_meta_boxes', 'snowball_remove_metaboxes');



/*
 * Add metabox
 */

function snowball_add_metabox_custom() {
  add_meta_box('submitdiv', 'Settings', 'snowball_metabox_settings_callback', 'snowball');
}
add_action('add_meta_boxes', 'snowball_add_metabox_custom');

function snowball_metabox_settings_callback() {
  wp_nonce_field(plugin_basename(__FILE__), 'snowball_metabox_content_nonce');
  require('snowball-settings.php');
}



/*
 * Add metabox
 */

function snowball_add_metabox() {
  add_meta_box('snowball_meta', 'Editor', 'snowball_metabox_callback', 'snowball');
}
add_action('add_meta_boxes', 'snowball_add_metabox');

function snowball_metabox_callback() {
  wp_nonce_field(plugin_basename(__FILE__), 'snowball_metabox_content_nonce');
  require('snowball-editor.php');
}


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
 * Use snowball-template.php for output
 */

function snowball_template($single_template) {
  if (get_post_type(get_the_id()) == 'snowball') {
    global $path;
    $single_template = $path . '/snowball-template.php';
  }
  return $single_template;
}
add_filter('single_template', 'snowball_template');



/*
 * Add snowball posts to front page displays dropdown
 */


function snowball_front_page_displays($pages) {
  $snowball_pages = new WP_Query(array('post_type' => 'snowball'));
  if ($snowball_pages->post_count > 0) {
    $pages = array_merge($pages, $snowball_pages->posts);
  }

  return $pages;
}
add_filter('get_pages', 'snowball_front_page_displays');



/*
 * Define shortcodes
 */

add_shortcode('title', 'get_the_title');
add_shortcode('date', 'get_the_date');
add_shortcode('author', 'get_the_author');

?>

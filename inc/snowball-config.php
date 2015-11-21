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
        'view_item' => __('View Article'),
        'show_in_nav_menus' => TRUE
     ),
      'menu_icon' => 'dashicons-marker',
      'public' => true,
      'has_archive' => true,
      'supports' => array('title', 'author', 'comments', 'excerpt', 'thumbnail'),
      'rewrite' => array('slug' => 'snowball'),
      'taxonomies' => array('post_tag','category')
   )
 );
}
add_action('init', 'snowball_create_post_type');

/*
  Flush rewrite for permalinks
*/
function snowball_rewrite_flush() {
    snowball_create_post_type();

    flush_rewrite_rules();
}
register_activation_hook($path . 'snowball.php', 'snowball_rewrite_flush');

function snowball_rewrite_flush_deactivation() {
    flush_rewrite_rules();
}
register_deactivation_hook($path . 'snowball.php', 'snowball_rewrite_flush_deactivation');



/*
 * Remove editor
 */

function snowball_remove_editor() {
  remove_post_type_support('snowball', 'editor');

}
add_action('admin_init', 'snowball_remove_editor');



/*
 * Remove metaboxes
 */

function snowball_remove_metaboxes() {
  remove_meta_box('authordiv', 'snowball', 'normal');
  remove_meta_box('submitdiv', 'snowball', 'side'); // Publish box
  //remove_meta_box('slugdiv', 'snowball', 'normal'); // Slug
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
}
// add_action('save_post', 'snowball_metabox_save');



/*
 * Use snowball-template.php for output
 */

function snowball_template($single_template) {
  $postid = get_the_id();

  if ((get_post_type($postid) == 'snowball') && (is_single($postid) || get_option('page_on_front') == $postid)) {
    global $path;
    $single_template = $path . '/snowball-template.php';
  }
  return $single_template;
}
add_filter('template_include', 'snowball_template');



/*
 * Add article's custom head code to header
 */

function snowball_add_custom_code() {
  if (get_post_type(get_the_id()) == 'snowball') {
    $article = snowball_get_article(get_the_id(), 0);
    $output = $article['head_html'];

    echo $output;
  }
}
add_action('wp_head', 'snowball_add_custom_code');



/*
 * Add snowball posts to front page, search, archives, etc
 */

function snowball_add_to_query( $query ) {
  if ( $query->is_home() && $query->is_main_query() ) {
    $query->set('post_type', array('post', 'article', 'snowball'));
  }
}
add_action('pre_get_posts', 'snowball_add_to_query');



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


function snowball_enable_front_page($query) {
  if((!isset($query->query_vars['post_type']) || '' == $query->query_vars['post_type']) && 0 != $query->query_vars['page_id']) {
    $query->query_vars['post_type'] = array('page', 'snowball');
  }
}
add_action('pre_get_posts', 'snowball_enable_front_page');

function snowball_menu() {
  add_options_page(
    'Snowball',
    'Snowball',
    'manage_options',
    'snowball',
    'snowball_options_page'
  );
}
add_action('admin_menu', 'snowball_menu');

function snowball_options_page() {

  if(!current_user_can('manage_options')) {
    wp_die('You do not have sufficient permissions to access this page.');
  }

  global $plugin_url;
  global $options;
  global $display_json;

  require('snowball-options.php');
}

?>

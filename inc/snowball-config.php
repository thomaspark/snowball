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
      'supports' => array('title', 'author', 'comments', 'excerpt', 'publicize', 'thumbnail'),
      'rewrite' => array('slug' => 'snowball'),
      'capabilities' => array(
        'edit_post'          => 'snowball_edit_post',
        'read_post'          => 'snowball_read_post',
        'delete_post'        => 'snowball_delete_post',
        'edit_posts'         => 'snowball_edit_posts',
        'delete_posts'       => 'snowball_delete_posts',
        'edit_others_posts'  => 'snowball_edit_others_posts',
        'publish_posts'      => 'snowball_publish_posts',
        'read_private_posts' => 'snowball_read_private_posts',
        'create_posts'       => 'snowball_edit_posts',
      ),
      'map_meta_cap' => true,
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
 * Add Snowball capabilities to default roles
 */

function snowball_add_caps() {
  $role = get_role('administrator');
  if ($role) {
    $role->add_cap('snowball_edit_posts');
    $role->add_cap('snowball_delete_posts');
    $role->add_cap('snowball_edit_others_posts');
    $role->add_cap('snowball_publish_posts');
    $role->add_cap('snowball_read_private_posts');
  }

  $role = get_role('editor');
  if ($role) {
    $role->add_cap('snowball_edit_posts');
    $role->add_cap('snowball_delete_posts');
    $role->add_cap('snowball_edit_others_posts');
    $role->add_cap('snowball_publish_posts');
    $role->add_cap('snowball_read_private_posts');
  }

  $role = get_role('author');
  if ($role) {
    $role->add_cap('snowball_edit_posts');
    $role->add_cap('snowball_delete_posts');
    $role->add_cap('snowball_publish_posts');
  }

  $role = get_role('contributor');
  if ($role) {
    $role->add_cap('snowball_edit_posts');
    $role->add_cap('snowball_delete_posts');
  }
}
add_action('admin_init', 'snowball_add_caps');



/*
 * Remove editor
 */

function snowball_remove_editor() {
  remove_post_type_support('snowball', 'editor');

}
add_action('admin_init', 'snowball_remove_editor');



/*
 * Add Snowball metabox
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
  $postid = get_the_id();

  if ((get_post_type($postid) == 'snowball') && (is_single($postid) || get_option('page_on_front') == $postid)) {
    $article = snowball_get_article(get_the_id(), 0);
    $output = $article['head_html'];

    echo $output;
  }
}
add_action('wp_head', 'snowball_add_custom_code');



/*
 * Add snowball posts to front page, search, archives, etc
 */

function snowball_add_to_query($query) {
  if ($query->is_home() && $query->is_main_query()) {
    $post_types = $query->get('post_type'); 

    if(!is_array($post_types) && !empty($post_types)) {
      $post_types = explode(',', $post_types);
    }

    if(empty($post_types)) {
      $post_types = array();
      $post_types[] = 'post';
    }

    $post_types[] = 'snowball';

    $post_types = array_map('trim', $post_types);
    $post_types = array_filter($post_types);  

    $query->set('post_type', $post_types);
  }

  if(is_category() || is_tag() || is_author() && empty($query->query_vars['suppress_filters'])) {
    $post_types = $query->get('post_type'); 

    if(!is_array($post_types) && !empty($post_types)) {
      $post_types = explode(',', $post_types);
    }

    if(empty($post_types)) {
      $post_types = array();
      $post_types[] = 'post';
    }

    $post_types[] = 'snowball';

    $post_types = array_map('trim', $post_types);
    $post_types = array_filter($post_types);  

    $query->set('post_type', $post_types);
  }

  return $query;
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


?>

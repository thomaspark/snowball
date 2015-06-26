<?php

/*
 * Ajax calls
*/

function add_blocks_callback() {
  $nonce = $_POST['snowball_ajax_nonce'];

  if (!wp_verify_nonce($nonce, 'snowball_ajax_nonce')) {
    die('You do not have permissions to make those changes.');
  }
  $post_id = $_POST['post_id'];
  $block_data = $_POST['blocks'];
  $block_data = json_encode($block_data);
  $block_data = str_replace('\\\\"', '"', $block_data);
  $block_data = str_replace('\\\\\'', '\'', $block_data);
  $block_data = str_replace('\\\\', '\\', $block_data);
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
  $nonce = $_POST['snowball_ajax_nonce'];

  if (!wp_verify_nonce($nonce, 'snowball_ajax_nonce')) {
    die('You do not have permissions to make those changes.');
  }

  $post_id = $_POST['post_id'];
  $article_data = stripslashes($_POST['article']);
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

function get_block_json($post_id) {
  $row = snowball_get_blocks($post_id);
  $block_json = '[]';

  if (isset($row)) {
    $block_json = $row->blocks_value;
    if (!isset($block_json)) {
      $block_json = '[]';
    }
  }
  return $block_json;
}


/*
 * Database calls
 */

$snowball_db_version = '1.0';

function snowball_install_dbtable() {
  global $wpdb;
  global $snowball_db_version;
  global $path;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  $table_name_articles = $wpdb->prefix . 'snowball_articles';

  $charset_collate = $wpdb->get_charset_collate();

  $snowball_blocks_table = "CREATE TABLE $table_name (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    blocks_value longtext NOT NULL,
    PRIMARY KEY (ID)
 ) $charset_collate;";

  $snowball_articles_table = "CREATE TABLE $table_name_articles (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    article_html longtext NOT NULL,
    PRIMARY KEY (ID)
 ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($snowball_blocks_table);
  dbDelta($snowball_articles_table);

  add_option('snowball_db_version', $snowball_db_version);
}
register_activation_hook($path . 'snowball.php', 'snowball_install_dbtable');


// if successful return insert_id
// if fails return -1
function snowball_save_block($json_block, $post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_blocks';

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

  // This can be done better for Insert Failed
  if ($was_successful == false) {
    return -1;
  }
  return $was_successful;
}

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

  if ($was_successful == false) {
    return -1;
  }

  return $was_successful;
}

function snowball_get_blocks($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE post_id = %d', $post_id));

  return $row;
}

function snowball_get_article($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM '.$table_name.' WHERE post_id = %d', $post_id));

  if ($row) {
    $article = $row->article_html;

    if ($article != NULL) {
      return $article;
    }
  }

  return "<section></section>";
}

?>
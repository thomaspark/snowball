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
  $is_preview = $_POST['is_preview'];
  $article_data = stripslashes($_POST['article']);
  $insert_id = snowball_save_article($article_data, $post_id, $is_preview);
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
  $block_json = [];

  if (isset($row) && isset($row->blocks_value)) {
    $block_json = $row->blocks_value;
  }

  return $block_json;
}


/*
 * Database calls
 */

$snowball_db_version = '0.2.1';

function snowball_install_dbtable() {
  global $wpdb;
  global $snowball_db_version;
  global $path;

  $table_name = $wpdb->prefix . 'snowball_blocks';
  $table_name_articles = $wpdb->prefix . 'snowball_articles';

  $charset_collate = $wpdb->get_charset_collate();

/*  
 * Must have to 2 spaces between PRIMARY KEY and (id) or 
 * there will be mulitple primary key defined errors.
 * dbDelta doesn't seem to automatically remove
 * columns you may not want anymore
*/  
  $snowball_blocks_table = "CREATE TABLE $table_name (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    blocks_value longtext,
    PRIMARY KEY  (ID)
 ) $charset_collate;";

  $snowball_articles_table = "CREATE TABLE $table_name_articles (
    ID mediumint(9) NOT NULL AUTO_INCREMENT,
    time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    post_id bigint(20) NOT NULL,
    article_html longtext,
    preview_html longtext,
    PRIMARY KEY  (ID)
 ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($snowball_blocks_table);
  dbDelta($snowball_articles_table);

  add_option('snowball_db_version', $snowball_db_version);
}
register_activation_hook($path . 'snowball.php', 'snowball_install_dbtable');

/*
This may be needed later when more columns need to be changed
function remove_columns() {
  global $wpdb;

  $table_name_articles = $wpdb->prefix . 'snowball_articles';
  $wpdb->query( "ALTER TABLE $table_name_articles DROP COLUMN COLUMN_NAME" );
}
*/

function snowball_update_db_check() {
  global $snowball_db_version;

  if ( get_site_option( 'snowball_db_version' ) != $snowball_db_version ) {
      snowball_install_dbtable();
      //remove_columns();
  }
}
add_action( 'plugins_loaded', 'snowball_update_db_check' );

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

function snowball_save_article($article, $post_id, $is_preview) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';
  $article_column = 'article_html';
  if ($is_preview == "true") {
    $article_column = 'preview_html';
  }

  $was_updated = $wpdb->update(
    $table_name, 
    array(
      'time' => current_time('mysql'), 
      $article_column => $article,
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
        $article_column => $article,
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

function snowball_get_article($post_id, $is_preview) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM '.$table_name.' WHERE post_id = %d', $post_id));

  if ($row) {
    $article = $row->article_html;
    if ($is_preview == "true") {
      $article = $row->preview_html;
    }

    if ($article != NULL) {
      return $article;
    }
  }

  return "<section></section>";
}

function delete_snowball_data($post_id) {
  global $wpdb;

  $table_articles = $wpdb->prefix . 'snowball_articles';
  $table_blocks = $wpdb->prefix . 'snowball_blocks';

  $wpdb->delete( $table_articles, array('post_id' => $post_id), array('%d'));
  $wpdb->delete( $table_blocks, array('post_id' => $post_id), array('%d'));
}
add_action('delete_post', 'delete_snowball_data');

/*
 * Handle AJAX for mail
 */


function send_AJAX_mail_before_submit() {
  // check_ajax_referer('my_email_ajax_nonce');
  if (isset($_POST['action']) && $_POST['action'] == "mail_before_submit") {

    $to = $_POST['to'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    wp_mail($to, $subject, $message);
    echo 'email sent';
    die();
  }
  echo 'error';
  die();
}
add_action('wp_ajax_mail_before_submit', 'send_AJAX_mail_before_submit');
add_action('wp_ajax_nopriv_mail_before_submit', 'send_AJAX_mail_before_submit');

?>

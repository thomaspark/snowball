<?php

/*
 * Ajax calls
*/

function snowball_add_blocks_callback() {
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
add_action('wp_ajax_nopriv_add_blocks', 'snowball_add_blocks_callback');
add_action('wp_ajax_add_blocks', 'snowball_add_blocks_callback');

/*
 * Handler function for add-article
*/
function snowball_add_new_article_callback() {
  $nonce = $_POST['snowball_ajax_nonce'];

  if (!wp_verify_nonce($nonce, 'snowball_ajax_nonce')) {
    die('You do not have permissions to make those changes.');
  }

  $post_id = $_POST['post_id'];
  $is_preview = $_POST['is_preview'];
  $article = stripslashes($_POST['article']);
  $head_html = stripslashes($_POST['head_html']);
  $theme_option = stripslashes($_POST['theme_option']);
  $article_data = array('article' => $article,
                        'head_html' => $head_html,
                        'theme_option' => $theme_option
                         );
  $insert_id = snowball_save_article($article_data, $post_id, $is_preview);
  $success = "success";
  if ($insert_id == -1) {
    $success = "failed";
  }
  echo $success;
  wp_die();
}
add_action('wp_ajax_nopriv_add_article', 'snowball_add_new_article_callback');
add_action('wp_ajax_add_article', 'snowball_add_new_article_callback');

function snowball_get_block_json($post_id) {
  $row = snowball_get_blocks($post_id);
  $block_json = array();

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
    head_html longtext,
    theme_option tinyint(1) NOT NULL,
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

function snowball_save_article($article_data, $post_id, $is_preview) {
  global $wpdb;
  $table_name = $wpdb->prefix . 'snowball_articles';
  $article_column = 'article_html';
  $article = $article_data["article"];
  $head_html = $article_data['head_html'];
  $theme_column = 'theme_option';
  $theme_option = $article_data[$theme_column];

  // ensure $theme_option is only 0 or 1
  if (intval($theme_option) != 1) {
    $theme_option = 0;
  } else {
    $theme_option = 1;
  }

  $data = array(
      'time' => current_time('mysql'),
      'post_id' => $post_id,
    );
  $format = array(
      '%s',
      '%d',
      '%s',
    );

  if ($is_preview == "true") {
    $data['preview_html'] = $article;
  } else {
    $data['article_html'] = $article;
    $data['head_html'] = $head_html;
    $data[$theme_column] = $theme_option;
    $format[] = '%s';
    $format[] = '%d';
  }

  $was_updated = $wpdb->update(
    $table_name,
    $data,
    array('post_id' => $post_id), 
    $format,
    array('%d')
  );

  $was_successful = true;

  if ($was_updated === 0 || $was_updated == false) {
    $was_successful = $wpdb->insert(
      $table_name, 
      $data,
      $format
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
  $article_label = "article_html";
  $theme_label = "theme_option";

  $table_name = $wpdb->prefix . 'snowball_articles';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM ' . $table_name . ' WHERE post_id = %d', $post_id));
  $article_data = array(
                    $article_label => "<section></section>",
                    "head_html" => "",
                    $theme_label => 1,
                    'post_id' => $post_id
                  );
  if ($row) {
    $article = $row->article_html;
    $head_html = $row->head_html;
    $option = $row->theme_option;

    if ($is_preview == "true") {
      $article = $row->preview_html;
    }

    $article_data[$article_label] = $article;
    $article_data["head_html"] = $head_html;
    $article_data[$theme_label] = $option;
  }

  return $article_data;
}

function snowball_get_theme_option($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM '.$table_name.' WHERE post_id = %d', $post_id));
  $option = 1;
  if ($row) {
    $option = $row->theme_option;
  }

  return $option;
}

function snowball_get_custom_code($post_id) {
  global $wpdb;

  $table_name = $wpdb->prefix . 'snowball_articles';
  $row = $wpdb->get_row($wpdb->prepare('SELECT * FROM '.$table_name.' WHERE post_id = %d', $post_id));
  $option = '';
  if ($row) {
    $option = $row->head_html;
  }

  return $option;
}

function snowball_delete_post_data($post_id) {
  global $wpdb;

  $table_articles = $wpdb->prefix . 'snowball_articles';
  $table_blocks = $wpdb->prefix . 'snowball_blocks';

  $wpdb->delete($table_articles, array('post_id' => $post_id), array('%d'));
  $wpdb->delete($table_blocks, array('post_id' => $post_id), array('%d'));
}
add_action('delete_post', 'snowball_delete_post_data');

/*
 * Handle AJAX for mail
 */


function snowball_send_AJAX_mail_before_submit() {
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
add_action('wp_ajax_mail_before_submit', 'snowball_send_AJAX_mail_before_submit');
add_action('wp_ajax_nopriv_mail_before_submit', 'snowball_send_AJAX_mail_before_submit');

?>

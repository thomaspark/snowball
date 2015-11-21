<?php

global $article;
global $post;
global $option;
setup_postdata($post);

$snowball = array(
  'adminUrl'    => admin_url(),
  'blogname'    => get_bloginfo(),
  'blogurl'     => get_site_url(),
  'date'        => get_the_date(),
  'excerpt'     => get_the_excerpt(),
  'includesUrl' => includes_url(),
  'pluginsUrl'  => plugins_url('', __FILE__),
  'title'       => get_the_title(),
  'url'         => get_permalink()
);
$article = snowball_get_article($post->ID, $preview);
$option = $article["theme_option"];

if($option == 1) {
  require_once("inc/snowball-template-default.php");
} else {
  $upload_dir = wp_upload_dir();
  $file = $upload_dir['basedir'] . "/snowball/snowball-template-theme.php";

  if (file_exists($file)) {
    require_once($file);
  } else {
    require_once("inc/snowball-template-theme.php");
  }
}

?>

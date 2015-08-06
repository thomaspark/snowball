<?php

global $article;
global $post;
global $option;
setup_postdata($post);

$snowball = array(
  'adminUrl'    => admin_url(),
  'author'      => get_the_author(),
  'blogname'    => get_bloginfo(),
  'blogurl'     => get_site_url(),
  'date'        => get_the_date(),
  'excerpt'     => get_the_excerpt(),
  'pluginsUrl'  => plugins_url('snowball'),
  'title'       => get_the_title(),
  'url'         => get_permalink()
);
$article = snowball_get_article($post->ID, $preview);
$option = $article["theme_option"];
?>

<?php if($option == 1) : ?>
  <?php get_header(); ?>
<?php else: ?>
  <!DOCTYPE html>
    <html 
    <?php language_attributes(); ?>
     class="no-js">
    <head>
    <meta charset="<?php bloginfo('charset');?>">
    <meta name="viewport" content="width=device-width">
    <title>
    <?php wp_title('|', true, 'right') ?>
    </title>
    <link rel="profile" href="http://gmpg.org/xfn/11">
    <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
<?php endif; ?>

  <script>
  var snowball = <?php echo json_encode($snowball, JSON_PRETTY_PRINT); ?>;
  </script>
  <?php do_action("snowball_enqueue_stylesheets"); ?>
  <?php do_action("snowball_enqueue_scripts"); ?>
  <!--[if lt IE 9]>
  <script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/html5.js"></script>
  <![endif]-->

<?php if ($option == 0) : ?>
    </head>
    <body <?php body_class(); ?>>
<?php endif; ?>

  <article>

    <?php
      $preview = get_query_var( 'preview', "false" );
      echo do_shortcode($article["article_html"]);
    ?>

  </article>

  <?php
  if (comments_open() && get_comments_number()) {
    comments_template();
  }

  if ($option == 1) {
    get_footer();
  }
  ?>
  <?php do_action("snowball_enqueue_scripts_deferred"); ?>
</body>
</html>

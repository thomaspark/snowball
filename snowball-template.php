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
  'includesUrl' => includes_url(),
  'pluginsUrl'  => plugins_url('', __FILE__),
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
    <!--[if lt IE 9]>
    <script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/html5.js"></script>
    <![endif]-->
    <link rel="stylesheet" href="<?php echo $snowball['pluginsUrl'] ?>/lib/d3-geomap/css/d3.geomap.css">
    <link rel="stylesheet" href="<?php echo $snowball['pluginsUrl'] ?>/lib/fluidbox/css/fluidbox.css">
    <link rel="stylesheet" href="<?php echo $snowball['pluginsUrl'] ?>/lib/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="<?php echo $snowball['pluginsUrl'] ?>/styles/min/snowball.min.css">
    <link rel="stylesheet" href="<?php echo $snowball['pluginsUrl'] ?>/styles/min/snowball-theme.min.css">
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/scoper/scoper.js"></script>
  </head>
  <body <?php body_class(); ?>>
<?php endif; ?>

  <script>
  var snowball = <?php echo json_encode($snowball, JSON_PRETTY_PRINT); ?>;
  </script>

  <article>

    <?php
      $preview = get_query_var( 'preview', "false" );
      echo do_shortcode($article["article_html"]);
    ?>

  </article>

  <?php
    if (comments_open()) {
      comments_template();
    }
  ?>

  <?php if($option == 1) : ?>
    <?php get_footer(); ?>
  <?php else: ?>
    <script src="<?php echo $snowball['includesUrl'] ?>/js/jquery/jquery.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/d3/d3.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/d3-geomap/js/topojson.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/d3-geomap/vendor/d3.geomap.dependencies.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/d3-geomap/js/d3.geomap.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/lib/fluidbox/jquery.fluidbox.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/scripts/min/snowball.min.js"></script>
    <script src="<?php echo $snowball['pluginsUrl'] ?>/scripts/min/templates.min.js"></script>
    <?php wp_print_scripts(); ?>
  <?php endif; ?>

</body>
</html>

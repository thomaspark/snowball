<?php

global $post;
setup_postdata($post);

?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js">
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width">
  <title><?php wp_title('|', true, 'right'); ?></title>
  <link rel="profile" href="http://gmpg.org/xfn/11">
  <link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
  <?php do_action("snowball_enqueue_stylesheets"); ?>
  <!--[if lt IE 9]>
  <script src="<?php echo esc_url( get_template_directory_uri() ); ?>/js/html5.js"></script>
  <![endif]-->
</head>

<body <?php body_class(); ?>>
  <article>

    <?php 
      $post_id = $post->ID;
      echo do_shortcode(snowball_get_article($post_id));
    ?>

  </article>
  
  <script src="<?php echo includes_url('js/jquery/jquery.js'); ?>"></script>
  <?php do_action("snowball_enqueue_scripts"); ?>
</body>
</html>

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
  <script>
    var snowball = {
        adminUrl: "<?php echo admin_url() ?>"
      };
  </script>
  <?php do_action("snowball_enqueue_stylesheets"); ?>
  <?php do_action("snowball_enqueue_scripts"); ?>
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
</body>
</html>

<?php get_header(); ?>

<script>
  var snowball = <?php echo json_encode($snowball, JSON_PRETTY_PRINT); ?>;
</script>

<article>
  <?php
    $preview = get_query_var('preview', 'false');
    echo do_shortcode($article['article_html']);
  ?>
</article>

<?php
  if (comments_open()) {
    comments_template();
  }
?>

<?php get_footer(); ?>

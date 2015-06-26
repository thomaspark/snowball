<header class="snowball-toolbar fixedsticky">

<?php

  global $post;
  global $path;
  setup_postdata($post);

  $modules = array_filter(glob($path . 'modules/*'), 'is_dir');
  $blocks = array();
  $templates = array();
  $names = array();

  foreach ($modules as $module) {
    if (file_exists($module . '/admin.html') && file_exists($module . '/template.html') && file_exists($module . '/admin.json')) {
      $type = basename($module);
      $blocks[$type] = file_get_contents($module . '/admin.html');
      $templates[$type] = file_get_contents($module . '/template.html');

      $json = file_get_contents($module . '/admin.json');
      $meta = json_decode($json);
      $names[$type] = $meta->name;

      echo '<a id="add-' . $type . '" class="button button-secondary" data-type="' . $type .'">';
      echo '<div><i class="' . $meta->iconClasses . '"></i></div>';
      echo '<div>' . $meta->name . '</div>';
      echo '</a>';

      if (file_exists($module . '/admin.js')) {
        $plugins_path = plugins_url('snowball/modules/' . $type . '/admin.js');
        echo '<script defer src="' . $plugins_path . '"></script>';
      }
    }
  }

?>

</header>

<section class="snowball-main"></section>

<script type="text/javascript">
  var snowball = {
    blocks:       <?php echo json_encode($blocks); ?>,
    templates:    <?php echo json_encode($templates); ?>,
    names:        <?php echo json_encode($names); ?>,
    pluginsUrl:   <?php echo json_encode(plugins_url("snowball")); ?>,
    includesUrl:  <?php echo json_encode(includes_url()); ?>,
    savedblocks:  <?php $postid=(string)$post->ID; echo get_block_json($post->ID); ?>,
    author:       <?php echo json_encode(get_the_author()); ?>,
    date:         <?php echo json_encode(get_the_date()); ?>,
    title:        <?php echo json_encode(get_the_title()); ?>
  };
</script>

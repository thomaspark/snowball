<?php


?>

<header class="snowball-toolbar">

<?php

global $post;
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
<section class="snowball-main">


</section>
<script type="text/javascript">
    var snowball = {
      blocks: <?php echo json_encode($blocks); ?>,
      templates: <?php echo json_encode($templates); ?>,
      names: <?php echo json_encode($names); ?>,
      path: <?php echo json_encode(plugins_url("snowball")); ?>,
      author: <?php echo json_encode(get_the_author()); ?>,
      date: <?php echo json_encode(get_the_date()); ?>,
      title: <?php echo json_encode(get_the_title()); ?>
    };

    jQuery(document).ready(function() {
      snowball.savedblocks = <?php $postid=(string)$post->ID; echo get_block_json($post->ID); ?>;
      
      // iterates through all the json objects and add them to the frontend
      function populateSavedBlocks() {
        var savedBlocks = snowball.savedblocks;

        for (var b in savedBlocks) {
          var block = savedBlocks[b];
          var type = block["blockType"].toLowerCase();

          // need to delete so snowball.addBlock works properly
          delete block["blockType"];
          delete block["orderNumber"];

          snowball.addBlock(type, block);
        }
      }

      if (snowball.savedblocks != null && snowball.savedblocks != "") {
        populateSavedBlocks();
      }
    });
</script>


<?php

?>

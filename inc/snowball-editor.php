<?php


?>

<header class="snowball-toolbar">

<?php

$modules = array_filter(glob($path . 'modules/*'), 'is_dir');
$blocks = array();
$templates = array();

foreach ($modules as $module) {
  if (file_exists($module . '/admin.html') && file_exists($module . '/template.html')) {
    $type = basename($module);
    $blocks[$type] = file_get_contents($module . '/admin.html');
    $templates[$type] = file_get_contents($module . '/template.html');

    echo '<a id="add-' . $type . '" class="button button-secondary" data-type="' . $type .'">' . $type . '</a> ';

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
  var snowball = {};
  snowball.blocks = <?php echo json_encode($blocks); ?>;
  snowball.templates = <?php echo json_encode($templates); ?>;
  snowball.path = <?php echo json_encode(plugins_url("snowball")); ?>;
  jQuery(document).ready(function() {
    snowball.savedblocks = <?php global $post; $postid=(string)$post->ID; echo json_encode(get_block_json($post->ID)); ?>;
    
    function populateSavedBlocks(){
      var savedBlocks = snowball.savedblocks;
      for(var b in savedBlocks){
        var block = savedBlocks[b];
        var type = block["blockType"].toLowerCase();

        delete block["blockType"];
        delete block["orderNumber"];
        console.log(type);
        snowball.addBlock(type, block);
      }
    }

    populateSavedBlocks();    
  });
</script>


<?php

?>

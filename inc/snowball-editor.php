<?php

  global $post;
  global $path;
  setup_postdata($post);

  $modules = array_filter(glob($path . 'modules/*'), 'is_dir');
  $blocks = array();
  $templates = array();
  $names = array();

?>

<header class="snowball-toolbar fixedsticky">

<?php

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
<div class="modal-bg"></div>

<?php

  $snowball = array(
    'blocks'      => $blocks,
    'templates'   => $templates,
    'names'       => $names,
    'pluginsUrl'  => plugins_url("snowball"),
    'includesUrl' => includes_url(),
    'savedblocks' => get_block_json($post->ID),
    'author'      => get_the_author(),
    'date'        => get_the_date(),
    'title'       => get_the_title()
  );

  wp_localize_script('snowball-js', 'snowball', $snowball);

?>

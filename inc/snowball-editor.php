<?php

  global $post;
  global $path;
  setup_postdata($post);

  $modules = array_filter(glob($path . 'modules/*'), 'is_dir');
  $blocks = array();
  $templates = array();
  $names = array();
  $iconClasses = array();
  $order = array();
  $tags = array();

?>

<header id="snowball-toolbar" class="fixedsticky">
  <div class="tags">
    <span class="tag active" data-tag="all">All</span>
    <span class="tag" data-tag="basic">Basic</span>
    <span class="tag" data-tag="media">Media</span>
    <span class="tag" data-tag="social">Social</span>
    <span class="tag" data-tag="data">Data</span>
    <span class="tag" data-tag="meta">Meta</span>
  </div>

<?php
  global $path;

  foreach ($modules as $module) {
    if (file_exists($module . '/admin.html') && file_exists($module . '/template.html') && file_exists($module . '/admin.json')) {
      $type = basename($module);
      $blocks[$type] = file_get_contents($module . '/admin.html');
      $templates[$type] = file_get_contents($module . '/template.html');

      $json = file_get_contents($module . '/admin.json');
      $meta = json_decode($json);
      $order_json = file_get_contents($path . 'modules/module_order.json');

      $order = json_decode($order_json);
      ksort($order, SORT_NUMERIC);
      $names[$type] = $meta->name;
      $iconClasses[$type] = $meta->iconClasses;

      if (isset($meta->tags)) {
        $tags[$type] = $meta->tags;
      } else {
        $tags[$type] = "";
      }
    }
  }
?>

  <div class="buttons">

<?php

  $len = count($order);
  for($i = 0; $i < $len; $i++) {
    $type = strtolower($order[$i]);
    echo '<a id="add-' . $type . '" class="button button-secondary ' . $tags[$type] . '" data-type="' . $type .'">';
    echo '<div><i class="' . $iconClasses[$type] . '"></i></div>';
    echo '<div>' . $names[$type] . '</div>';
    echo '</a>';
  }

?>
  </div>

</header>

<section id="snowball-main"></section>
<div id="modal-bg"></div>

<?php

  $snowball = array(
    'blocks'      => $blocks,
    'templates'   => $templates,
    'names'       => $names,
    'adminUrl'    => admin_url(),
    'pluginsUrl'  => plugins_url("snowball"),
    'includesUrl' => includes_url(),
    'savedblocks' => get_block_json($post->ID),
    'author'      => get_the_author(),
    'blogname'    => get_bloginfo(),
    'blogurl'     => get_site_url(),
    'date'        => get_the_date(),
    'title'       => get_the_title(),
    'url'         => get_permalink(),
    'excerpt'     => get_the_excerpt()
  );

  wp_localize_script('snowball-js', 'snowball', $snowball);

?>

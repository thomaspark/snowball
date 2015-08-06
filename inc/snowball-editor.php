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
  <div class="settings">
    <span class="menu cog">
      <span class="menu-toggle"><i class="fa fa-cog"></i></span>
      <div class="menu-dropdown settings-dropdown">
        <span class="close">&times;</span>
        <div class="feedback" data-mood="negative">
          <p class="header">Article Settings</p>
          <label for="theme_option"><input type="checkbox" id="theme_option" <?php checked(snowball_get_theme_option($post->ID), 0); ?> />Use Snowball Theme</label>
        </div>
      </div>
    </span>
    <a class="button preview" data-click="#post-preview">Preview</a>
    <?php if (get_post_status() == 'draft'): ?>
      <a class="button draft disabled" data-click="#save-post">Save Draft</a>
    <?php elseif (get_post_status() == 'pending'): ?>
      <a class="button draft disabled" data-click="#save-post">Save Pending</a>
    <?php else: ?>
      <a class="button save disabled" data-click="#publish">Update</a>
    <?php endif; ?>
  </div>
  <div class="tags">
    <span class="tag active" data-tag="all">All</span>
    <span class="tag" data-tag="basic">Basic</span>
    <span class="tag" data-tag="media">Media</span>
    <span class="tag" data-tag="social">Social</span>
    <span class="tag" data-tag="data">Data</span>
    <span class="tag" data-tag="meta">Meta</span>
    <span class="menu happy">
      <span class="menu-toggle"><i class="fa fa-smile-o"></i></span>
      <div class="menu-dropdown">
        <span class="close">&times;</span>
        <div class="feedback" data-mood="positive">
          <p class="header">How did Snowball make you happy?</p>
          <textarea autofocus></textarea>
          <div><a class="button">Submit</a></div>
        </div>
      </div>
    </span>
    <span class="menu sad">
      <span class="menu-toggle"><i class="fa fa-frown-o"></i></span>
      <div class="menu-dropdown">
        <span class="close">&times;</span>
        <div class="feedback" data-mood="negative">
          <p class="header">How did Snowball make you sad, frustrated, or annoyed?</p>
          <textarea autofocus></textarea>
          <div><a class="button">Submit</a></div>
        </div>
      </div>
    </span>
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
    echo '<a id="add-' . $type . '" class="button button-secondary block-button ' . $tags[$type] . '" data-type="' . $type .'">';
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
    'id'          => $post->ID,
    'savedblocks' => get_block_json($post->ID),
    'author'      => get_the_author(),
    'authorLogin' => get_the_author_meta('user_login'),
    'userLogin'   => wp_get_current_user()->user_login,
    'blogname'    => get_bloginfo(),
    'blogurl'     => get_site_url(),
    'date'        => get_the_date(),
    'title'       => get_the_title(),
    'url'         => get_permalink(),
    'excerpt'     => get_the_excerpt()
  );

  wp_localize_script('snowball-js', 'snowball', $snowball);

?>

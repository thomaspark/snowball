<?php

  global $post;
  global $path;
  setup_postdata($post);

  $upload_dir = wp_upload_dir();

  $modules = array_filter(glob($path . 'modules/*'), 'is_dir');
  $customModules = array_filter(glob($upload_dir['basedir'] . '/snowball/modules/*'), 'is_dir');

  $blocks = array();
  $templates = array();
  $names = array();
  $iconClasses = array();
  $order = array();
  $tags = array();

?>

<header id="snowball-toolbar">
  <div class="settings">
    <span class="menu options cog">
      <span class="menu-toggle button"><i class="fa fa-cog"></i></span>
      <div class="dialog settings-dropdown">
        <span class="close">&times;</span>
        <div>
          <h2>Options</h2>
          <div>
            <label for="theme_option"><input type="checkbox" id="theme_option" <?php checked(snowball_get_theme_option($post->ID), 0); ?> /> Use Snowball theme</label>
          </div>
          <div>
            <p>Custom HTML head code</p>
            <textarea id="snowball-custom-code" autofocus><?php echo(snowball_get_custom_code($post->ID)); ?></textarea>
          </div>
        </div>
      </div>
    </span>
    <a class="button preview" data-click="#post-preview">Preview</a>
    <?php if (get_post_status() == 'draft'): ?>
      <a class="button draft" data-click="#save-post">Save Draft</a>
    <?php elseif (get_post_status() == 'pending'): ?>
      <a class="button draft" data-click="#save-post">Save Pending</a>
    <?php else: ?>
      <a class="button save" data-click="#publish">Update</a>
    <?php endif; ?>
  </div>
  <div class="tags">
    <span class="tag active" data-tag="basic">Basic</span>
    <span class="tag" data-tag="media">Media</span>
    <span class="tag" data-tag="social">Social</span>
    <span class="tag" data-tag="data">Data</span>
    <span class="tag" data-tag="meta">Meta</span>
    <?php 
      if (!empty($customModules)) {
        echo '<span class="tag" data-tag="custom">Custom</span>';
      }
    ?>
    <span class="tag" data-tag="all">All</span>
  </div>

<?php
  global $path;

  $order_json = file_get_contents($path . 'modules/module_order.json');
  $order = json_decode($order_json);
  ksort($order, SORT_NUMERIC);

  foreach ($modules as $module) {
    if (file_exists($module . '/admin.html') && file_exists($module . '/template.html') && file_exists($module . '/admin.json')) {
      $type = basename($module);
      $blocks[$type] = file_get_contents($module . '/admin.html');
      $templates[$type] = file_get_contents($module . '/template.html');

      $json = file_get_contents($module . '/admin.json');
      $meta = json_decode($json);

      $names[$type] = $meta->name;
      $iconClasses[$type] = $meta->iconClasses;
      if (isset($meta->tags)) {
        $tags[$type] = $meta->tags;
      } else {
        $tags[$type] = '';
      }
    }
  }

  foreach ($customModules as $module) {
    if (file_exists($module . '/admin.html') && file_exists($module . '/template.html') && file_exists($module . '/admin.json')) {
      $type = basename($module);
      $blocks[$type] = file_get_contents($module . '/admin.html');
      $templates[$type] = file_get_contents($module . '/template.html');

      $json = file_get_contents($module . '/admin.json');
      $meta = json_decode($json);

      $names[$type] = $meta->name;
      $iconClasses[$type] = $meta->iconClasses;
      $order[] = $type;

      if (isset($meta->tags)) {
        $tags[$type] = $meta->tags . ' custom';
      } else {
        $tags[$type] = '';
      }
    }
  }
?>

  <div class="buttons">

<?php

  $len = count($order);
  for ($i = 0; $i < $len; $i++) {
    $type = strtolower($order[$i]);
    $hidden = (strpos($tags[$type], "basic") !== false) ? "" : " hidden";

    echo '<a id="add-' . $type . '" class="button button-secondary block-button ' . $tags[$type] . $hidden . '" data-type="' . $type .'">';
    echo '<div><i class="' . $iconClasses[$type] . '"></i></div>';
    echo '<div>' . $names[$type] . '</div>';
    echo '</a>';
  }

?>
  </div>
  <div id="modal-bg"></div>
</header>

<section id="snowball-main"></section>

<?php

  // buffer author output and save to $author
  ob_start();

  if (function_exists('coauthors_posts_links')) {
    coauthors_posts_links();
  } else {
    the_author_posts_link();
  }

  $author = ob_get_contents();
  ob_end_clean();

  $snowball = array(
    'blocks'      => $blocks,
    'templates'   => $templates,
    'names'       => $names,
    'adminUrl'    => admin_url(),
    'includesUrl' => includes_url(),
    'pluginsUrl'  => plugins_url('', dirname(__FILE__)),
    'id'          => $post->ID,
    'savedblocks' => snowball_get_block_json($post->ID),
    'author'      => $author,
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

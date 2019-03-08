<?php

$plugin_path = dirname(__FILE__);

function snowball_add_stylesheets() {
  global $plugin_path;

  if (get_post_type(get_the_id()) == 'snowball') {
    wp_enqueue_style('geomap-css', plugins_url('lib/d3-geomap/css/d3.geomap.css', $plugin_path));
    wp_enqueue_style('fluidbox-css', plugins_url('lib/fluidbox/css/fluidbox.css', $plugin_path));
    wp_enqueue_style('fontawesome-css', plugins_url('lib/font-awesome/css/font-awesome.min.css', $plugin_path));
    wp_enqueue_style('snowball-css', plugins_url('styles/min/snowball.min.css', $plugin_path));
  }
}
add_action('wp_enqueue_scripts', 'snowball_add_stylesheets');

function snowball_add_scripts() {
  global $plugin_path;

  if (get_post_type(get_the_id()) == 'snowball') {
    wp_enqueue_script('scoper', plugins_url('lib/scoper/scoper.js', $plugin_path), '', '', false);
    wp_enqueue_script('d3-js', plugins_url('lib/d3/d3.min.js', $plugin_path), '', '', true);
    wp_enqueue_script('topojson-js', plugins_url('lib/d3-geomap/js/topojson.min.js', $plugin_path), array('d3-js'), '', true);
    wp_enqueue_script('d3-geomap-dependencies-js', plugins_url('lib/d3-geomap/vendor/d3.geomap.dependencies.min.js', $plugin_path), array('d3-js'), '', true);
    wp_enqueue_script('d3-geomap-js', plugins_url('lib/d3-geomap/js/d3.geomap.min.js', $plugin_path), array('d3-geomap-dependencies-js'), '', true);
    wp_enqueue_script('fluidbox-js', plugins_url('lib/fluidbox/jquery.fluidbox.min.js', $plugin_path), array('jquery'), '', true);
    wp_enqueue_script('snowball-js', plugins_url('scripts/min/snowball.min.js', $plugin_path), array('jquery'), '', true);
    wp_enqueue_script('snowball-templates-js', plugins_url('scripts/min/templates.min.js', $plugin_path), array('snowball-js'), '', true);
  }
}
add_action('wp_enqueue_scripts', 'snowball_add_scripts', 8);

function snowball_admin_add_scripts_and_stylesheets($hook) {
  global $plugin_path;

  if ((get_post_type(get_the_id()) == 'snowball') && (($hook == 'post.php') || ($hook == 'post-new.php'))) {
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_style('fontawesome-css', plugins_url('lib/font-awesome/css/font-awesome.min.css', $plugin_path));
    wp_enqueue_style('codemirror-css', plugins_url('lib/codemirror/lib/codemirror.min.css', $plugin_path));
    wp_enqueue_style('codemirror-theme-monokai', plugins_url('lib/codemirror/theme/monokai.min.css', $plugin_path));
    wp_enqueue_style('handsontable-css', plugins_url('lib/handsontable/handsontable.full.min.css', $plugin_path));
    wp_enqueue_style('snowball-css', plugins_url('styles/min/snowball-admin.min.css', $plugin_path));

    wp_enqueue_media();
    wp_enqueue_script('quicktags');
    wp_enqueue_script('codemirror-js', plugins_url('lib/codemirror/lib/codemirror.min.js', $plugin_path));
    wp_enqueue_script('codemirror-mode-css', plugins_url('lib/codemirror/mode/css.min.js', $plugin_path));
    wp_enqueue_script('codemirror-mode-xml', plugins_url('lib/codemirror/mode/xml.min.js', $plugin_path));
    wp_enqueue_script('codemirror-mode-htmlmixed', plugins_url('lib/codemirror/mode/htmlmixed.min.js', $plugin_path));
    wp_enqueue_script('codemirror-mode-js', plugins_url('lib/codemirror/mode/javascript.min.js', $plugin_path));
    wp_enqueue_script('handsontable-js', plugins_url('lib/handsontable/handsontable.full.min.js', $plugin_path), array(), '', true);
    wp_enqueue_script('snowball-js', plugins_url('scripts/min/snowball-admin.min.js', $plugin_path), array('jquery', 'jquery-ui-sortable', 'wp-color-picker'), '', true);
    wp_enqueue_script('snowball-admins-js', plugins_url('scripts/min/admins.min.js', $plugin_path), array('snowball-js'), '', true);
  }
}
add_action('admin_enqueue_scripts', 'snowball_admin_add_scripts_and_stylesheets');

function snowball_admin_ajax_script($hook) {
  global $plugin_path;

  if ((get_post_type(get_the_id()) == 'snowball') && (($hook == 'post.php') || ($hook == 'post-new.php'))) {
    global $post;
    global $path;

    wp_enqueue_script('ajax-script', plugins_url('/scripts/min/snowball-ajax.min.js', $plugin_path), array('jquery'));

    // in JavaScript, object properties are accessed as ajax_object.ajax_url, ajax_object.we_value
    wp_localize_script('ajax-script', 'ajax_object',
              array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'post_id' => $post->ID,
                'snowball_ajax_nonce' => wp_create_nonce('snowball_ajax_nonce')
              ));
  }
}
add_action('admin_enqueue_scripts', 'snowball_admin_ajax_script');

function snowball_options_scripts_and_styles($hook) {
  global $plugin_path;

  if ('settings_page_snowball' != $hook) {
    return;
  }

  wp_enqueue_script('snowball-options', plugins_url('scripts/min/snowball-options.min.js', $plugin_path));
}
add_action('admin_enqueue_scripts', 'snowball_options_scripts_and_styles');

?>

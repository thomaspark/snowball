<?php

function snowball_add_stylesheets() {
  echo '<link rel="stylesheet" href="' . plugins_url('snowball/lib/d3-geomap/css/d3.geomap.css') . '">';
  echo '<link rel="stylesheet" href="' . plugins_url('snowball/lib/fluidbox/css/fluidbox.css') . '">';
  echo '<link rel="stylesheet" href="' . plugins_url('snowball/lib/font-awesome/css/font-awesome.min.css') . '">';
  echo '<link rel="stylesheet" href="' . plugins_url('snowball/styles/min/snowball.min.css') . '">';
}
add_action('snowball_enqueue_stylesheets', 'snowball_add_stylesheets');

function snowball_add_scripts() {
  echo '<script src="' . includes_url('js/jquery/jquery.js') . '"></script>';
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5/d3.min.js"></script>';
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/topojson/1.6.19/topojson.min.js"></script>';
  echo '<script src="' . plugins_url('snowball/lib/d3-geomap/vendor/d3.geomap.dependencies.min.js') . '"></script>';
  echo '<script src="' . plugins_url('snowball/lib/d3-geomap/js/d3.geomap.min.js') . '"></script>';
  echo '<script src="' . plugins_url('snowball/lib/fluidbox/jquery.fluidbox.min.js') . '"></script>';
  echo '<script src="' . plugins_url('snowball/lib/scoper/scoper.js') . '"></script>';
  echo '<script src="' . plugins_url('snowball/scripts/min/snowball.min.js') . '"></script>';
  echo '<script src="' . plugins_url('snowball/scripts/min/templates.min.js') . '"></script>';
}
add_action('snowball_enqueue_scripts', 'snowball_add_scripts');

function snowball_admin_add_scripts_and_stylesheets($hook) {
  if ((get_post_type(get_the_id()) == 'snowball') && (($hook == 'post.php') || ($hook == 'post-new.php'))) {
    wp_enqueue_style('wp-color-picker');
    wp_enqueue_style('thickbox');
    wp_enqueue_style('fontawesome-css', plugins_url('snowball/lib/font-awesome/css/font-awesome.min.css'));
    wp_enqueue_style('codemirror-css', plugins_url('snowball/lib/codemirror/lib/codemirror.min.css'));
    wp_enqueue_style('codemirror-theme-monokai', plugins_url('snowball/lib/codemirror/theme/monokai.min.css'));
    wp_enqueue_style('fixedsticky-css', plugins_url('snowball/lib/fixed-sticky/fixedsticky.min.css'));
    wp_enqueue_style('handsontable-css', plugins_url('snowball/lib/handsontable/handsontable.full.min.css'));
    wp_enqueue_style('snowball-css', plugins_url('snowball/styles/min/snowball-admin.min.css'));

    wp_enqueue_script('media-upload');
    wp_enqueue_script('thickbox');
    wp_enqueue_script('codemirror-js', plugins_url('snowball/lib/codemirror/lib/codemirror.min.js'));
    wp_enqueue_script('codemirror-mode-css', plugins_url('snowball/lib/codemirror/mode/css.min.js'));
    wp_enqueue_script('codemirror-mode-xml', plugins_url('snowball/lib/codemirror/mode/xml.min.js'));
    wp_enqueue_script('fixedsticky-js', plugins_url('snowball/lib/fixed-sticky/fixedsticky.min.js'), array('jquery'), '', true);
    wp_enqueue_script('handsontable-js', plugins_url('snowball/lib/handsontable/handsontable.full.min.js'), array(), '', true);
    wp_enqueue_script('snowball-js', plugins_url('snowball/scripts/min/snowball-admin.min.js'), array('jquery', 'jquery-ui-sortable', 'wp-color-picker'), '', true);
    wp_enqueue_script('admins-js', plugins_url('snowball/scripts/min/admins.min.js'), array('jquery'), '', true);
  }
}
add_action('admin_enqueue_scripts', 'snowball_admin_add_scripts_and_stylesheets');

function snowball_admin_ajax_script($hook) {
  if ((get_post_type(get_the_id()) == 'snowball') && (($hook == 'post.php') || ($hook == 'post-new.php'))) {
    global $post;
    global $path;

    wp_enqueue_script('ajax-script', plugins_url('/scripts/min/snowball-ajax.min.js', dirname(__FILE__)), array('jquery'));

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

?>

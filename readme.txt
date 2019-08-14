=== Plugin Name ===
Contributors: thomaspark, sukrit.chhabra, brianleedev, andiiicat, scienceinpython
Tags: snowball, journalism, news, blog, article, longform, modern, immersive, parallax, data, visualization, graphs, charts, modules, custom, code editor, computing education
Requires at least: 3.0.1
Tested up to: 5.2.2
Stable tag: 0.4.20
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Snowball makes it easy for journalists and bloggers to create immersive articles using multimedia, data visualizations, and interactive widgets.

== Description ==

Snowball is a powerful plugin that makes it easy for journalists and bloggers to create modern, immersive articles as seen by world-class news organizations.

Snowball's user-friendly interface allows you to build your article one content block at a time. Snowball support many different types of content including text, images, videos, data visualizations, and interactive widgets.

For each block, set your own content and style choices. Advanced users can customize a block even further using the built-in code editor to inspect and modify its underlying HTML and CSS code.

Snowball is developed and maintained by the [openHTML research team](http://openhtml.org) at Drexel University, with the goal of broadening participation and empowering people to be more expressive on the web.

Currently supported modules:

* Basic: Text, Splash, Sidenote, Pullquote, HTML, Columns, Table
* Media: Image, Image Comparison Slider, YouTube, Vimeo, SoundCloud, Google Maps
* Social: Twitter, Vine
* Data: Bar Graph, Scatterplot, Choropleth
* Meta: Table of Contents, Contact Form, Share Buttons

For more information, visit our homepage at [snowball.openhtml.org](http://snowball.openhtml.org/).

== Installation ==

Automatic installation (recommended):

1. In the WordPress admin interface, go to `Plugins > Add Plugins`.
2. Search for Snowball plugin.
3. In the search result, click the "Install Now" button for Snowball plugin.
4. After the plugin has been installed, click "Activate Plugin".

Manual installation:

1. Download the `snowball.zip` plugin file.
2. Upload `snowball.zip` through the WordPress admin interface at `Plugins > Add New > Upload Plugin`.
3. After the plugin has been installed, click "Activate Plugin".

== Frequently Asked Questions ==

= What shortcodes are available? =

Within a Snowball article, you can use the following shortcodes to add dynamic text: [title], [author], [date], [url], [blogname], [blogurl].

= How can I add custom styles to a block? =

To apply your own customizations to a block, click the "</>" code button. This will open the block with the code view. In the CSS panel in the bottom right, scroll down and add your own CSS. This CSS will only be applied to this block, not any other blocks in the article.

= How can I customize all of the blocks in an article at once? =

Click the "gear" settings button in the top right of the article. A "Custom HTML head code" field is available where you can add CSS that's applied to the whole article. Be sure to wrap your CSS in style tags. You can also use this field to add web fonts and scripts to the article.

= How can I use Snowball's minimal theme? =

By default, Snowball articles use the active theme of your WordPress site. However, Snowball works best with the minimal, one-column theme that's included in the plugin. To activate it, click the "gear" settings button in the top right of the article, check the "Use Snowball theme" option, and save the article.

= How do I customize the permalink slug for Snowball articles to something other than /snowball/? =

Use a plugin like [Simple Post Types Permalinks](https://wordpress.org/plugins/simple-post-type-permalinks/) to modify the default slug.

= How do I add items to a Table of Contents block? =

The Table of Contents block is based on all of the HTML IDs used in an article. You can add an ID to an HTML element within a Text or HTML block, as well as text fields like an Image block's caption, in order to have them listed in a table of contents.

= Can I use my own template for Snowball articles? =

Yes, administrators can create a custom template where they can add their own headers, footers, stylesheets, and scripts. For information on how the template should be formatted and where it should be placed, read the doc [Using a Custom Template](https://github.com/thomaspark/snowball/wiki/Using-a-Custom-Template).

= Can I define my own modules? =

Yes, administrators can create custom modules, which are a bundle of HTML and JavaScript files. For information on how custom modules should be formatted and where they should be placed, read the doc [Creating a Custom Module](https://github.com/thomaspark/snowball/wiki/Creating-a-Custom-Module).

= Who is behind Snowball? =

Snowball is developed and maintained by the [openHTML research team](http://openhtml.org) at Drexel University.

== Screenshots ==

1. Create modern, immersive articles using Snowball plugin.

2. Add sections to your article one block at a time.

3. Many different content types are supported including data visualizations like choropleths. They include a spreadsheet interface for easy data entry.

4. Interactive widgets such as image comparison sliders are also supported by Snowball.

5. Open Snowball's code editor to inspect a block and customize it with your own CSS.

== Changelog ==

= 0.4.20 =
* Remove data logger

= 0.4.19 =
* Include Snowball articles in author archives

= 0.4.18 =
* Remove fixed-sticky code

= 0.4.17 =
* Add field for Google Maps API key
* Remove fixed-sticky polyfill
* Prevent Snowball articles from being included in secondary queries

= 0.4.16 =
* Update data logger

= 0.4.15 =
* Fix fatal error with PHP 7.1

= 0.4.14 =
* Support Jetpack publicize feature
* Fix bug for including Snowball articles in category and tag archives that excludes other post types

= 0.4.13 =
* Handle invalid urls for Google Maps, Vimeo, Vine, and YouTube modules
* Fix Vine module not updating url
* Debounce change events that lead to network calls on all modules

= 0.4.12 =
* Fix Quicktags not getting loaded properly
* Fix Parse endpoint

= 0.4.11 =
* Add a darken background setting to Splash blocks

= 0.4.10 =
* Fix Google Maps module to support regional domains

= 0.4.9 =
* Fix image uploader in image, splash, and image slider modules to work for all languages

= 0.4.8 =
* Load Twitter script only for Twitter blocks

= 0.4.7 =
* Add new width options for text blocks
* Fix height bug on image sliders

= 0.4.6 =
* Include Snowball articles in category and tag archives
* Fix selector syntax for smooth scrolling anchor links

= 0.4.5 =
* Fix table rendering on Firefox

= 0.4.4 =
* Set scoper spans to inline display to reset misbehaving theme styles

= 0.4.3 =
* Check if default roles have been deleted

= 0.4.2 =
* Add capabilities for Snowball post types
* Add conditional check for custom head code
* Remove feedback buttons
* Log events related to custom HTML or CSS code for research purposes

= 0.4.1 =
* Fix race condition that prevented saving articles in Firefox for Windows

= 0.4.0 =
* Add support custom templates: https://github.com/thomaspark/snowball/wiki/Using-a-Custom-Template
* Add support for categories and tags
* Restore default metaboxes such as author, discussion
* Restore ability to have 2-column admin view
* For columns module, tweak tab layout
* Remove blank settings page

= 0.3.1 =
* Include Snowball articles on front page, search, and archives
* Add compatibility with Co-Authors Plus plugin through [author] shortcode
* For text module, properly wrap last paragraph in p tags, interpret new lines as br tags, and format HTML code

= 0.3.0 =
* Option to add custom HTML head code that applies styles and scripts to whole article
* Option to export graph blocks as SVG
* Set correct position for fixed toolbar after other admin widgets load
* Add support for excerpts and features images
* For splash module, crop background image from center instead of top left
* For splash module, set default background and text colors to white and black respectively

= 0.2.5 =
* Change custom module directory from wp-content/plugins/snowball-custom-modules/ to wp-content/uploads/snowball/modules

= 0.2.4 =
* Support for custom modules
* Namespace generic function names

= 0.2.3 =
* Initial release of Snowball to the WordPress plugin directory

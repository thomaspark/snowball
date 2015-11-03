=== Plugin Name ===
Contributors: thomaspark, sukrit.chhabra, brianleedev
Tags: snowball, journalism, news, blog, article, modern, immersive, parallax, data, visualization, graphs, charts, modules, custom, code editor
Requires at least: 3.0.1
Tested up to: 4.3.1
Stable tag: 0.3.0
License: GPLv2
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Snowball makes it easy for journalists and bloggers to create immersive articles using multimedia, data visualizations, and interactive widgets.

== Description ==

Snowball is a powerful plugin that makes it easy for journalists and bloggers to create modern, immersive articles as seen by world-class news organizations. Snowball modules support many different types of content including text, images, videos, data visualizations, and interactive widgets.

Snowball's block-based interface is user-friendly and allows you to start creating with ease. Build your article one block at a time by creating a block from a particular module. Then set your own content and style choices for that block. Advanced users can customize even further using the built-in code editor to inspect and modify the underlying HTML and CSS code of a block.

Snowball is developed and maintained by the [openHTML research team](http://openhtml.org) at Drexel University, with the goal of broadening participation and empowering people to be more expressive on the web.

Currently supported modules:

* Text
* Image
* Image Slider
* Splash Page
* Sidenote
* Pullquote
* HTML code
* Columns
* Table
* Bar Graph
* Scatterplot
* Choropleth
* Twitter
* YouTube
* Vimeo
* Vine
* SoundCloud
* Google Maps
* Table of Contents
* Contact Form
* Share Buttons

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

= Who is behind Snowball? =

Snowball is developed and maintained by the [openHTML research team](http://openhtml.org) at Drexel University.

= How is Snowball used for research? =

The openHTML team collects usage metadata to understand how people are using Snowball, including the types of modules that are used, the number of modules used, which modules the code editor is activated for, and site and author metadata. No content or personally identifiable information is collected.

This research has been approved by the Institutional Review Board of Drexel University's Office of Research.

== Screenshots ==

1. Create modern, immersive articles using Snowball plugin.

2. Add sections to your article one block at a time.

3. Many different content types are supported including data visualizations like choropleths. They include a spreadsheet interface for easy data entry.

4. Interactive widgets such as image comparison sliders are also supported by Snowball.

5. Open Snowball's code editor to inspect a block and customize it with your own CSS.

== Changelog ==

= 0.3.0 =
* Option to add custom HTML head code that applies styles and scripts to whole article 
* Option to export graph blocks as SVG
* Set correct position for fixed toolbar after other admin widgets load
* Add support for excerpts and features images
* For Splash module, crop background image from center instead of top left
* For Splash module, set default background and text colors to white and black respectively 

= 0.2.5 =
* Change custom module directory from wp-content/plugins/snowball-custom-modules/ to wp-content/uploads/snowball/modules

= 0.2.4 =
* Support for custom modules
* Namespace generic function names

= 0.2.3 =
* Initial release of Snowball to the WordPress plugin directory

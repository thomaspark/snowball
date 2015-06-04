(function($) {

  snowball.addBlock = function(type, data) {
    var blockCode = snowball.blocks[type];
    var name = $(blockCode).data("name");

    var block =  $("<div class='snowball-block'>" +
                      "<div class='snowball-gui'>" +
                          "<div class='snowball-tinker'>" +
                            "<div>" +
                              "<div class='snowball-title'></div>" +
                              "<div class='snowball-delete'>&times;</div>" +
                            "</div>" +
                          "</div>" +
                          "<iframe class='snowball-preview'></iframe>" +
                        "</div>" +
                        "<div class='snowball-code'>" +
                          "<div class='snowball-html'></div>" +
                          "<div class='snowball-css'></div>" +
                          "<div class='snowball-js'></div>" +
                        "</div>" +
                      "</div>");

    block
      .addClass("snowball-block-" + type).data("type", type)
      .find(".snowball-title").text(name).end()
      .find(".snowball-tinker").append(blockCode).end();

    if (data) {
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          var selector = "[data-target='" + key + "']";
          var input = block.find(selector);
          var value = data[key];

          if (input.is(":radio")) {
            input.filter("[value='" +  value + "']").prop("checked", true);
          } else if (input.is(":checkbox")) {
            if (value == "true") {
              input.prop("checked", true);
            } else {
              input.prop("checked", false);
            }
          } else {
            input.val(value);
          }
        }
      }
    }

    block
      .find(".snowball-preview").load(function() {
        renderPreview(block);
      }).end()
      .find(".wp-color-picker").wpColorPicker({
        change: debounce(function (event) {
          $(this)
            .trigger("change")
            .attr("value", $(this).val());
        }, 250)
      }).end()
      .appendTo(".snowball-main")
      .trigger("open");
  };

  $(".snowball-toolbar").on("click", ".button", function() {
    var type = $(this).data("type");
    snowball.addBlock(type);
  });

  $(".snowball-main")
    .on("render", ".snowball-block", function() {
      renderPreview($(this));
    })
    .on("mousedown", ".snowball-block", function(e) {
      $(".snowball-main").height($(".snowball-main").height());
    })
    .on("mouseup", ".snowball-block", function(e) {
      $(".snowball-main").height("auto");
    })
    .on("keyup", "input, textarea", debounce(function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
    }, 250))
    .on("change", "input, textarea", function() {
      var block = $(this).parents(".snowball-block");
      renderPreview(block);
    })
    .on("click", ".snowball-delete", function() {
      var block = $(this).parents(".snowball-block");
      confirmDelete(block);
    })
    .sortable({
      "axis": "y",
      "containment": ".snowball-main",
      "cursor": "move"
    });

  $(window).resize(debounce(function() {
    zoomPreview();
  }, 250));

  $("#collapse-menu").click(debounce(function() {
    zoomPreview();
  }, 250));

  function confirmDelete(block) {
    var result = confirm("Are you sure you want to delete this block?");
    if (result) {
      block
        .trigger("close")
        .remove();
    }
  }

  function renderPreview(block) {
    var type = block.data("type");
    var selector = "input[type='text'][data-target], input[type='range'][data-target], input[type='hidden'][data-target], input[type='radio'][data-target]:checked, input[type='checkbox'][data-target]:checked, textarea[data-target]";
    var fields = block.find(selector);
    var preview = block.find(".snowball-preview").contents();
    var html = snowball.templates[type];

    var path = snowball.path;
    var css = path + "/styles/snowball.css";
    var js = path + "/scripts/snowball.js";
    var cssPreview = path + "/styles/snowball-preview.css";
    var stylesheet = $("<link/>").attr({"rel": "stylesheet", "href": css});
    var stylesheetPreview = $("<link/>").attr({"rel": "stylesheet", "href": cssPreview});
    var script = $("<script/>").attr("src", js);

    fields.each(function(index, element) {
      var target = $(this).data("target");
      var value = $(this).val();

      if ($(this).is("textarea")) {
        // For textareas, replace \n\n with <p>
        value = value.replace(/(.+?)\n{2,}/g,'<p>$1</p>');
      }

      html = html.replace("{{" + target + "}}", value);
    });

    html = html.replace("[author]", snowball.author)
               .replace("[date]", snowball.date);

    if (snowball.title) {
      html = html.replace("[title]", snowball.title);
    }

    if (preview.find("head").is(":empty")) {
      preview.find("head").append(stylesheet, stylesheetPreview, script).end();
    }

    preview.find("body").html(html);

    zoomPreview(block);
  }

  function zoomPreview(block) {
    var width = $(".snowball-preview").first().width();
    var zoom = width / 600;

    if (block) {
      block.find(".snowball-preview").contents().find("html").css("transform", "scale(" + zoom + ")");
    } else {
      $(".snowball-preview").contents().find("html").css("transform", "scale(" + zoom + ")");
    }
  }

  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

})(jQuery);

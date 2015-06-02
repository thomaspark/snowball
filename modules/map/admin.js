(function($) {

  $(".snowball-main").on("open", ".snowball-block-map", function() {
    var zoom = $(this).find(".zoom").val();
    $(this).find(".zoom-output").text(zoom);
  });

  $(".snowball-main").on("change, keyup", ".snowball-block-map .map-user", function() {
    var block = $(this).parents(".snowball-block-map");
    var url = $(this).val();
    var props = mapParse(url);

    block.find("[data-target='lat']").val(props.lat);
    block.find("[data-target='lon']").val(props.lon);
    block.find("[data-target='zoom']").val(props.zoom);
    block.find("[data-target='maptype'][value='" + props.maptype +  "']").prop("checked", true);

    block.trigger("render");
  });

  $(".snowball-main").on("input change", ".snowball-block-map .zoom", function() {
    var block = $(this).parents(".snowball-block-map");
    var zoom = $(this).val();

    block.find(".zoom-output").text(zoom);
  });

  function mapParse(url) {
    var re = /google.com\/maps\/.*@(-?\d+.\d+),(-?\d+.\d+),(\d+)([mz])/;
    var matches = re.exec(url);

    if (matches !== null) {
      var zoom = matches[3];
      var maptype = matches[4];
      var size = "600x400";

      if (maptype === "m") {
        maptype = "satellite";
        zoom = mToZ(zoom);
      } else {
        maptype = "roadmap";
      }

      return {
        "lat": matches[1],
        "lon": matches[2],
        "maptype": maptype,
        "zoom": zoom,
        "size": size
      };
    }
  }

  function mToZ(m) {
    var c = 56819712;
    var z = c / m;

    z = Math.round(1 + (Math.log(z) / Math.LN2));

    return z;
  }

})(jQuery);

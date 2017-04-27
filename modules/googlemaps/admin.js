(function($) {

  $("#snowball-main").on("open", ".snowball-block-googlemaps", function() {
    var zoom = $(this).find(".zoom").val();
    $(this).find(".zoom-output").text(zoom);
  });

  $("#snowball-main").on("change keyup", ".snowball-block-googlemaps .map-user", debounce(function() {
    var block = $(this).closest(".snowball-block-googlemaps");
    var url = $(this).val();
    var props = mapParse(url);

    var lat = props && props.lat ? props.lat : '39.9581888';
    var lon = props && props.lon ? props.lon : '-75.1887621';
    var zoom = props && props.zoom ? props.zoom : '14';
    var maptype = props && props.maptype ? props.maptype : 'roadmap';

    block.find("[data-target='lat']").val(lat);
    block.find("[data-target='lon']").val(lon);
    block.find("[data-target='zoom']").val(zoom);
    block.find(".zoom-output").text(zoom);
    block.find("[data-target='maptype'][value='" + maptype +  "']").prop("checked", true);

    block.trigger("render");
  }, 250));

  $("#snowball-main").on("input change", ".snowball-block-googlemaps .zoom", debounce(function() {
    var block = $(this).closest(".snowball-block-googlemaps");
    var zoom = $(this).val();

    block.find(".zoom-output").text(zoom);
  }, 50));

  function mapParse(url) {
    var re = /google.[a-z.]+\/maps\/.*@(-?\d+.\d+),(-?\d+.\d+),(\d+)([mz])/;
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
    var z = c / parseInt(m, 10);

    z = Math.round(1 + (Math.log(z) / Math.LN2));

    return z;
  }

})(jQuery);

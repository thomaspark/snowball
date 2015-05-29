(function($) {

	$(document).ready(function() {
		console.log("loaded script");
	
		/*$(".snowball-main").on("open", ".snowball-block-map", function() {
	  		var currentBlock = $(this);
	  		loadDefaults(currentBlock);
	  	});		
		*/

		/*Calculates log of val using base as 2*/
		function ln(val) {
			return Math.log(val) / Math.log(2);
		}

		/*Converting a Satellite Image zoom value to a Roadmap Image Zoom value; i.e., .........m -> ..z */
		function convertZoom(currentZoomValue) {
			var unitValue = 56819712;							//If this was zoom on sat img, the zoom on roadmap would be 1z
			var userValue = parseInt(currentZoomValue, 10);		//Converting string to int
			var raisedValue = unitValue/userValue;
			var loggedValue = ln(raisedValue);					//Calcualting natural log
			var zValue = 1 + loggedValue;
			zValue = Math.round(zValue);

			return zValue;
		}

		/*function loadDefaults(block) {
			var field = $(block).find(".user-entered-map-url");
			var imgURL = $(field).val();
			console.log("-------this blocks imgUrl: "+imgURL);
			console.log("img url: "+ imgURL);
			var parts;
			var defaultZoom;
			var defaultMapType;

			if(imgURL.indexOf("@") >=0 ) {
				if(imgURL.indexOf("/data=") >= 0) {
					parts = imgURL.split("@")[1].split("/data=")[0];
				} else {
					parts = imgURL.split("@")[1];
				}
			}
			
			parts = parts.split(",")[2];

			console.log("parts.split(",")[2]; should give 16m. \ngives: " + parts);

			if (parts.indexOf("z") >= 0) {
				defaultMapType = "roadmap";
				defaultZoom = parts.split("z")[0];
			} else {
				defaultMapType = "satellite";
				var tempZoom = parts.split("m")[0];
				defaultZoom = convertZoom(tempZoom);
				//console.log("Final defaultZoom: "+defaultZoom);
			}
			
			console.log("defaultZoom: " + defaultZoom);
			console.log("defaultMapType: " + defaultMapType);

			activateMapTypeRadioButton(field, defaultMapType);

			$(block).find(".zoomLevel").val(defaultZoom);			//loading default value to slider
			$(block).find(".zoomLevelOutput").text(defaultZoom);	//loading default value to field beside slider
		}*/

		function activateMapTypeRadioButton(urlField, mapTypeToBeActivated) {
			var formInputs = $(urlField).parent().siblings(".mapTypeForm").find("input");
			$(formInputs).each(function(index, el) {
				if($(this).val() == mapTypeToBeActivated) {
					$(this).prop({
						"checked": true,
					})
				}
			});			
		}

		function assignZoomSliderValue(urlField, zoomValue) {
			var formInputs = $(urlField).parent().siblings(".map-zoom-form").find(".zoomLevel");
			formInputs.val(zoomValue);
			formInputs.siblings(".zoomLevelOutput").text(zoomValue);

		}


		function parseUrl(urlInputField, newMapType, newZoom) {

			console.log("new map type recieved by parse function: " + newMapType);
			console.log("new zoom recieved by parse function: " + newZoom);
			var userEnteredMapUrl = $(urlInputField).val();
				
			console.log("urlEntered: "+ userEnteredMapUrl);
			if (userEnteredMapUrl.indexOf("@") >= 0) {
				var urlElements;

				if(userEnteredMapUrl.indexOf("/data=") >= 0) {
					urlElements = userEnteredMapUrl.split("@")[1].split("/data=")[0].split(",");
				}	else {
					urlElements = userEnteredMapUrl.split("@")[1].split(",");
				}


				var latitude = urlElements[0];
				var longitude = urlElements[1];
				var mapType;
				var mapSize="600x400";
				var zoom;
				
				var apiKey = "AIzaSyCIYiEC2rnfnoioDXXwt17q4OnvSZUYga4";

				if (urlElements[2].indexOf("z") >= 0) {
					mapType = "roadmap";
					zoom = urlElements[2].split("z")[0];
				} else {
					mapType = "satellite";
					var tempZoom = urlElements[2].split("m")[0];
					zoom = convertZoom(tempZoom);
					//console.log("Final zoom: "+zoom);
				}

				/*Checking if any Map TYPE was set using radio buttons*/
				if(newMapType != "") {
					mapType = newMapType;
					//newMapType = "";
				}

				/*Checking if a Zoom Level was set using Slider*/
				if(newZoom != 0) {
					zoom = newZoom;
					//newZoom = 0;
				}


				var embedUrl = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=" + zoom + "&size=" + mapSize+ "&maptype=" + mapType + "&output=embed";
				$(urlInputField).siblings(".embedUrl").val(embedUrl);
				activateMapTypeRadioButton(urlInputField, mapType);
				assignZoomSliderValue(urlInputField, zoom);
			}
		}

		$(".snowball-main").on("open", ".snowball-block-map", function() {	//new open event starts here; ends at line 179
			var block = $(this);
			var defaultInputField = block.find(".user-entered-map-url");
			console.log("------------------------------------------------open parse");
			parseUrl(defaultInputField, "", 0);

			/*What about the blocks that are already on the page? where to we load them*/
			
			$(".user-entered-map-url").each(function(index) {
				console.log("page loaded");
				var newlySetMapType = "";
				var newlySetZoom = 0;
				var outerThis = $(this);
				var outerThisParent = outerThis.parent();
				
				/*Getting Map Type set by user*/
				outerThisParent.siblings(".mapTypeForm").find("input").on("click", function() {
					console.log("Registered key up in index: "+ index + " with " + $(this).val());
					newlySetMapType = $(this).val();
					outerThis.trigger("keyup");

					console.log('maptype calling parse');
				});

				outerThisParent.siblings(".map-zoom-form").find("input").on("mouseup", function() {
					console.log('************************************************************************************');
					console.log("Registered key up in index: "+ index + " with " + $(this).val());
					console.log("Registered key up in TYPE: " + $(this).val());
					newlySetZoom = $(this).val();
					outerThis.trigger("keyup");

					console.log('zoom calling parse');
				});

				/*DO NOT UNCOMMENT
				.*/
				/*outerThisParent.siblings(".map-zoom-form").find("input").on("mouseup", function() {
					console.log('**********-------------mouseup was triggered');
					newlySetZoom = $(this).val();
					outerThis.parent().siblings(".map-zoom-form").find("span").text(newlySetZoom);
					console.log("slider value: "+ newlySetZoom);
					console.log("userEnteredMapUrl right now: " + $(".user-entered-map-url").val());
					console.log('**************-------------------------------------------zoom level calling parse');
					outerThis.trigger("keyup");
				});*/

				outerThis.on("keyup", function() {
					console.log("-------------------------------------------keyup trigger calling parse function");
					parseUrl(outerThis, newlySetMapType, newlySetZoom);
				});
			});
		});//new open event ends here; starts at line 143
	});
	
})(jQuery);
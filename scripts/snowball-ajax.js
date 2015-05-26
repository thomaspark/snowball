jQuery(document).ready(function($) {

	// We can also pass the url value separately from ajaxurl for front end AJAX implementations
	$("#publish").click(function() {
		var data = {
			'action': 'add-blocks',		// this is needed to know which callback to use
			'': '',
		};
		$.post(ajax_object.ajax_url, data, function(response) {
	
		});
	});
	$("#add-text").click(function() {
		retrieveFields();
	});
	// TODO retrieve the data from the blocks
	function retrieveFields(){
		var blocks = [];
		$(".snowball-main form").each(function(index, element){
			parseBlock(element);
			
		});

		function parseBlock(blockform) {
			var type = $(blockform).attr("data-name");
			//var userfields = $(blockform).find("input[data-target], textarea[data-target]");

			switch(type){
				case "Text":
					parseTextBlock(blockform);
					break;
				case "Splash":
					parseSplashBlock(blockform);
					break;
				default:
					console.log("block don't work");
					break;
			}
		}
	
		// tag a non jquery object tag
		function getTagValue(tag) {
			return $(tag).val();
		}

		function parseTextBlock(element){
			var inputs = $(element).find("input[data-target], textarea[data-target]");
			
			var block = {
				blockType: 1,
				title: getTagValue(inputs[0]),
				content: getTagValue(inputs[1])
			};
			alert("Text " + block.title + " " + block.content);

			return block;
		}

		function parseSplashBlock(element){
			var inputs = $(element).find("input[data-target], textarea[data-target]");
			
			var bgcolor = $(inputs[1]).parent().prev(".wp-color-result").css("background-color");
			var textcolor = $(inputs[2]).parent().prev(".wp-color-result").css("background-color");
			console.log($(inputs[1]).parent().prev());
			var block = {
				blockType: 2,
				content: getTagValue(inputs[0]),
				backgroundColor: bgcolor,
				textColor: textcolor
			};

			alert("Splash " + block.backgroundColor + " " + block.textColor);
			return block;
		}
	}

});
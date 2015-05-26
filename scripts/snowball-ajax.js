jQuery(document).ready(function($) {

	// We can also pass the url value separately from ajaxurl for front end AJAX implementations
	$("#publish").click(function() {
		var blocksRetrieved = retrieveBlocks();

		var data = {
			'action': 'add_blocks',		// this is needed to know which callback to use
			'blocks': blocksRetrieved,
		};
		$.post(ajax_object.ajax_url, data, function(response) {
			console.log(response);
		});
	});
	$("#add-text").click(function(){
		var blocksRetrieved = retrieveBlocks();

		var data = {
			'action': 'add_blocks',		// this is needed to know which callback to use
			'blocks': blocksRetrieved,
		};
		$.post(ajax_object.ajax_url, data, function(response) {
			console.log("The response: " + response);
		});
	});

	// this function will traverse
	function retrieveBlocks(){
		var blocks = [];

		// element is a form that represents a block
		// parseBlock is a function
		$(".snowball-main form").each(parseBlock);

		function parseBlock(orderNumber, blockForm) {
			var type = $(blockForm).attr("data-name");
			var inputs = $(blockForm).find("input[data-target], textarea[data-target]");

			var block = {
				blockType : type,
				orderNumber : orderNumber
			};
			// element is an input field for a block
			inputs.each(function(index, element) {
				var dataTarget = $(element).attr("data-target");
				var inputValue = $(element).val();
				block[dataTarget] = inputValue;

				//console.log(block);
			});
			blocks.push(block);
		}
	
		return blocks;
	}

});
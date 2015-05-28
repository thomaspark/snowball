jQuery(document).ready(function($) {

	// We can also pass the url value separately from ajaxurl for front end AJAX implementations
	$("#publish").click(function() {

	});

	// TODO: This needs to be removed and 
	// done with a publish/update button
	$("#add-text").click(function(){
		var blocksRetrieved = retrieveBlocks();

		var data = {
			'action': 'add_blocks',		// this is needed to know which callback to use
			'blocks': blocksRetrieved,
			'post_id' : ajax_object.post_id
		};
		$.post(ajax_object.ajax_url, data, function(response) {
			console.log("The response from clicking the text button: " + response);
		});
	});

	/* 
		This function will traverse through all the html in all the blocks
		and retrieve all the data about the block the user added.
	*/
	function retrieveBlocks(){
		var blocks = [];
		// element is a form that represents a block
		// parseBlock is a function
		$(".snowball-main form").each(parseBlock);

		/*
			parseBlock will retrieve the data-target attributes that
			are contained in the input tags
		*/
		function parseBlock(orderNumber, blockForm) {
			var type = $(blockForm).attr("data-name");
			var inputs = $(blockForm).find("[data-target]");

			var block = {
				blockType : type,
				orderNumber : orderNumber
			};
			// element is a tag with an attribute called data-target
			inputs.each(function(index, element) {
				var dataTarget = $(element).attr("data-target");
				var inputValue = $(element).val();
				block[dataTarget] = inputValue;
			});
			blocks.push(block);
		}
	
		return blocks;
	}

});
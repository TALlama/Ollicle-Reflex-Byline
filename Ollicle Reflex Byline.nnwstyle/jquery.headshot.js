/*
 * headshot: a jQuery plugin, version: 0.1.0 (2010-02-06)
 * @requires jQuery v1.2.3 or later
 *
 * Headshot is a jQuery plugin that finds a headshot of a person given a name
 * from Google Images. It allows the user to select any picture from the search 
 * results, or use an arbitrary URL.
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2009-2010, Seth A. Roby (tallama plussign headshot at gmail dot com)
 */
(function() {
	function cookieForName(name) {
		return 'headshot-for-' + name.replace('[^a-zA-Z0-9]', '');
	}
	
	//set the src url to that given, saving it under author name
	// if no srcUrl given, bails without saving anything
	// if no name given, will call getByline() to find one
	$.fn.setHeadshotSrcUrl = function(srcUrl, name) {
		if (!srcUrl) return null;
		if (!name) name = getByline();
		
		console.log("New headshot src url: " + srcUrl);
		$.cookie(cookieForName(name), srcUrl, {expires: userPref.cookietime});
		this.attr("src", srcUrl);
		return srcUrl;
	};
	
	//act as headshots for the author name given
	$.fn.headshot = function(name) {
		if (!name) name = getByline();
		
		var jq = this;
		var jqEl = jq.get(0);

		jQuery.data(jqEl, 'resultIndex', 0);
		jq.css({cursor: 'hand'});
		jq.attr("title", "Click to change headshot");
		jq.load(function() {
			$(this).show()
		});	
		jq.click(function() {
			var resultIndex = jQuery.data(jqEl, 'resultIndex') + 1;
			var imgSearch = jQuery.data(jqEl, 'imgSearch');
			
			if (!imgSearch.results || !imgSearch.cursor) {
				imgSearch.execute(name);
			} else if (resultIndex >= imgSearch.results.length) {
				imgSearch.gotoPage(imgSearch.cursor.currentPageIndex + 1);
			} else {
				jQuery.data(jqEl, 'resultIndex', resultIndex);
				jq.setHeadshotSrcUrl(imgSearch.results[resultIndex].unescapedUrl);
			}
		});
		
		var srcUrl = $.cookie(cookieForName(name));
		srcUrl = jq.setHeadshotSrcUrl(srcUrl, name);
		
		var loadImages = function() {
			var imgSearch = new google.search.ImageSearch();
			jQuery.data(jqEl, 'imgSearch', imgSearch);
			imgSearch.setSearchCompleteCallback(window, function() {
				jQuery.data(jqEl, 'resultIndex', 0);
				
				if (imgSearch.results.length > 0) {
					var newSrcUrl = imgSearch.results[0].unescapedUrl;
					
					// if the first hit is what we've got, skip it
					if (newSrcUrl == jq.attr("src")
					&& imgSearch.results.length > 1) {
						newSrcUrl = imgSearch.results[1].unescapedUrl;
					}
					
					jq.setHeadshotSrcUrl(newSrcUrl, name);
				} //else found nothing; don't show
			});
			//only load faces
			imgSearch.setRestriction(
				google.search.ImageSearch.RESTRICT_IMAGETYPE,
				google.search.ImageSearch.IMAGETYPE_FACES);
			if (!srcUrl) imgSearch.execute(name);
		};
		
		if (google != "undefined" && google.search) loadImages();
		else google.load("search", "1", {callback: loadImages});
	};
})();
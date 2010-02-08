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
	function id(name, idSuffix) {
		return arguments.length == 1
			? name.replace(/[^a-zA-Z0-9]/g, '')
			: $('#' + id(name) + '-' + idSuffix);
	}
	
	function cookieForName(name) {
		return 'headshot-for-' + id(name);
	}
	
	//set the src url to that given, saving it under author name
	// if no srcUrl given, bails without saving anything
	// if no name given, will call getByline() to find one
	$.fn.setHeadshotSrcUrl = function(srcUrl, name) {
		if (!srcUrl) return null;
		if (!name) name = getByline();
		
		var idPrefix = id(name);
		
		console.log("New headshot src url: " + srcUrl);
		$.cookie(cookieForName(name), srcUrl, {expires: userPref.cookietime});
		id(name, 'headshot-url').attr('value', srcUrl);
		id(name, 'headshots li.selected').removeClass('selected');
		id(name, 'headshots li img[src='+srcUrl+']').closest('li').addClass('selected');
		this.attr("src", srcUrl);
		return srcUrl;
	};
	
	//act as headshots for the author name given
	$.fn.headshot = function(name) {
		if (!name) name = getByline();
		
		var jq = this;
		var jqEl = jq.get(0);
		var idPrefix = id(name);
		
		//find the current srcUrl from the cookie
		var srcUrl = $.cookie(cookieForName(name));
		srcUrl = jq.setHeadshotSrcUrl(srcUrl, name);
		
		//add the picker ui
		jQuery.data(jqEl, 'resultIndex', 0);
		jq.css({cursor: 'hand'});
		jq.attr("title", "Click to change headshot");
		jq.load(function() {
			$(this).show();
		});
		jq.click(function() {
			var imgSearch = jQuery.data(jqEl, 'imgSearch');
			if (!imgSearch.results || imgSearch.results.length == 0) {
				//using the cookie image; load the results
				imgSearch.execute(name);
			}
			
			//and show the picker
			id(name, 'headshot-picker').slideToggle();
		});
		$(jqEl).after("<div id='" + idPrefix + "-headshot-picker' class='headshot-picker' style='display:none'>" +
			"	<p class='help'>Click a headshot</p>" +
			"	<ul id='" + idPrefix + "-headshots'/>" +
			"	<p id='" + idPrefix + "-loading'>Loading...</p>" +
			"	<hr/>" +
			"	<p class='help'>Or type a url</p>" +
			"	<input id='" + idPrefix + "-headshot-url' type='text' />" +
			"	<input id='" + idPrefix + "-set-headshot-url' type='button' value='Set' />" +
			"</div>");
		id(name, 'headshot-url').attr('value', srcUrl);	
		id(name, 'set-headshot-url').click(function() {
			jq.setHeadshotSrcUrl(id(name, 'headshot-url').attr('value'), name);
			id(name, 'headshot-picker').slideUp();
		});
		id(name, 'headshots img').live('click', function() {
			srcUrl = $(this).attr('src');
			jq.setHeadshotSrcUrl(srcUrl, name);
			id(name, 'headshot-picker').slideUp();
		});
		
		var loadImages = function() {
			var imgSearch = new google.search.ImageSearch();
			jQuery.data(jqEl, 'imgSearch', imgSearch);
			imgSearch.setSearchCompleteCallback(window, function() {
				id(name, 'loading').remove();
				
				if (imgSearch.results.length > 0) {
					if (!srcUrl && imgSearch.cursor.currentPageIndex == 0) {
						jq.setHeadshotSrcUrl(imgSearch.results[0].unescapedUrl, name);
					}
					
					for (var ix = 0; ix < imgSearch.results.length; ix++) {
						var su = imgSearch.results[ix].unescapedUrl;
						var selected = (su == srcUrl) ? 'class="selected"' : '';
						id(name, 'headshots').append('<li ' + selected + '><img src="' + su + '" /></li>');
						imgSearch.gotoPage(imgSearch.cursor.currentPageIndex + 1);
					}
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
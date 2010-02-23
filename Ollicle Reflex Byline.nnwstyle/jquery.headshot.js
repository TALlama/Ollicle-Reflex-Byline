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
		
		//define helper methods
		var setSearchTerm = function() {
			//clear old images
			id(name, 'headshots').empty();
			
			//fetch new ones
			var newName = id(name, 'search-term').attr('value');
			jQuery.data(jqEl, 'imgSearch').execute(newName);
		};
		var setSrcUrlAndClose = function() {
			jq.setHeadshotSrcUrl(id(name, 'headshot-url').attr('value'), name);
			id(name, 'headshot-picker').slideUp();
		};
		var clearHeadshot = function() {
			var src = window.stylepath + "/img/no-headshot.png";
			id(name, 'headshot-url').attr('value', src);
			setSrcUrlAndClose();
		};
		
		//add the picker ui
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
			"	<input id='" + idPrefix + "-search-term' type='text' />" +
			"	<input id='" + idPrefix + "-search' type='button' value='Search' />" +
			"	<ul id='" + idPrefix + "-headshots'/>" +
			"	<p id='" + idPrefix + "-loading'>Loading...</p>" +
			"	<hr/>" +
			"	<p class='help'>Or type a url</p>" +
			"	<input id='" + idPrefix + "-headshot-url' type='text' />" +
			"	<input id='" + idPrefix + "-set-headshot-url' type='button' value='Set' />" +
			"	<hr/>" +
			"	<p class='help'>Or <a href='#' id='" + idPrefix + "-clear'>clear the headshot</a></p>" +
			"</div>");
		id(name, 'search-term').attr('value', name);
		id(name, 'search-term').keypress(function(event) {
			if (event.keyCode == '10' || event.keyCode == '13') {
				event.preventDefault();
				setSearchTerm();
			}
		});
		id(name, 'search').click(setSearchTerm);
		id(name, 'headshot-url').attr('value', srcUrl);	
		id(name, 'set-headshot-url').click(setSrcUrlAndClose);
		id(name, 'headshot-url').keypress(function(event) {
			if (event.keyCode == '10' || event.keyCode == '13') {
				event.preventDefault();
				setSrcUrlAndClose();
			}
		});
		id(name, 'headshots img').live('click', function() {
			srcUrl = $(this).attr('src');
			jq.setHeadshotSrcUrl(srcUrl, name);
			id(name, 'headshot-picker').slideUp();
		});
		id(name, 'clear').click(function(event) {
			event.preventDefault();
			clearHeadshot();
		})
		
		//find the current srcUrl from the cookie
		var srcUrl = $.cookie(cookieForName(name));
		if (srcUrl) jq.setHeadshotSrcUrl(srcUrl, name);
		else clearHeadshot();
		
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
						if (imgSearch.cursor) {
							imgSearch.gotoPage(imgSearch.cursor.currentPageIndex + 1);
						}
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
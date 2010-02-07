/* Feed styling for NetNewsWire 3 */
/* http://www.newsgator.com/Individuals/NetNewsWire/ */

/* JavaScript cobbled together by Oliver Boermans */
/* http://www.ollicle.com */

/* Powered by jQuery */
/* http://jquery.com */



// Config //
/* Don’t delete the commas!! */
var userPref = {
	layout: 'two', 			// display layout columns				- 'one' or 'two' (comment out for NNW layout to determine)
	skin: 'white', 			// background colour and theme			- 'black' or 'white'
	cookietime: 1095,		// time feed specific prefs saved 		- number of days
	loaddelicious: true,	// display del.icio.us tagometer		- true or false
	deliciousdelay: 2000,	// delay before del.icio.us checked		- milliseconds 
	lineheightratio: .015,	// helps determine the max line spacing - number, small change makes a big difference
	eldestms: 29030400000,  // age when feed item aging halts		- milliseconds
	eldestbg: [208,171,128],// oldest background colour				- RGB 0-255
	eldestcolor: [54,35,29],// oldest text colour					- RGB 0-255
	youngbg: [255,255,255], // youngest background colour			- RGB 0-255
	youngcolor: [2,1,1]		// youngest text colour					- RGB 0-255
};



// Create shortcuts to other document elements
var objBody = $('body').get(0);
var $targetBox = $('#lineflex');
var targetBox = $targetBox.get(0);

// Functions //

// Cookie functions from http://www.quirksmode.org/js/cookies.html
function createCookie(name,value,days)
{
	if (days)
	{
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name)
{
	createCookie(name,"",-1);
}



// Set body ID depending on layout preference
function applyLayoutPref()
{

	if (readCookie('nnwlayout') == "traditional")
	{
		objBody.id = "traditionalViewBody";
		$("#ui").addClass("layout");
	}
	else if (readCookie('nnwlayout') == "wide")
	{
		objBody.id = "widescreenViewBody";
		$("#ui").addClass("layout");
	}
}


function changeLayout(newpref)
{
	if (newpref == "one")
	{
		var newlayout = "widescreenViewBody";
	}
	else if (newpref == "two")
	{
		var newlayout = "traditionalViewBody";
	}
	setLayoutPref(newlayout);
	applyLayoutPref();
	// Fire window resize event
	$(window).trigger("resize");
}


// Store layout preference
function setLayoutPref(pref)
{
	if(objBody.id == "widescreenViewBody") {
		if(pref == "widescreenViewBody") {
			if(!readCookie('nnwlayout')) {
				createCookie('nnwlayout','wide',userPref.cookietime);
			} else {
				eraseCookie('nnwlayout');
				$("#ui").removeClass("layout");
			}
		} else {
			createCookie('nnwlayout','traditional',userPref.cookietime);
		}
	}
	else if(objBody.id == "traditionalViewBody") {
		if(pref == "traditionalViewBody") {
			if(!readCookie('nnwlayout')) {
				createCookie('nnwlayout','traditional',userPref.cookietime);
			} else {
				eraseCookie('nnwlayout');
				$("#ui").removeClass("layout");
			}
		} else {
			createCookie('nnwlayout','wide',userPref.cookietime);
		}
	}
}


// Set body class depending on skin preference
function applySkinPref()
{
	if (readCookie('nnwskin') == null)
	{
		$("#ui").removeClass("skin");
	}
	else
	{
		var newskin = readCookie('nnwskin');
		$("#skins dd").each(function(){
			var skinName = $(this).text();
			$(objBody).removeClass(skinName);
		});
		$(objBody).addClass(newskin);
		$("#ui").addClass("skin");
	}
}


// Store skin preference
function setSkinPref(pref)
{
	if(pref == readCookie('nnwskin')) {
		eraseCookie('nnwskin');
	}
	else
	{
		createCookie('nnwskin',pref,userPref.cookietime);
	}
}


function deliciousLoading()
{
	$(".newsItemDateLine").append("<span id='newsItemTags'>Checking&#8230;</span>");
}


function displayData(data)
{
	var urlinfo = data[0];
	
	if(urlinfo == null || urlinfo.total_posts == "0")
	{
		$('#newsItemTags').text('untagged');
	}
	else
	{
		var $taghtml = $("<div>");
		$taghtml.append("<strong><a href='http://del.icio.us/url/"+urlinfo.hash+"'>"+ (urlinfo.total_posts) +"</a></strong>");
		for (tag in urlinfo.top_tags) 
		{
			$taghtml.append("<span title='"+urlinfo.top_tags[tag]+"'><a href='http://del.icio.us/tag/"+tag+"'>"+tag+"</a> </span>");
		}
		$('#newsItemTags').html($taghtml.html());
	}
}


function ageColours(msold)
{
	var ageRatio = msold / userPref.eldestms;
	
	if(ageRatio > 1)
	{
		ageRatio = 1;
	}
	
	var bgR = Math.round(userPref.youngbg[0] - (ageRatio * (userPref.youngbg[0] - userPref.eldestbg[0])));
	var bgG = Math.round(userPref.youngbg[1] - (ageRatio * (userPref.youngbg[1] - userPref.eldestbg[1])));
	var bgB = Math.round(userPref.youngbg[2] - (ageRatio * (userPref.youngbg[2] - userPref.eldestbg[2])));
	
	var colorR = Math.round(userPref.youngcolor[0] + (ageRatio * (userPref.eldestcolor[0] - userPref.youngcolor[0])));
	var colorG = Math.round(userPref.youngcolor[1] + (ageRatio * (userPref.eldestcolor[1] - userPref.youngcolor[1])));
	var colorB = Math.round(userPref.youngcolor[2] + (ageRatio * (userPref.eldestcolor[2] - userPref.youngcolor[2])));

	$(objBody).css({
		'color': 'rgb('+ colorR +','+ colorG +','+ colorB +')',
		'background-color': 'rgb('+ bgR +','+ bgG +','+ bgB +')'
	});
	
}

function scrubHTML()
{
	$targetBox.html(
		$targetBox.html()
			.replace(/<\/?\s*FONT[^>]*>/gi, "")								// Remove font tags
			.replace(/<\s*(\w[^>]*) style="([^"]*)"([^>]*)/gi, "<$1$3") 	// Remove style attributes
			.replace(/<p>[\s]*?(<br>|<br \/>|<br\/>)*?[\s]*?<\/p>/gi, "")	// Remove empty(white space or br onoly) paragraphs
			.replace(/(<p>|<div>)[\s]*?(<br>|<br \/>|<br\/>)*?/gi, "$1")	// Remove leading br from div and p
			.replace(/(<br>|<br \/>|<br\/>)*?[\s]*?(<\/p>|<\/div>)/gi, "$2")// Remove trailing br from div and p
	);
}


//find out who the author of the current item is
function getByline() {
	return $('.newsItemDescription .title .newsItemCreator').text().
		replace(/^\s+/, '').
		replace(/\s+$/, '').
		replace(/\w+@\w+.\w+/, '');
}


// Ready Set Go!
$(document).ready(function() {
	// find a headshot
	$('#headshot').headshot(getByline());

	scrubHTML();

	// two or more linked or unlinked images with only whitespace or &nbsp; between them
	$targetBox.html($targetBox.html().replace(/(((<a[^>]*>\s*)?<img\s([^>])*([^>]\/)*>(\s*<\/a>)?(\u00A0|\s|&nbsp;)*){2,})/gi, "<span class=\"img-group\">$1</span>"));
	
	$(objBody).addClass('js');
	
	
	// Test if Universal date is present
	var $newsItemDate = $('.newsItemDate');
	if($newsItemDate.attr('title').match(/.+Z$/))
	{
		// Apply fuzzy date and age background and text colour
		$newsItemDate.after( $newsItemDate.clone().hide() ).timeago();
		
		$('.newsItemDate').addClass('fuzzy').click(function(){
			$(this).hide().siblings('.newsItemDate').show();
		});
		var msold = new Date().getTime() - $('.newsItemDate').data("timeago").datetime.getTime();
		if(msold > 1000)
		{
			ageColours(msold);
		}
	}
	
	
	$('img').load(function(){
		$(this).addClass('loaded');
	});
	
	$('a:has(img)').addClass('img');

	// Add classes to likely data tables
	$('table',targetBox).filter(function(index){
		if ($('td',this).length >= 6) return true;
	}).addClass('data').find('tr:odd').addClass('odd');

	
	// Apply user skin preference
	if (userPref.skin != "")
	{
		$("#skins dd").each(function(){
			var skinName = $(this).text();
			$(objBody).removeClass(skinName);
		});
		$(objBody).addClass(userPref.skin);
	}
	applySkinPref();

	// Apply user layout preference
	if (userPref.layout != "")
	{
		if (userPref.layout == "two")
		{
			objBody.id = "traditionalViewBody";
		}
		else if (userPref.layout == "one")
		{
			objBody.id = "widescreenViewBody";
		}
	}
	applyLayoutPref();
		
	$targetBox.autolineheight({ratio: userPref.lineheightratio}).imagefit();
	
	$("#layout dd").each(function(){
		var thislayout = $(this).text();
		$(this)
			.click(function(){
				changeLayout(thislayout);
				// override css hover after click
				$(this).addClass("over").one('mouseout',function(){$(this).removeClass("over")});
			}
		);
	})



	$("#skins dd").each(function(){
		var thisskin = $(this).text();
		$(this)
			.click(function(){
				setSkinPref(thisskin);
				applySkinPref();
				// override css hover after click
				$(this).addClass("over").one('mouseout',function(){$(this).removeClass("over")});
			}
		);
	})
	
	
	
	
	$("#ui .button").click(function(){
		$("#ui").toggleClass("open");
	});

	
	$("#ui .panel p:first").html("For: "+$(".newsItemSource a:last").text());

	$(window).scroll(function()
		{	
			var pagescroll = self.pageYOffset;
			if(pagescroll>=50)
			{
				$(".newsItemTitle").css({'opacity':'1','top':'0'});
			}
			else if(pagescroll<50)
			{
				$(".newsItemTitle").css({'opacity':'0','top':'-2em'});
			}
		}
	);
	
	// Change markup
	
	// Ignore changes that are whitepsace only
	$('.diff').each(function(){
		if( !$(this).text().match(/\S/) )
		{
			$(this).removeClass('diff');
		}
	});
	
	if ($('.diff').length > 0){
		$targetBox.prepend('<div id="diff" title="Toggle changes"></div>').find('#diff').bind('click',function(){
			$targetBox.toggleClass('showdiff');
		}).hover(function(){
			$targetBox.addClass('hintdiff');
		},function(){
			$targetBox.removeClass('hintdiff');
		});
	}
	
	
	// Set up delicious widget
	
	if (userPref.loaddelicious)
	{
		deliciousLoading(); 
		var sitetotaste = $('.newsItemTitle a').attr('href');
			
		function loadJSON(file)
		{
			var script = document.createElement( 'script' );
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.src = file;
			document.getElementsByTagName('head')[0].appendChild( script );
		}
		
		function getDelicious()
		{
			loadJSON("http://badges.del.icio.us/feeds/json/url/data?hash="+ hex_md5(sitetotaste) + "&callback=displayData");
		}
	
		// Find link for del.icio.us check
		function getRedirect()
		{
			sitetotaste = ''+ window.frames[0].location;
			getDelicious();
		}
		
		if (sitetotaste.match(/(^http\:\/\/feeds\.feedburner\.com\/.+|^http\:\/\/feedproxy\.google\.com\/.+)/)){
			$(objBody).prepend('<iframe style="display:none;" id="redirect" src="'+ sitetotaste +'"></iframe>');
			setTimeout(getRedirect,userPref.deliciousdelay);
		}
		else
		{
			setTimeout(getDelicious,userPref.deliciousdelay);
		}
	}
});

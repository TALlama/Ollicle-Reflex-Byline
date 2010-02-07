/* jquery.imagefit 
 * Not really a plugin
 * Version 0.4 by Oliver Boermans <http://www.ollicle.com/eg/jquery/imagefit/>
 *
 * Extends jQuery <http://jquery.com>
 * Requires jQem plugin
 *
 */
(function($) {
	$.fn.imagefit = function() {

		var fit = {
			
			container : {},
			imgparents : {},
		
			prepare : function(img){
				// store initial dimensions on each image 
				$.data(img,'initial',
				{
					'width' : $(img).width(),
					'height' : $(img).height()
				});
				$(img).css('max-width', $(img).width()+'px');
				
				fit.one(img);
				fit.clearing($(img).closest('p,div,blockquote,li',fit.container).not('#lineflex'));
			},
			
			clearing : function(parents){
				parents.filter(':has(img.float-left)').each(function(){
				
					if($(this).data('textparent'))
					{
						$(this).addClass('clear');
					}
					else // separate from text in following parent
					{
						$(this).addClass('preclear');
					}
				});
			},
		
		
			all : function(imgs){
				imgs.each(function(){
					fit.one(this);
				});
				
				// Remove result of first pass
				fit.imgparents.removeClass('clear preclear');
				
				fit.clearing(fit.imgparents);
					
			},
			
			one : function(img){
				
				// reset significant attributes from previous pass
				$(img).removeClass('block inline float-left float-right')
					.each(function(){
					
					// is img height less than line-height?
					if( ($(this).height()) < ($(fit.container).css('lineHeight') * $.jqem.current()) )
					{
						// Do not apply layout
						$(this).addClass('inline');
					}
					else
					{
					
						// get container from settings
						var minwidth = $(fit.container).css('minWidth').replace(/([0-9]+?)px/i,"$1");
						var remaining = 0 + $(fit.container).width() - $(this).width();
					
						// is remaining width less than container min-width
						if(remaining < minwidth)
						{
							//ensure no text the right of img
							$(this).addClass('block');
						}
						else
						{
							$(this).addClass('float-left');
							// maybe clearing call should appear here
						}
						
					}		
					$(this).width('100%').height(
						Math.round($.data(this, 'initial')['height']*($(this).width()/$.data(this, 'initial')['width']))
					);
					
				});
				
			}
		};
		
		var intlimit = {
			'tryrun':function(func,interval) {
				if(intlimit.waiting)
					{
					intlimit.waiting = false;
					run = setTimeout(func,interval);
					reset = setTimeout(intlimit.waiting=true,interval);
					}
			},
			'waiting': true,
			'first': true
		};
		
		this.each(function(){
		
				fit.container = this;
				
				// is blockquote, p or div a parent of an img
				fit.imgparents = $('p,div,blockquote,li',fit.container).filter(':has(img)');
				
				fit.imgparents.filter(function(){
					return $(this).text().match(/\S/); // if contains text
				}).data('textparent',true);
				

				// store list of contained images (excluding those in tables)
				var imgs = $('img', fit.container).not($("table img")).not($("span.img-group img"));
				
				// check if image has height/width or is in cache
				imgs.each(function(){
					if(this.width && this.height){
						// if so apply layout directly
						fit.prepare(this);	
					}
					else {
						// otherwise apply on load function 
						imgs.load(function(){	
							fit.prepare(this);
						});
					}
				});
				
				// Re-adjust when window width is changed
				$(window).bind('resize', function(){
					intlimit.tryrun(fit.all(imgs),300);
				});
			
				// Re-adjust when font size changes	// Test for jqem object first? 
				$.jqem.bind(function() {
					fit.all(imgs);
				});
			});
		return this;
	};
})(jQuery);
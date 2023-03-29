$(document).ready(function(){

var a = {};

a.settings = {
	url: $('body').data('url'),
	speed: 400,
	easing: 'easeInOutCubic',
	projectTransition:600
},

a.ui = {
	body: $('body'),
	win: $(window)
},

a.sizes = {},

a.site = {

	init: function(){
		this.getSizes();
		this.bindEvents();
		this.setInitialState();
	},

	getSizes: function(){
		a.sizes.winWidth = a.ui.win.width();
		a.sizes.winHeight = a.ui.win.height();
		a.sizes.navWidth = $('.nav').outerWidth();
		a.sizes.navHeight = $('.nav').outerHeight();
		a.sizes.margins = $('.nav').outerHeight() * 0.04;
	},

	bindEvents: function(){
		a.ui.win.on('resize', this.resize);
	},


	state: null,

	setInitialState: function(){
		if(history.replaceState){
			a.nav.state = a.ui.body.hasClass('single') ? 'single' : 'index';
			history.replaceState({
				state: a.nav.state,
				url: window.location.href
			}, null, null);
		}
	},

	resizeTimer: null,
	resize: function(){
		clearTimeout(this.resizeTimer);
		this.resizeTimer = setTimeout(function(){
			a.site.getSizes();
			a.helpers.checkMediaQuery();
			a.nav.generateMap();
		}, 250);
	}

}

a.nav = {

	init: function(){
		this.bindEvents();
		a.nav.setMove();
		a.nav.initialLoad();
		a.nav.generateMovementArray();
		a.nav.scatterEverything();
		a.nav.checkSingle();
	},

	bindEvents: function(){
		$(window).on('popstate', this.goBack);
		if(a.settings.screenType === 'mouse'){
			a.ui.body.on('mousemove', this.setMouse);
			a.ui.body.on('mousemove', this.moveWithMouse);

			a.ui.body.on('mouseenter', '.publication-item', this.hoverPublication);
			a.ui.body.on('mouseleave', '.publication-item', this.unhoverPublication);
			a.ui.body.on('click', '.publication-item', this.openPublication);
		}

		

		$(window).on('scroll', this.checkScroll);
		$(window).on('scroll', this.moveNav);

		a.ui.body.on('click', '.nav-cover', this.closePublication);
		a.ui.body.on('click', '.menu-link, .page-cover', this.toggleMenu);
		a.ui.body.on('click', '.text-wrapper-expand', this.expandContent);

		a.ui.body.on('click', '.gallery-nav', this.navGallery);

		a.ui.body.on('click', '.menu a', this.openFromLink);

		// $(window).on('load', function() {
			
		// });
	},

	checkSingle: function(){
		if(a.ui.body.hasClass('single')){
			if(a.sizes.media !== 'mobile'){
				$('body,html').animate({scrollTop:a.sizes.winHeight/2.5}, 800, a.settings.easing);
			} else {
				$('body,html').animate({scrollTop:a.sizes.winHeight/4}, 800, a.settings.easing);
			}
		}
	},

	initialLoad: function(){
		var gap = 0;
		setTimeout(function(){
			// $('.publication-item').each(function(){
			// 	var that = $(this);
			// 	setTimeout(function(){
			// 		that.removeClass('hidden');
			// 	}, gap += 40);
			// });
		}, 1000);
	},

	movement: [],
	generateMovementArray: function(){
		for (i = 0; i < $('.publication-item').length; i++) { 
			// a.nav.movement.push(a.helpers.rdm(3,9)/100);
			a.nav.movement.push(i/100);
		}
	},

	scale: 0.1,
	mapCanvas: $('.map-canvas'),
	generateMap: function(){
		var scale = a.nav.scale;
		var canvas = $('.map-canvas');
		a.nav.mapCanvas.empty();
		a.nav.mapCanvas.css({
			width:$('.nav').width() * scale,
			height:$('.nav').height() * scale
		});
		if(a.helpers.chrome){
			$('.map-viewport, .map-container').css({
				width:a.sizes.winWidth * scale,
				height:a.sizes.winHeight * scale
			});
		} else {
			$('.map-viewport').css({
				width:a.sizes.winWidth * scale,
				height:a.sizes.winHeight * scale
			});
			$('.map-container').css({
				width:$('.nav').width() * scale,
				height:$('.nav').height() * scale
			});
		}
		$('.publication-item').each(function(){
			var that = $(this);
			var miniItem = $('<div class="map-item"></div>');
			miniItem.css({
				width:Math.floor($('img', that).width() * scale),
				height:Math.floor($('img', that).height() * scale),
				top:Math.floor((that.position().top + $('.nav-container-inner').scrollTop()) * scale),
				left:Math.floor((that.position().left + $('.nav-container-inner').scrollLeft()) * scale),
			}).data({
				colour:that.data('colour'),
				title:that.data('title')
			});
			a.nav.mapCanvas.append(miniItem);
		});
		$('.map-container').addClass('visible');
	},


	totalItems: $('.publication-item').length,
	zIndexRatio: $('.publication-item').length/6,

	scatterEverything: function(){
		var numLoaded = 0;
		var totalItems = $('.item-inner').length;
		var mapGenerated = false;
		a.nav.publicationItem.each(function(){
			var inner = $('.item-inner', $(this));
			var filename = inner.data('filename');
			var src = inner.data('src');
			var w = inner.data('w');
			var h = inner.data('h');

			if(src){
				var img = new Image();
				// img.style.display = 'none';
				img.onload = function(){
					$(this).addClass('unhidden');
					numLoaded = numLoaded + 1;
					if(numLoaded === totalItems){
						a.nav.generateMap();
						mapGenerated = true;
					}
				};

				inner.append(img);            
				img.src = src;
				// img.src = 'http://projects.secondcousins.studio/torque/content/' + filename;
				img.width = w;
				img.height = h;
				var deg = ((a.helpers.rdm(0,2))-1);

				$(img).css({
					transform:'rotate(' + deg + 'deg)'
				});
			}
		});
		setTimeout(function(){
			if(mapGenerated === false){
				a.nav.generateMap();
			}
		}, 8000);
	},

	loading: false,
	showingInfo: false,

	scrollAmountX: 0,
	scrollAmountY: 0,
	mousePos: 0,
	mousemoved: false,
	cursor: $('.cursor'),
	mapCursor: $('.map-cursor'),
	publicationItem: $('.publication-item'),
	publicationInfo: $('.publication-info'),
	siteTitle: $('.nav-container').data('title'),
	defaultColour: '#000',

	clientX: 0,
	clientY: 0,

	setMouse: function(e){
		a.nav.mousePos = e;
		a.nav.clientX = e.clientX;
		a.nav.clientY = e.clientY;
		if(a.nav.mousemoved === false){
			a.nav.mousemoved = true;
		}
	},

	moveWithMouse: function(){
		// Move items
		if(a.helpers.chrome === true){
			a.nav.mapCursor.css({
				left:a.nav.clientX * a.nav.scale, 
				top:a.nav.clientY * a.nav.scale});
			a.nav.publicationItem.each(function(){
				var that = $(this);
				var thatIndex = that.index();
				var x = 0.6 - (a.nav.clientX * ((thatIndex/(a.nav.zIndexRatio)*3)/250));
				var y = 0.6 - (a.nav.clientY * ((thatIndex/(a.nav.zIndexRatio)*3)/250));
				that.css({'transform':'translate(' + x + 'px, ' + y + 'px)'});
			});
		}
	},

	tickerRepeater: null,
	navContainer: $('.nav-container-inner'),

	setMove: function(){		
		if(a.sizes.media !== 'mobile' && a.settings.screenType === 'mouse' && Modernizr.requestanimationframe){
			// call the interval forever
			a.nav.tickerRepeater = requestAnimationFrame(a.nav.ticker);
		} else if(a.settings.screenType === 'touch'){
			var as = 0;
			a.ui.win.on('deviceorientation', function(e){
				a.nav.clientX = ((e.originalEvent.gamma+90)/180) * a.sizes.winWidth;
				a.nav.clientY = ((e.originalEvent.beta+90)/180) * a.sizes.winHeight;
			});
			a.nav.tickerRepeater = requestAnimationFrame(a.nav.ticker);
		}
	},

	ticker: function(){
		if(a.nav.loading === false && a.nav.showingInfo === false){
			var decay = 0.15;
			var percentX = a.nav.clientX / a.sizes.winWidth;
			var percentY = a.nav.clientY / a.sizes.winHeight;
			// get the old scroll value
			var xpX = a.nav.navContainer.scrollLeft();
			var xpY = a.nav.navContainer.scrollTop();
			a.nav.scrollAmountX = (a.sizes.navWidth - a.sizes.winWidth) * percentX;
			a.nav.scrollAmountY = (a.sizes.navHeight - a.sizes.winHeight) * percentY;
			// the new scroll value is the destination value minus how far we've currently scrolled, multiplied by an easing number
			xpX += parseFloat((a.nav.scrollAmountX - xpX) * decay);
			xpY += parseFloat((a.nav.scrollAmountY - xpY) * decay);

			a.nav.navContainer.scrollLeft(xpX);
			a.nav.navContainer.scrollTop(xpY);

			if(a.helpers.chrome === true){
				a.nav.mapCanvas.css({transform:'translate(-' + xpX * a.nav.scale + 'px, -' + xpY * a.nav.scale + 'px)'});
			}
		}

		// Call itself
		a.nav.tickerRepeater = requestAnimationFrame(a.nav.ticker);
	},

	clicked: false,

	hoverPublication: function(e, that, url){
		var that = that ? that : $(this);
		var colour = that.data('colour');
		var title = that.data('title');
		// if(a.nav.clicked === false){
			// a.nav.unhoverPublication(null, true);
			a.ui.body.addClass('hover-publication');
			$('.publication-item').removeClass('related-item');
			$('.publication-item[data-title="' + title + '"]').addClass('related-item');
			$('.publication-title h1').text(title).css({color:colour});
			$('.line').css({backgroundColor:colour});
			$('.map-item').each(function(){
				if($(this).data('title') === title){
					$(this).css({backgroundColor:colour});
				} else {
					$(this).css({backgroundColor:'#fff'});
				}
			});
		// }
	},

	unhoverPublication: function(e, fromMenu){
		if(a.nav.clicked === false){
			if(fromMenu !== true){
				a.ui.body.removeClass('hover-publication');
				$('.publication-item').removeClass('related-item');
				$('.map-item').css({backgroundColor:'#fff'});
				$('.line').css({backgroundColor:'#111'});
			}
		}
	},

	toggleMenu: function(e, close){
		if(close){
			a.ui.body.removeClass('show-menu');
		} else {
			a.ui.body.toggleClass('show-menu');
		}
		if(e){e.preventDefault();}
	},

	openPublication: function(e, that, url, fromBack){
		a.nav.clicked = true;
		var that = that ? that : $(this);
		var url = url ? url : $(this).attr('href');
		a.ui.body.addClass('loading');
		a.nav.loadURL(e, url, fromBack);
		$('.nav-cover-inner').css({background:that.data('colour')});
		if(e){e.preventDefault();}
	},

	closePublication: function(scrolled, fromMenu, fromBack){
		if(scrolled !== true){
			a.nav.state = 'index';
			$('body,html').animate({scrollTop:0}, 800, a.settings.easing, function(){
				$('body').removeClass('single');
				a.nav.clicked = false;
				$('article').hide().empty();
				if(fromMenu === true){
					a.nav.unhoverPublication(null, true);
				} else {
					a.nav.unhoverPublication();
				}
			});
		} else {
			$('body').removeClass('single');
			a.nav.clicked = false;
			$('article').hide().empty();
			a.nav.unhoverPublication();
		}
		if(fromBack !== true){
			a.nav.state = 'index';
			a.nav.changeState(a.settings.url, 'index');
		}
	},

	checkScroll: function(){
		var toTop = $(window).scrollTop();
		if(toTop === 0 && a.nav.switchingProject !== true && a.nav.state === 'single' && a.sizes.media !== 'mobile'){
			if(a.ui.body.hasClass('single') && !a.ui.body.hasClass('loading')){
				a.nav.closePublication(true);
			}
		}
	},

	moveNav: function(){
		var toTop = $(window).scrollTop();
		var moveAmount = toTop/2;
		var opacity = toTop/a.sizes.winHeight;
		if(a.settings.screenType !== 'touch'){
			$('.title-wrapper').css({
				transform:'translateY(' + -moveAmount + 'px)'
			});
		}
		$('.nav-cover').css({
			opacity:(opacity*1.1)
		});
	},

	loadURL: function(e, url, fromBack){
		var url = url ? url : $(this).attr('href');
		$.get(url, function(data){
			var html = $('<div />').html(data);
			// setTimeout(function(){
				$('article').html($('article', html).contents());
				a.ui.body.removeClass('loading');
				$('body,html').scrollTop(0);
				a.ui.body.addClass('single');
				a.nav.state = 'single';
				$('.menu').find('a[href="' + url + '"]:first').parents('li').addClass('visited');
				if(fromBack !== true){
					a.nav.changeState(url, a.nav.state);
				}
				if(a.sizes.media !== 'mobile'){
					$('body,html').animate({scrollTop:a.sizes.winHeight/2.5}, 800, a.settings.easing);
				} else {
					$('body,html').animate({scrollTop:a.sizes.winHeight/3}, 800, a.settings.easing);
				}
				a.nav.switchingProject = false;
				a.helpers.checkInternalLinks();
			// }, 1000);
		});
	},

	changeState: function(url, state){
		if(history.pushState){
			history.pushState({
				state:state, 
				url:url
			}, null, url);
			console.log('changing state to ' + state);
		}
	},

	goBack: function(e){
		var state = e.originalEvent.state;
		if(e.originalEvent && state){
			if(state.state === 'single'){
				var element = $('.menu').find('a[href="' + state.url + '"]:first');
				console.log('single');
				a.nav.openFromLink(null, element);
			} else if(state.state === 'index'){
				console.log('index');
				a.nav.closePublication(false, true, true);
			} else {
				console.log(state.state);
			}
		}
	},

	switchingProject: false,

	openFromLink: function(e, that){
		var fromBack = that ? true : false;
		var that = that ? that : $(this);
		var url = that.attr('href');
		a.nav.switchingProject = true;
		if(a.ui.body.hasClass('single')){
			a.nav.closePublication(null, true);
			setTimeout(function(){
				a.nav.openPublication(e, that, url, fromBack);
				a.nav.hoverPublication(e, that, url);
			}, 700);
		} else {
			a.nav.openPublication(e, that, url, fromBack);
			a.nav.hoverPublication(e, that, url);
		}
		a.nav.toggleMenu(null, true);
		if(e){e.preventDefault();}
	},

	expandContent: function(e){
		$('.text-content-wrapper').addClass('expanded');
		e.preventDefault();
	},

	navGallery:function(e){
		var that = $(this);
		var gallery = that.parents('.gallery');
		var current = $('.gallery .visible').index();
		var newCurrent = 0;
		// previous
		if(that.hasClass('prev')){
			if(current === 0){
				newCurrent = $('.gallery-image').length - 1;
			} else {
				newCurrent = current - 1;
			}
		} else {
			if(current === $('.gallery-image').length - 1){
				newCurrent = 0;
			} else {
				newCurrent = current + 1;
			}
		}
		$('.gallery-image').removeClass('visible').eq(newCurrent).addClass('visible');
		e.preventDefault();
	}

}

a.helpers = {

	init: function(){
		this.easeFunctions();
		this.checkBrowser();
		this.checkMediaQuery();
		this.checkInternalLinks();
		this.whichTransition();
	},

	checkMediaQuery: function(){
		if(!$('.media-check').length){$('body').append('<div class="media-check"></div>')}
		var mediaCheck = $('.media-check').css('text-indent');
		if(mediaCheck === '10px'){a.sizes.media = 'mobile';} 
		else if(mediaCheck === '20px'){a.sizes.media = 'tablet';} 
		else if(mediaCheck === '30px'){a.sizes.media = 'desktop';} 
		else if(mediaCheck === '40px'){a.sizes.media = 'xl';} 
		else if(mediaCheck === '50px'){a.sizes.media = 'xxl';} 
		else {a.sizes.media = 'unsure';}
		a.settings.screenType = $('html').hasClass('mobile') || $('html').hasClass('tablet') || !$('html').hasClass('raf') ? 'touch' : 'mouse';
	},

	rdm: function(min,max){
		var rdmArray = [];
		for (i = 0; i < 1000; i++) { 
			rdmArray.push(Math.floor(Math.random()*(max-min+1)+min));
		}
		a.helpers.shuffle(rdmArray);
		return rdmArray[0];
	},

	shuffle: function(array){
		var currentIndex = array.length, temporaryValue, randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	},

	/* Run function once after CSS transtion ended eg. 
	$(el).one(a.helpers.whichTransition, function(e){
		console.log('Transition complete!  This is the callback!');
	}); */
	whichTransition: function(){
		var el = document.createElement('fakeelement');
		var transitions = {
			'animation':'transitionend',
			'OAnimation':'oTransitionEnd',
			'MSAnimation':'MSTransitionEnd',
			'WebkitAnimation':'webkitTransitionEnd'
		};

		for(var t in transitions){
			if(transitions.hasOwnProperty(t) && el.style[t] !== undefined){
				a.settings.transition = transitions[t];
			}
		}
	},

	easeFunctions: function(){
		$.extend(jQuery.easing,{
			linear: function (t) { return t },
			easeInQuad: function (t) { return t*t },
			easeOutQuad: function (t) { return t*(2-t) },
			easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
			easeInCubic: function (t) { return t*t*t },
			easeOutCubic: function (t) { return (--t)*t*t+1 },
			easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
			easeInQuart: function (t) { return t*t*t*t },
			easeOutQuart: function (t) { return 1-(--t)*t*t*t },
			easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
			easeInQuint: function (t) { return t*t*t*t*t },
			easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
			easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
			easeInElastic: function (t) { return (.04 - .04 / t) * Math.sin(25 * t) + 1 },
			easeOutElastic: function (t) { return .04 * t / (--t) * Math.sin(25 * t) },
			easeInOutElastic: function (t) { return (t -= .5) < 0 ? (.01 + .01 / t) * Math.sin(50 * t) : (.02 - .01 / t) * Math.sin(50 * t) + 1 }
		});
	},

	oldBrowser: false,
	history: false,
	checkBrowser: function(){
		if (Modernizr.history && Modernizr.cssanimations && Modernizr.cssgradients && Modernizr.csstransforms && Modernizr.csstransitions && Modernizr.borderradius && !$('html').hasClass('lt-ie9')){
			a.helpers.oldBrowser = false;
			a.helpers.history = Modernizr.history;
		} else {
			a.helpers.oldBrowser = true;
			a.helpers.history = Modernizr.history;
			var browserMessage = $("<div style='position:fixed !important; bottom:0 !important; left:0 !important; font-family:Arial, sans-serif !important; font-size:14px !important; background:#fff !important; padding:10px !important; line-height:20px !important; z-index:100001 !important; color:#000 !important; cursor:pointer !important;'>Your browser doesn't support all of the features this site requires, so it may not function as intended. Please upgrade to a newer browser.</div>");
			$('body').append(browserMessage);
			$(document).one('click', browserMessage, function(){browserMessage.remove();});
		}
		/* Check for Chrome */
		if(window.chrome){
			a.helpers.chrome = true;
			$('html').addClass('browser-chrome');
		} else {
			a.helpers.chrome = false;
		}
	},

	checkInternalLinks: function(){
		$('a[href^="' + a.settings.url + '"]').addClass('internal');
		$('p a, .meta a').attr('target', '_blank');
	}

}

a.helpers.init();
a.site.init();
a.nav.init();

});
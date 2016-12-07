/**
 * ProcessWire Admin common javascript
 *
 * Copyright 2016 by Ryan Cramer
 * 
 */

var ProcessWireAdmin = {

	/**
	 * Initialize all
	 * 
	 */
	init: function() {
		this.setupButtonStates();
		this.setupTooltips();
		this.setupDropdowns();
	},
	
	/**
	 * Enable jQuery UI tooltips
	 *
	 */
	setupTooltips: function() {
		$("a.tooltip, .pw-tooltip").tooltip({
			position: {
				my: "center bottom", // bottom-20
				at: "center top"
			}
		}).hover(function() {
			$(this).addClass('ui-state-hover');
		}, function() {
			$(this).removeClass('ui-state-hover');
		});
	},
	
	/**
	 * Make buttons utilize the jQuery button state classes
	 *
	 */
	setupButtonStates: function() {
		// jQuery UI button states
		$(document).on('mouseover', '.ui-button', function() {
			var $t = $(this);
			$t.removeClass("ui-state-default").addClass("ui-state-hover");
			if($t.hasClass('ui-priority-secondary')) $t.toggleClass('xui-priority-secondary ui-priority-secondary');
			if($t.hasClass('pw-button-dropdown-main')) {
				$t.siblings('#pw-dropdown-toggle-' + $t.attr('id')).trigger('mouseover');
			}
		}).on('mouseout', '.ui-button', function() {
			var $t = $(this);
			$t.removeClass("ui-state-hover").addClass("ui-state-default");
			if($t.hasClass('xui-priority-secondary')) $t.toggleClass('xui-priority-secondary ui-priority-secondary');
			if($t.hasClass('pw-button-dropdown-main')) {
				$t.siblings('#pw-dropdown-toggle-' + $t.attr('id')).trigger('mouseout');
			}
		}).on('click', '.ui-button', function() {
			$(this).removeClass("ui-state-default").addClass("ui-state-active"); // .effect('highlight', {}, 100); 
		}).on('click', 'a > button', function() {
			var $a = $(this).parent();
			var target = $a.attr('target');
			if(typeof target != "undefined" && target == '_blank') {
				// skip
			} else {
				// make buttons with <a> tags click to the href of the <a>
				window.location = $a.attr('href');
			}
		});
	},

	/**
	 * Setup dropdown menus
	 * 
	 */
	setupDropdowns: function() {

		// whether or not dropdown positions are currently being monitored
		var dropdownPositionsMonitored = false;

		var hoveredDropdownAjaxItem;

		function setupDropdown() {

			var $a = $(this);
			var $ul;
		
			if($a.attr('data-pw-dropdown')) {
				// see if it is specifying a certain <ul>
				// first check if the selector matches a sibling
				$ul = $a.siblings($a.attr('data-pw-dropdown'));
				// if no match for sibling, check entire document
				if(!$ul.length) $ul = $($a.attr('data-pw-dropdown'));
			} else {
				// otherwise use the <ul> that is the sibling
				$ul = $a.siblings('.pw-dropdown-menu');
			}

			$ul.hide();
			$a.data('pw-dropdown-ul', $ul);

			if($a.is('button')) {
				if($a.find('.ui-button-text').length == 0) $a.button();
				if($a.attr('type') == 'submit') {
					$a.click(function() {
						$a.addClass('pw-dropdown-disabled');
						setTimeout(function() {
							$a.removeClass('pw-dropdown-disabled');
						}, 2000);
					});
				}
			} else {
				// $ul.css({ 'border-top-right-radius': 0 }); 
			}
			
			// hide nav when an item is selected to avoid the whole nav getting selected
			$ul.find('a').click(function() {
				$ul.hide();
				return true;
			});

			// prepend icon to dropdown items that themselves have more items
			$ul.find(".pw-has-items").each(function() {
				var $icon = $("<i class='pw-has-items-icon fa fa-angle-right ui-priority-secondary'></i>");
				$(this).prepend($icon);
			});

			// when the mouse leaves the dropdown menu, hide it
			$ul.mouseleave(function() {
				//if($a.is(":hover")) return;
				//if($a.filter(":hover").length) return;
				$ul.hide();
				$a.removeClass('hover');
			});
		}

		function mouseenterDropdownToggle(e) {
			
			var $a = $(this);
			var $ul = $a.data('pw-dropdown-ul');
			var delay = $a.hasClass('pw-dropdown-toggle-delay') ? 700 : 0;
			var lastOffset = $ul.data('pw-dropdown-last-offset');
			var timeout = $a.data('pw-dropdown-timeout');
			
			if($a.hasClass('pw-dropdown-toggle-click')) {
				if(e.type != 'mousedown') return;
				$a.removeClass('ui-state-focus');
			}
			if($a.hasClass('pw-dropdown-disabled')) return;

			timeout = setTimeout(function() {
				if($a.hasClass('pw-dropdown-disabled')) return;
				var offset = $a.offset();
				if(lastOffset != null) {
					if(offset.top != lastOffset.top || offset.left != lastOffset.left) {
						// dropdown-toggle has moved, destroy and re-create
						$ul.menu('destroy').removeClass('pw-dropdown-ready');
					}
				}

				if(!$ul.hasClass('pw-dropdown-ready')) {
					$ul.css('position', 'absolute');
					$ul.prependTo($('body')).addClass('pw-dropdown-ready').menu();
					var position = {my: 'right top', at: 'right bottom', of: $a};
					var my = $ul.attr('data-my');
					var at = $ul.attr('data-at');
					if(my) position.my = my;
					if(at) position.at = at;
					$ul.position(position).css('z-index', 200);
				}

				$a.addClass('hover');
				$ul.show();
				$ul.data('pw-dropdown-last-offset', offset);

			}, delay);

			$a.data('pw-dropdown-timeout', timeout);
		}

		function mouseleaveDropdownToggle() {

			var $a = $(this);
			var $ul = $a.data('pw-dropdown-ul');
			var timeout = $a.data('pw-dropdown-timeout');

			if(timeout) clearTimeout(timeout);
			setTimeout(function() {
				if($ul.filter(":hover").length) return;
				$ul.find('ul').hide();
				$ul.hide();
				$a.removeClass('hover');
			}, 50);

			if($("body").hasClass('touch-device')) {
				$(this).attr('data-touchCnt', 0);
			}
		}

		function hoverDropdownAjaxItem($a) {
			var fromAttr = $a.attr('data-from');
			if(!fromAttr) return;
			var $from = $('#' + $a.attr('data-from'));
			if($from.length > 0) setTimeout(function() {
				var fromLeft = $from.offset().left;
				//if($a.attr('id') == 'topnav-page-22') fromLeft--;
				var $ul = $a.closest('li').parent('ul');
				var thisLeft = $ul.offset().left;
				if(thisLeft != fromLeft) $ul.css('left', fromLeft);
			}, 500);
		}

		function mouseenterDropdownAjaxItem() {

			var $a = $(this);
			hoveredDropdownAjaxItem = $a;

			setTimeout(function() {

				// check if user wasn't hovered long enough for this to be their intent
				if(!hoveredDropdownAjaxItem) return;
				if(hoveredDropdownAjaxItem != $a) return;

				$a.addClass('pw-ajax-items-loaded');
				// var url = $a.attr('href');
				var url = $a.attr('data-json');
				var $ul = $a.siblings('ul');
				var setupDropdownHover = false;
				var $itemsIcon = $a.children('.pw-has-items-icon');
				$itemsIcon.removeClass('fa-angle-right').addClass('fa-spinner fa-spin');

				$.getJSON(url, function(data) {
					$itemsIcon.removeClass('fa-spinner fa-spin').addClass('fa-angle-right');

					// now add new event to monitor menu positions
					if(!dropdownPositionsMonitored && data.list.length > 10) {
						dropdownPositionsMonitored = true;
						setupDropdownHover = true;
						$(document).on('hover', 'ul.pw-dropdown-menu a', function() {
							hoverDropdownAjaxItem($(this));
						});
					}

					if(data.add) {
						var $li = $(
							"<li class='ui-menu-item add'>" +
							"<a href='" + data.url + data.add.url + "'>" +
							"<i class='fa fa-fw fa-" + data.add.icon + "'></i>" +
							data.add.label + "</a>" +
							"</li>"
						);
						$ul.append($li);
					}
					// populate the retrieved items
					$.each(data.list, function(n) {
						var icon = '';
						if(this.icon) icon = "<i class='ui-priority-secondary fa fa-fw fa-" + this.icon + "'></i>";
						var url = this.url.indexOf('/') === 0 ? this.url : data.url + this.url;
						var $li = $("<li class='ui-menu-item'><a href='" + url + "'>" + icon + this.label + "</a></li>");
						if(typeof this.className != "undefined" && this.className && this.className.length) {
							$li.addClass(this.className);
						}
						$ul.append($li);
					});

					$ul.addClass('navJSON')
					$ul.addClass('length' + parseInt(data.list.length));

					// trigger the first call
					hoverDropdownAjaxItem($a);

				}); // getJSON

			}, 250); // setTimeout

		}

		var $lastTouchClickItem = null;

		function touchClick(e) {
			var $item = $(this);
			var touchCnt = $item.attr('data-touchCnt');
			if($lastTouchClickItem && $item.attr('id') != $lastTouchClickItem.attr('id')) {
				$lastTouchClickItem.attr('data-touchCnt', 0);
			}
			$lastTouchClickItem = $item;
			if(!touchCnt) touchCnt = 0;
			touchCnt++;
			$item.attr('data-touchCnt', touchCnt);
			
			if(touchCnt == 2 || ($item.hasClass('pw-has-ajax-items') && !$item.closest('ul').hasClass('topnav'))) {
				var href = $item.attr('href');
				$item.attr('data-touchCnt', 0);
				if(typeof href != "undefined" && href.length > 1) {
					return true;
				} else {
					$item.mouseleave();
				}
			} else {
				var datafrom = $item.attr('data-from');	
				if(typeof datafrom == "undefined") var datafrom = '';
				if(datafrom.indexOf('topnav') > -1) {
					var from = datafrom.replace('topnav-', '') + '-';
					$("a.pw-dropdown-toggle.hover:not('." + from + "')").attr('data-touchCnt', 0).mouseleave();
				}
				$item.mouseenter();
			}
			return false;
		}

		function init() {

			if($("body").hasClass('touch-device')) {
				$(document).on("touchstart", "a.pw-dropdown-toggle, a.pw-has-items", touchClick);
			}

			$(".pw-dropdown-menu").on("click", "a:not(.pw-modal)", function(e) {
				e.stopPropagation();
			});

			$(".pw-dropdown-toggle").each(setupDropdown);

			$(document)
				.on('mousedown', '.pw-dropdown-toggle-click', mouseenterDropdownToggle)
				.on('mouseenter', '.pw-dropdown-toggle:not(.pw-dropdown-toggle-click)', mouseenterDropdownToggle)
				.on('mouseleave', '.pw-dropdown-toggle', mouseleaveDropdownToggle)
				.on('mouseenter', '.pw-dropdown-menu a.pw-has-ajax-items:not(.pw-ajax-items-loaded)', mouseenterDropdownAjaxItem) // navJSON
				.on('mouseleave', '.pw-dropdown-menu a.pw-has-ajax-items', function() { // navJSON
					hoveredDropdownAjaxItem = null;
				});
		}

		init();
		
	} // setupDropdowns
	
};

if(typeof ProcessWire != "undefined") {
	ProcessWire.confirm = function(message, func) {
		if(typeof vex != "undefined") {
			vex.dialog.confirm({
				message: message,
				callback: function(v) {
					if(v) func();
				}
			});
		} else {
			if(confirm(message)) func();
		}
	};

	ProcessWire.alert = function(message, allowMarkup) {
		if(typeof allowMarkup == "undefined") var allowMarkup = false;
		if(typeof vex != "undefined") {
			if(allowMarkup) {
				vex.dialog.alert({unsafeMessage: message});
			} else {
				vex.dialog.alert(message);
			}
		} else {
			alert(message);
		}
	};

	ProcessWire.prompt = function(message, placeholder, func) {
		if(typeof vex == "undefined") {
			alert("prompt function requires vex");
			return;
		}
		vex.dialog.prompt({
			message: message,
			placeholder: placeholder,
			callback: func
		})
	};
}

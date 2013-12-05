//GLOBAL
// Variables used across this file
var currentContentID = '#health-overview';

// NAVIGATION
// Handles menu item clicks and page navigation
$( 'ul.health-navigation li a').click(function() {
	// Only do stuff if the button clicked isn't already active
	if (!$(this).hasClass('health-active-link')) {
		// Set the previously-active button to inactive
		$(this).parent().parent().children().each(function() {
			$(this).children().removeClass('health-active-link');
			var className = $(this).children().attr('class');
			var activeSuffix = '-active';
			if (className.length > activeSuffix.length) {
				var suffixStartPos = className.length - activeSuffix.length;
				if (className.substring(suffixStartPos, className.length) == activeSuffix) {
					// Currently selected menu item
					var inactiveClassName = className.substring(0, suffixStartPos);
					$(this).children().removeClass();
					$(this).children().addClass(inactiveClassName);
					currentContentID = '#' + inactiveClassName.substring(4, inactiveClassName.length);
				}
			}
		});
		// Set the clicked button to active
		var buttonName = $(this).attr('class');
		$(this).removeClass(buttonName);
		var activeButtonName = buttonName + '-active';
		$(this).addClass(activeButtonName);
		$(this).addClass('health-active-link');
		// Show the new content
		newContentID = '#' + buttonName.substring(4, buttonName.length);
		$( currentContentID ).fadeOut(0);
		$( newContentID ).fadeIn(500);	
	}
});

// VITALS

// Vital overlay navigation
$( 'ul.stream-nav li a').click(function() {
	menuNavigate($(this));
});

function menuNavigate(el) {
	// Only do stuff if the button clicked isn't already active
	if (!el.parent().hasClass('stream-active')) {
		// Make previously-active button inactive
		var newClassName = el.parent().attr("class").split(' ')[1];
		var oldClassName;
		var myactivity;
		$('ul.stream-nav').each(function() {
			$(this).children().each(function() {
				if ($(this).hasClass('stream-active')) {
					oldClassName = $(this).attr("class").split(' ')[1];
					$(this).removeClass('stream-active');
				}
			});
		});
		// Make clicked button active
		el.parent().addClass('stream-active');
		$( '#stream-' + newClassName ).fadeIn(500);
		$( '#stream-' + oldClassName ).fadeOut(0);
	}
}

// D3 Variables
var xScaleFunctions = {};
var xHistScaleFunctions = {};
var yScaleFunctions = {};
var w = 600;
var h = 75;
var barSpacing = 2;
var barHeight = 15;
var barYPos = 36;
var padding = 16;
var chartPaddingBottom = 24;
var smileyWidth = 33;
var smileyHeight = 36;
var margin = {top: 20, right: 40, bottom: 40, left: 40};
var histogramHeight = 350 - margin.top - margin.bottom;
var histogramWidth = w - margin.left - margin.right;

// Load some D3 stuff at the way beginning
$( document ).ready(function() {
	//$(".vital-overlay").niceScroll({cursorcolor:"#FFF",cursoropacitymax:0, horizrailenabled:false});
	//initializeData();
});

$(window).load(function() {
	// Page is loaded
	$("body").fadeIn(800);
});

function initializeData() {

	var vitals = getVitalRanges();
	setRiskLevels(vitals);
	vitalData = {};
	d3.csv("../static/data/histogram-data.csv", function(data) {
		for (i = 0; i < vitals.length; i++) {
			vital = vitals[i];
			for (j = 0; j < vital.ranges.length; j++) {
				subVital = vital.ranges[j];
		    	dataset = data.map(function(d) { return parseFloat(d[vital.id + "-" + subVital.name]); });
		    	vitalData[ vital.id + "-" + subVital.name ] = dataset;
			}
		}
   		loadVitalVisuals();
	});
}

function setRiskLevels(vitals) {
	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];
   		var index = 0;
		$('.vital-overlay-content .' + vital.id).children().each(function() {
			ranges = vital.ranges[index];
		   	for (k = 0; k < ranges.value.length; k++) {
	   			cutoff = ranges.value[k][0];
	   			if ($(this).html() < cutoff) {
	   				setRiskLevel(vital, ranges.value[k][2]);
	   				break;
	   			}
		   	}
	   		index += 1;
		});
	}
}

function setRiskLevel(vital, risk) {
	$('span.' + vital.id).addClass(risk);
	$('.vital-chart.' + vital.id).addClass(risk);
	$('.vital-histogram.' + vital.id).addClass(risk);
	$('.vital-overlay.' + vital.id).addClass(risk + "-border-top");
	$('.vital.' + vital.id).addClass(risk + "-border-left");
	rindex=0;
	$('.vital-overlay-value.' + vital.id).children().each(function() {
		$(this).addClass(risk);
		$(this).addClass(vital.ranges[rindex].name);
		rindex += 1;
	});
}

// Handle vital selections and the vital overlay
$( ".vital" ).click(function() {
	var vo = $(this).children('.vital-overlay');
    vo.fadeIn(500, function() {
    	voc = vo.children('.vital-overlay-content');
    	classes = voc.children('.vital-chart').attr('class').split(' ');
    	vital = classes[1];
    	vitalRisk = classes[2];
    	vov = voc.children('.vital-overlay-value');
    	var vitalValues = [];
    	vov.children().each(function() {
    		vitalValues.push($(this).html());
    	});
    	animateVital(vital, vitalRisk, vitalValues);
		animateHistogram(vital, vitalRisk, vitalValues);
    });
});


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
$( 'ul.vital-nav-menu li a').click(function() {
	vitalNavigate($(this), "vital");
});

$( '.subvital-menu a').click(function() {
	vitalNavigate($(this), "subvital");
});

$( 'a.accept-challenge').click(function() {
	$( '#dark-bg' ).fadeIn();
	$( '.popup' ).fadeIn();
});

function vitalNavigate(el, str) {
	// Only do stuff if the button clicked isn't already active
	if (!el.hasClass(str + '-nav-item-active')) {
		// Make previously-active button inactive
		var newClassName = el.attr("class");
		var oldVital;
		el.parent().parent().children().each(function() {
			if ($(this).children().attr("class") != newClassName) {
				if ($(this).html() != "Page:") {
					$(this).children().removeClass(str + '-nav-item-active');
					var className = $(this).children().attr("class");
					className = className.split(' ');
					oldVital = className[0];
					className = '.' + className[1].substring(0, className[1].length-5);
					oldClassName = className;
				}
			}
		});
		// Get class name of element link points to
		var className = el.attr("class");
		className = className.split(' ');
		// Make clicked button active
		el.addClass(str + '-nav-item-active');
		var newVital = className[0];
		className = '.' + className[1].substring(0, className[1].length - 5);
		$( '.' + newVital + className ).fadeIn(500);
		$( '.' + oldVital + oldClassName).fadeOut(0);
		if (str == "subvital") {
			$( '.' + newVital + '.vital-overlay-nav' ).fadeIn(500);
			$( '.' + oldVital + '.vital-overlay-nav' ).fadeOut(0);
		}
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
	$(".vital-overlay").niceScroll({cursorcolor:"#FFF",cursoropacitymax:0, horizrailenabled:false});
	initializeData();
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
$( ".vital-overlay" ).click(function() {
	event.stopPropagation();
});

$( ".close-overlay" ).click(function() {
	//$(this).parent().children('.vital-overlay-content').show();
	//$(this).parent().children('.vital-overlay-historical').hide();
	$(this).parent().fadeOut(300);
	event.stopPropagation();
});

$( ".close-popup" ).click(function() {
	$(this).parent().fadeOut(300);
	$('#dark-bg').fadeOut(300);
	event.stopPropagation();
});

var animatedVitals = [];
var animatedHistograms = [];

function animateVital(vital, vitalRisk, values) {
	// the following doesn't work for IE 8 and below
	if (animatedVitals.indexOf(vital) == -1) {
		index = 0;
		scaled_values = [];		
		d3.selectAll('.' + vital + ' image.chart').each(function() {
			img = d3.select(this);
			vitalValue = values[index];
			className = img.attr("class");
			subVitalName = className.split(' ')[1];
			scaledValue = xScaleFunctions[vital + '-' + subVitalName](vitalValue);
		 	img.transition()
		 		.duration(1000)
		 		.attr("x", scaledValue - smileyWidth/2);
		 	index += 1;
		});
		animatedVitals.push(vital);
	}
}

function animateHistogram(vital, vitalRisk, values) {
	if (animatedHistograms.indexOf(vital) == -1) {
		//riskString = getRangeRisk(vitalValue, ranges.value, minData, 1);
		index = 0;
		d3.selectAll('.' + vital + ' svg.histogram').each(function() {
			svg = d3.select(this);
			bar = svg.selectAll(".bar");
			className = svg.attr("class");
			subVitalName = className.split(' ')[1];
			vitalValue = values[index];
			xScale = xHistScaleFunctions[vital + '-' + subVitalName];
			yScale = yScaleFunctions[vital + '-' + subVitalName];
			animateHistogramBars(svg, yScale);
			animateHistogramPerson(bar, yScale);
		    index += 1;
		});
		animatedHistograms.push(vital);
	}
}

function getSmileyUrl(vitalRisk) {
	baseUrl = '../static/css/images/smiley-';
	return baseUrl + vitalRisk + '.png';
}

function addSmileyToChart(vitalId, subVitalName) {
	var risk;
    $('.vital-overlay-value.' + vitalId).children().each(function() {
    	risk = $(this).attr('class').split(' ')[1];
    });
	imgUrl = getSmileyUrl(risk);
	subVitalClassName = '.' + subVitalName;
	if (subVitalName == "") {
		subVitalClassName = '';
	}

	d3.selectAll('.' + vitalId + ' svg.chart' + subVitalClassName).each(function() {
		svg = d3.select(this);
		svg.append("image")
			.attr("x", margin.left - smileyWidth/2)
			.attr("y", barYPos - smileyHeight)
			.attr("xlink:href", imgUrl)
			.attr("src", imgUrl)
			.attr("width", smileyWidth)
			.attr("height", smileyHeight)
			.attr("class", svg.attr("class"));
	});
}

function getPersonUrl(vitalRisk) {
	baseUrl = '../static/css/images/person-';
	return baseUrl + vitalRisk + '.png';
}

function addPersonToHistogram(bar, vitalId, subVitalName) {

	// subVitalClassName = '.' + subVitalName;
	// if (subVitalName == '') {
	// 	subVitalClassName = ''
	// }
    child = $('.vital-overlay-value.' + vitalId).children();
   	risk = child.attr('class').split(' ')[1];
  	value = child.html();
	imgUrl = getPersonUrl(risk);
	personWidth = 17;
	personHeight = 43;
	bar.filter(function(d) {
    		xBucketMax = d.x + d.dx;
    		xBucketMin = d.x;
    		return (xBucketMin <= value) && (xBucketMax > value);
    	}).append("image")
    	.attr("x", function(d) {
    		return xHistScaleFunctions[vitalId + "-" + subVitalName](d.dx/2) - personWidth / 2;
    	})
    	.attr("y", histogramHeight - personHeight)
    	.attr("xlink:href", imgUrl)
		.attr("src", imgUrl)
		.attr("width", personWidth)
		.attr("height", personHeight);
}

function animateHistogramBars(svg, yScale) {
    svg.selectAll("rect")
		.transition()
		.duration(1000)
    	.attr("height", function(d) {
        	return histogramHeight - yScale(d.y);
    	})
    	.attr("y", function(d) {
    		return yScale(d.y);
    	});
}

function animateHistogramPerson(bar, yScale) {
	bar.selectAll("image")
		.transition()
		.duration(1000)
		.attr("y", function(d) {
			return yScale(d.y)-personHeight;
		});
}

function loadVitalVisuals() {

	var vitals = getVitalRanges();

	for (i = 0; i < vitals.length; i++) {
		vital = vitals[i];

		for (j = 0; j < vital.ranges.length; j++) {
			ranges = vital.ranges[j];
			loadVitalCharts(vital, ranges);
			loadVitalHistograms(vital, ranges);
			loadVitalHistorical(vital, ranges)
		}
		// for (j = 0; j < vital.ranges.length; j++) {
		// 	ranges = vital.ranges[j];
		// 	loadVitalHistograms(vital, ranges);
		// }
		// loadVitalHistorical(vital, ranges)
	}
}

function loadVitalCharts(vital, ranges) {

	dataset = vitalData[vital.id + "-" + ranges.name];
	minData = d3.min(dataset);
    maxData = d3.max(dataset);

    var subVital = '';
    if (ranges.name != "") {
    	subVital = '.' + ranges.name
    }

	var svg = d3.select('.vital-chart.' + vital.id + subVital)
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.attr("class", "chart " + ranges.name);

	var xScalePos = d3.scale.linear()
							.domain([minData, maxData])
							.range([margin.left, w - margin.left]);

	var xScaleVal = d3.scale.linear()
							.domain([0, maxData - minData])
							.range([margin.left, w - margin.left]);

	xScaleFunctions[vital.id + '-' + ranges.name] = xScalePos;

	var lastVal1 = minData;
	var lastVal2 = minData;

	svg.selectAll("rect")
		.data(ranges.value)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			xVal = xScalePos(lastVal1);
			lastVal1 = d[0];
			return xVal;
		})
		.attr("y", barYPos)
		.attr("width", function(d) {
			wVal = xScalePos(Math.min(d[0], maxData)) - xScalePos(lastVal2) - barSpacing;
			lastVal2 = d[0];
			return wVal;
		})
		.attr("height", barHeight)
		.attr("fill", function(d) {
			return d[1];
		});

	// svg.append("text")
	// 	.attr("class", "vital-stats-label")
	// 	.attr("x", padding)
	// 	.attr("y", barYPos - 5)
	//     .text(ranges.name);

	var xAxis = d3.svg.axis()
						.scale(xScalePos)
						.tickValues(xScalePos.domain())
						.orient("bottom");
	svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (h - chartPaddingBottom) + ")")
			.call(xAxis);

	addSmileyToChart(vital.id, ranges.name)

}

// Called from function that loads data into 'dataset' variable
function loadVitalHistograms(vital, ranges) {

	dataset = vitalData[vital.id + "-" + ranges.name];
	var formatCount = d3.format(",.0f");
	var formatAsPercentage = d3.format("1%");
	//var formatAsThousands = d3.format("1000r")

    minData = d3.min(dataset);
    maxData = d3.max(dataset);

    var xData = d3.scale.linear()
        .domain([ minData , maxData ])
        .range([ 0, histogramWidth ]);

    var x = d3.scale.linear()
        .domain([ 0, maxData - minData ])
        .range([ 0, histogramWidth ]);

    xHistScaleFunctions[vital.id + '-' + ranges.name] = x;

    data = d3.layout.histogram()
        .bins(xData.ticks(15))
        (dataset);

    // var y = d3.scale.linear()
    //     .domain([0, d3.max(data, function(d) { 
    //         return d.y / dataset.length; 
    //     })])
    //     .range([histogramHeight, 0]);
    var y = d3.scale.linear()
    		.domain([0, d3.max(data, function(d) {
    			return d.y;
    		})])
    		.range([histogramHeight, 0]);

    yScaleFunctions[vital.id + '-' + ranges.name] = y;

    var xAxis = d3.svg.axis()
        .scale(xData)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(4)
        //.tickFormat(formatAsThousands);

    var subVital = '';
    if (ranges.name != "") {
    	subVital = '.' + ranges.name
    }

    var svg = d3.select('.vital-histogram.' + vital.id + subVital).append("svg")
        .attr("width", histogramWidth + margin.left + margin.right)
        .attr("height", histogramHeight + margin.top + margin.bottom)
        .attr("class", "histogram " + ranges.name)
      	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var bar = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { 
            return "translate(" + xData(d.x) + ", 0)";
        });

    bar.append("rect")
        .attr("x", 1)
        .attr("y", histogramHeight)
        .attr("width", x(data[0].dx) - 1)
        .attr("height", 0)
        .attr("fill", function(d) {
            var xBucket = d.x + d.dx;
            var threshold0 = ranges.value[0][0];
            var threshold1 = ranges.value[1][0];
            var threshold2 = ranges.value[2][0];
            if (xBucket <= (threshold0)) {
                return "#F7A649";
            } else if(xBucket <= threshold1) {
                return "#78BB66";
            } else if(xBucket <= threshold2) {
                return "#F7A649";
            } else {
                return "#ED5A69";
            }
        });

    svg.append("g")
        .attr("class", "x histogram-axis")
        .attr("transform", "translate(0," + histogramHeight + ")")
        .call(xAxis);

    svg.append("text")
        .attr("class", "x histogram-label")
        .attr("text-anchor", "middle")
        .attr("x", histogramWidth / 2)
        .attr("y", histogramHeight + 35)
        .text(ranges.name.toUpperCase() + " " + vital.name.toUpperCase());

    svg.append("g")
        .attr("class", "y histogram-axis")
        .call(yAxis);

    svg.append("text")
        .attr("class", "y histogram-label")
        .attr("dy", ".71em")
        .attr("y", 6)
	    .style("text-anchor", "end")
        .text("NUMBER OF PEOPLE LIKE YOU");

    addPersonToHistogram(bar, vital.id, ranges.name);

}

function loadVitalHistorical(vital, subVital) {

	var margin = {top: 20, right: 30, bottom: 30, left: 40},
	    width = 620 - margin.left - margin.right,
	    height = 350 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%Y%m%d").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var color = d3.scale.category10();

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    .tickFormat(d3.time.format("%b"));

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .interpolate("basis")
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.vital); });

	var svg = d3.select(".vital-overlay-historical." + vital.id + "-" + subVital.name).append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv("static/data/" + vital.id + "-" + subVital.name + ".tsv", function(error, data) {
	  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

	  data.forEach(function(d) {
	    d.date = parseDate(d.date);
	  });

	  var cities = color.domain().map(function(name) {
	    return {
	      name: name,
	      values: data.map(function(d) {
	        return {date: d.date, vital: +d[name]};
	      })
	    };
	  });

	  x.domain(d3.extent(data, function(d) { return d.date; }));

	  y.domain([
	    d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.vital; }); }),
	    d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.vital; }); })
	  ]);

	  svg.append("g")
	      .attr("class", "historical x-axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "historical y-axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text(subVital.name + " " + vital.name + " (" + vital.unit + ")");

	  var city = svg.selectAll(".city")
	      .data(cities)
	    .enter().append("g")
	      .attr("class", "city");

	  city.append("path")
	      .attr("class", "historical-line")
	      .attr("d", function(d) { return line(d.values); })
	      .style("stroke", function(d) { return color(d.name); });

	  // city.append("text")
	  //     .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
	  //     .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.vital) + ")"; })
	  //     .attr("x", 3)
	  //     .attr("dy", ".35em")
	  //     .attr("width", "20px")
	  //     .text(function(d) { return d.name; });
	});
}

function getRangeRisk(value, ranges, min, colorOrRisk) {
	for (i=0; i<ranges.length; i++) {
		if (value <= ranges[i][0]) {
			if (colorOrRisk == 0) {
				// return color
				return ranges[i][1];
			} else {
				return getRangeRiskString(i);
			}
			if ((i == ranges.length - 1) && (value > ranges[i][0])) {
				if (colorOrRisk == 0) {
					return ranges
				} else {
					return getRangeRiskString(i);
				}
			}
		}
	}
}

function getRangeRiskString(id) {
	if (id == 0 || id == 2) {
		return "medium-risk";
	} else if (id == 1) {
		return "low-risk";
	} else if (id == 3) {
		return "high-risk"
	}
}

function getSubVitalRange(subvital) {
	var vitalRanges = getVitalRanges();
    for (i=0; i < vitalRanges.length; i++) {
    	var vitalRangeID = vitalRanges[i].id;
    	if (vitalRangeID == vital) {
    		for (j=0; j < vitalRanges[i].ranges.length; j++) {
    			if (vitalRanges[i].ranges[j].name == subvital) {
    				return vitalRanges[i].ranges[j];
    			}
    		}
    	}
    }
}

function getVitalRanges() {
	vr = [
			{ 	
				id: 'bloodpressure',
				name: 'blood pressure',
				unit: 'mmHg',
				ranges:
					[
						{
							name: 'systolic',
							value: 
								[
									[90, "#F4A731",'medium-risk'], [120, "#78BB66",'low-risk'], 
									[140, "#F4A731", 'medium-risk'], [800, "#ED5A69", 'high-risk']
								]
						},
						{
							name: 'diastolic',
							value:
								[
									[60, "#F4A731", 'medium-risk'], [80, "#78BB66", 'low-risk'], 
									[90, "#F4A731", 'medium-risk'], [700, "#ED5A69", 'high-risk']
								]
						}
					]
			},
			// {
			// 	id: 'bloodglucose',
			// 	ranges:
			// 		[
			// 			{
			// 				name: '',
			// 				value: 
			// 					[
			// 						[70, "#F4A731"], [150, "#78BB66"], 
			// 						[180, "#F4A731"], [280, "#ED5A69"]
			// 					]
			// 			}
			// 		]
			// },
			{
				id: 'cholesterol',
				name: 'cholesterol',
				unit: 'mg/dL',
				ranges:
					[
						{
							name: 'total',
							value:
								[
									[160,'#F4A731','medium-risk'], [200,'#78BB66','low-risk'], 
									[240,'#F4A731','medium-risk'],[700,'#ED5A69','high-risk']
								]
						},
						// {
						// 	name: 'hdl',
						// 	value:
						// 		[
						// 			[25,'#ED5A69'], [35,'#F4A731'], 
						// 			[55,'#78BB66'], [700,'#F4A731']
						// 		]
						// },
						{
							name: 'ldl',
							value:
								[
									[80,'#F4A731','medium-risk'], [130,'#78BB66','low-risk'], 
									[160,'#F4A731','medium-risk'], [700, '#ED5A69','high-risk']
								]
						}
					]
			},
			{
				id: 'bmi',
				name: 'bmi',
				unit: 'kg/m²',
				ranges:
					[
						{
							name: '',
							value: 
								[
									[18.5, "#F4A731",'medium-risk'], [25, "#78BB66",'low-risk'], 
									[30, "#F4A731",'medium-risk'], [700, "#ED5A69",'high-risk']
								]
						}
					]
			}
		];
	return vr;
}

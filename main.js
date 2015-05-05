Date.prototype.formatDate = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
};

var ds;

d3.json("data.json", function(error, data) {
	if (error) {
		console.log(error);
	} else {
		ds = _.filter(data, function(element) {
			return element["feedName"] === "wifi_session";
		});
	}
	buildLine();
})

var buildLine = function() {
	var h = 500;
	var w = 1200;
	var margin = {
		top: 40,
		right: 40,
		bottom: 80,
		left: 80
	};


	//format to parse the day field in our data.
	var format = d3.time.format("%m/%d/%y");

	//calcualte the ceiling for data plot. Increase 30% for padding.
	var yCeiling = d3.max(ds, function(d) {
		return parseInt(d.rowDailyCount);
	});
	yCeiling = Math.floor(yCeiling * 1.3);

	/************ scale functions *************/

	var xScale = d3.time.scale()
		.domain(d3.extent(ds.map(function(d) {
			return format.parse(d.day);
		}))).range([0, w]);

	var yScale = d3.scale.linear()
		.domain([0, yCeiling])
		.range([h - margin.bottom, margin.top]);

	var xScale2 = d3.time.scale()
		.domain(xScale.domain()).range([0, w]);

	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(8)
		.tickSize(-w + margin.right + margin.left, 0, 0)
		.tickPadding(8);;

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient('bottom')
		.ticks(d3.time.days, 1)
		.tickFormat(d3.time.format("%b %d"))
		.tickSize(-h + margin.top + margin.bottom, 0, 0)
		.tickPadding(8);

	/************ area function *************/
	var areaBandsFunc = d3.svg.area().interpolate("monotone");

	areaBandsFunc.x(function(d, i) {
		return xScale(format.parse(d.day));
	});

	areaBandsFunc.y0(function(d) {
		var dayformat = d3.time.format("%a");
		var day = dayformat(format.parse(d.day));
		return yScale(averageDayVal[day]) - 50;
	});
	areaBandsFunc.y1(function(d) {
		var dayformat = d3.time.format("%a");
		var day = dayformat(format.parse(d.day));
		return yScale(averageDayVal[day]) + 50;
	});

	/************ line functions *************/
	var lineFunc = d3.svg.line()
		.x(function(d, i) {
			return xScale(format.parse(d.day));
		})
		.y(function(d) {
			return yScale(d.rowDailyCount);
		})
		.interpolate("monotone");

	var averageDayVal = {
		"Mon": 5300000,
		"Tue": 6300000,
		"Wed": 7300000,
		"Thu": 4800000,
		"Fri": 6300000,
		"Sat": 7700000,
		"Sun": 8200000
	}

	var averageLineFunc = d3.svg.line()
		.x(function(d, i) {
			return xScale(format.parse(d.day));
		})
		.y(function(d) {
			var dayformat = d3.time.format("%a");
			var day = dayformat(format.parse(d.day));
			return yScale(averageDayVal[day]);
		})
		.interpolate("monotone");

	var meanLineFunc = d3.svg.line()
		.x(function(d, i) {
			return xScale(format.parse(d.day));
		})
		.y(function(d) {
			return yScale(6000000);
		})
		.interpolate("linear");

	var svg = d3.select("body").append("svg").attr('class', 'chart').attr({
		width: w,
		height: h
	});

	/********* create focus *********/
	var focus = svg.append("g")
		.attr("transform", "translate(" + 0 + "," + 0 + ")");

	//1.draw tolerance interval.
	focus.append("path").datum(ds).attr({
		d: areaBandsFunc,
		"stroke": "#E4E4E4",
		"stroke-width": 1,
		"fill": "#E4E4E4",
		"class": "area",
		"opacity": 0.6,
		"id": "tolerance-int"
	});

	//draw a white layer prevent the data graph bleed.
	/*
    svg.append('rect')
        .attr("width", w)
        .attr("height", "200")
        .attr("transform", 'translate(0, ' + (h - margin.bottom) + ')')
        .attr("fill", "white");
	*/

	//2.draw vertical grid.

	focus.append('g')
		.attr('class', 'x axis grid')
		.attr('transform', 'translate(0, ' + (h - margin.bottom) + ')')
		.call(xAxis);

	//3.draw horizontal grid.
	focus.append('g')
		.attr('class', 'y axis grid')
		.attr('transform', "translate(" + margin.left + ",0)")
		.call(yAxis);

	//4.draw average line.
	focus.append("path").datum(ds).attr({
		d: averageLineFunc,
		"stroke": "gray",
		"stroke-width": 2,
		"fill": "none",
		"opacity": "0.3",
		"class": "averageline area",
		"id": "average-line"
	});

	//5.draw mean line.
	focus.append("path").datum(ds).attr({
		d: meanLineFunc,
		"stroke": "gray",
		"stroke-width": 2,
		"fill": "none",
		"opacity": "0.3",
		"class": "area",
		"id": "mean-line"
	}).style("stroke-dasharray", ("3, 3"));

	//6.draw main line.
	focus.append("path").datum(ds).attr({
		d: lineFunc,
		"stroke": "black",
		"stroke-width": 2.5,
		"fill": "none",
		"class": "area",
		"id": "main-line"
	});

	//7.draw data point circle.

	focus.selectAll("circle")
		.data(ds)
		.enter()
		.append("circle")
		.attr({
			"class": "area",
			cx: function(d, i) {
				return xScale(format.parse(d.day));
			},
			cy: function(d) {
				return yScale(d.rowDailyCount);
			},
			r: function(d) {
				if (d["indicator"] === "N") {
					return 3
				} else {
					return 4
				}
			},
			"fill": function(d) {
				if (d["indicator"] === "N") {
					return "black"
				} else {
					return "red"
				}
			},
			"stroke": "black"

		});

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", w)
		.attr("height", h)
		.attr('transform', "translate(" + margin.left + "," + margin.top + ")");

	/********* create context *********/

	//create context.
	var margin2 = {
		top: 450,
		right: 20,
		bottom: 20,
		left: 20
	};

	var height2 = 15;

	var xAxis2 = d3.svg.axis()
		.scale(xScale)
		.orient('bottom')
		.ticks(d3.time.month, 1)
		.tickFormat(d3.time.format(""))
		.tickSize(10, 0, 0)
		.tickPadding(8);

	var xAxis3 = d3.svg.axis()
		.scale(xScale)
		.orient('bottom')
		.ticks(d3.time.year, 1)
		.tickFormat(d3.time.format("%Y"))
		.tickSize(15, 0, 0)
		.tickPadding(5);

	var brush = d3.svg.brush()
		.x(xScale2)
		.extent([format.parse(ds[50].day), format.parse(ds[57].day)])
		.on("brush", brushed);


	var zoom = d3.behavior.zoom().x(xScale).scaleExtent([0, 10])
		.on("zoom", zoomed);

	function roundToNearDate(date) {
		var roundDate = new Date(date.getYear(), date.getMonth(), date.getDate(), 0, 0, 0);
		return roundDate;
	}

	var selectedHandle;

	function resetTimeTicks(extent, xAxis) {
		var one_day = 1000 * 60 * 60 * 24;
		var difference_ms = extent()[1].getTime() - extent()[0].getTime();
		var dateDiff = Math.round(difference_ms / one_day);
		if (dateDiff > 30) {
			xAxis.ticks(d3.time.month, 1);
			xAxis.tickFormat(d3.time.format('%B'));
		} else {
			xAxis.ticks(d3.time.day, 1);
			xAxis.tickFormat(d3.time.format("%b %d"));
		}
		return xAxis;
	}

	function attachEventToHandlers() {
		d3.select(".resize.w")
			.on("mousedown", function(d, i) {
				selectedHandle = "w"
			});
		d3.select(".resize.e")
			.on("mousedown", function(d, i) {
				selectedHandle = "e"
			});
	}

	function brushed() {
		xScale.domain(brush.empty() ? xScale2.domain() : brush.extent());
		xAxis = resetTimeTicks(brush.extent, xAxis);
		focus.select("#tolerance-int").attr("d", areaBandsFunc);
		focus.select("#average-line").attr("d", averageLineFunc);
		focus.select("#mean-line").attr("d", meanLineFunc);
		focus.select("#main-line").attr("d", lineFunc);
		focus.selectAll("circle")
			.attr({
				cx: function(d, i) {
					return xScale(format.parse(d.day));
				}
			});
		focus.select(".x.axis").call(xAxis);
		zoom.x(xScale);

		var extent0 = brush.extent(),
			extent1;

		extent1 = extent0.map(d3.time.day.round);

		// if empty when rounded, use floor & ceil instead
		if (extent1[0] >= extent1[1]) {
			extent1[0] = d3.time.day.floor(extent0[0]);
			extent1[1] = d3.time.day.ceil(extent0[1]);

		}

		//reset to minimal extent.
		var minExtent = 1000 * 60 * 60 * 24 * 7;
		var width = extent0[1].getTime() - extent0[0].getTime();
		if (width < minExtent) {
			if (selectedHandle == "e") {
				extent1[1].setDate(extent1[0].getDate() + 7);
			} else {
				extent1[0].setDate(extent1[1].getDate() - 7);
			}
		}

		d3.select(this).call(brush.extent(extent1));
		attachEventToHandlers();
	}


	var context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

	context.append("g")
		.attr("class", "x axis2")
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis3);

	context.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height2 + ")")
		.call(xAxis2);

	context.append("g")
		.attr("class", "x brush")
		.call(brush)
		.selectAll("rect")
		.attr("y", 0)
		.attr("height", height2);

	//----------Setup zoom-------------------------------------------------------------

	function zoomed() {
		//check if domain is okay
		if (xScale.domain()[0] < xScale0.domain()[0]) {
			zoom.translate([0, 0]);
		}
		focus.select("#tolerance-int").attr("d", areaBandsFunc);
		focus.select("#average-line").attr("d", averageLineFunc);
		focus.select("#mean-line").attr("d", meanLineFunc);
		focus.select("#main-line").attr("d", lineFunc);
		focus.selectAll("circle")
			.attr({
				cx: function(d, i) {
					return xScale(format.parse(d.day));
				}
			});

		focus.select(".x.axis").call(xAxis);
		//Find extent of zoomed area, what's currently at edges of graphed region
		var brushExtent = [xScale.invert(0), xScale.invert(w)];
		context.select(".brush").call(brush.extent(brushExtent));
	}

	function reset() {
		zoom.scale(1);
		zoom.translate([0, 0]);
	}

	xScale0 = xScale.copy();

	zoom.x(xScale);

	attachEventToHandlers();

	focus.append("rect")
		.attr("class", "pane")
		.attr("width", w)
		.attr("height", h)
		.call(zoom);

	brushed();

};

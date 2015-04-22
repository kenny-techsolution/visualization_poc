/*
TODO:
-dynamic resizing
-time selector
*/
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
    var w = 25000;
    var margin = {
        top: 40,
        right: 40,
        bottom: 40,
        left: 80
    };

	//format to parse the day field in our data.
    var format = d3.time.format("%m/%d/%y");
	
	//calcualte the ceiling for data plot. Increase 30% for padding.
    var yCeiling = d3.max(ds, function(d) {
        return parseInt(d.rowDailyCount);
    });
    yCeiling = Math.floor(yCeiling * 1.3);

    var yScale = d3.scale.linear()
        .domain([0, yCeiling])
        .range([h - margin.bottom, margin.top]);

    var xScale = d3.time.scale()
        .domain([format.parse(ds[0].day), format.parse(ds[ds.length - 1].day)])
        .rangeRound([margin.left, w - margin.right]);

    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(8)
        .tickSize(-w + margin.right + margin.left, 0, 0)
        .tickPadding(8);;

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(d3.time.days, 1)
        .tickFormat(d3.time.format('%a %m/%d'))
        .tickSize(-h + margin.top + margin.bottom, 0, 0)
        .tickPadding(8);

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

	//draw tolerance interval.
    var areaChart = svg.append("path").attr({
        d: areaBandsFunc(ds),
        "stroke": "#E4E4E4",
        "stroke-width": 1,
        "fill": "#E4E4E4",
        "opacity": 0.6
    });

	//draw a white layer prevent the data graph bleed.
    svg.append('rect')
        .attr("width", w)
        .attr("height", "200")
        .attr("transform", 'translate(0, ' + (h - margin.bottom) + ')')
        .attr("fill", "white");

	//draw vertical grid.
    svg.append('g')
        .attr('class', 'x axis grid')
        .attr('transform', 'translate(0, ' + (h - margin.bottom) + ')')
        .call(xAxis);

	//draw horizontal grid.
    svg.append('g')
        .attr('class', 'y axis grid')
        .attr('transform', "translate(" + margin.left + ",0)")
        .call(yAxis);
		
	//draw average line.
    var averageLineChart = svg.append("path").attr({
        d: averageLineFunc(ds),
        "stroke": "gray",
        "stroke-width": 2,
        "fill": "none",
        "opacity": "0.3"
    });

	//draw mean line.
    var meanLineChart = svg.append("path").attr({
        d: meanLineFunc(ds),
        "stroke": "gray",
        "stroke-width": 2,
        "fill": "none",
        "opacity": "0.3"
    }).style("stroke-dasharray", ("3, 3"));

	//draw main line.
    var lineChart = svg.append("path").attr({
        d: lineFunc(ds),
        "stroke": "black",
        "stroke-width": 2.5,
        "fill": "none"
    });

	//draw data point circle.
    var dots = svg.selectAll("circle")
        .data(ds)
        .enter()
        .append("circle")
        .attr({
            cx: function(d, i) {
                return xScale(format.parse(d.day));
            },
            cy: function(d) {
                return yScale(d.rowDailyCount);
            },
            r: 5,
            "fill": function(d) {
                if (d["indicator"] === "N") {
                    return "black"
                } else {
                    return "red"
                }
            },
            "stroke": "black"
        });
};
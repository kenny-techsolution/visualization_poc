//Data
var json1 = 
[{"date": "2013-02-27 10:12:41","Answer": 0}, {"date": "2013-02-28 17:23:11","Answer": 79}, {"date": "2013-02-28 17:26:23","Answer": 100}, {"date": "2013-02-28 17:27:46","Answer": 27}, {"date": "2013-03-01 16:54:06","Answer": 13}, {"date": "2013-03-01 17:15:49","Answer": 51}, {"date": "2013-03-05 10:16:07","Answer": 100}, {"date": "2013-03-05 10:40:43","Answer": 75}, {"date": "2013-03-13 12:18:01","Answer": 99}];

var json2 = [{"date": "2013-02-27 10:12:41","Answer": 99}, {"date": "2013-02-28 17:23:11","Answer": 83}, {"date": "2013-02-28 17:26:23","Answer": 34}, {"date": "2013-02-28 17:27:46","Answer": 99}, {"date": "2013-03-01 16:54:06","Answer": 42}, {"date": "2013-03-01 17:15:49","Answer": 99}, {"date": "2013-03-05 10:16:07","Answer": 99}, {"date": "2013-03-05 10:40:43","Answer": 16}, {"date": "2013-03-30 20:06:13","Answer": 64}, {"date": "2013-04-01 14:01:02","Answer": 35}];

//Set up graph parameters
var margin = {top: 10, right: 10, bottom: 100, left: 40},
   
    width = 640 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

 var margin2 = {top: 430, right: 10, bottom: 20, left: 40},
     height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

//Set up ranges (a scaling factor to map input data to output in pixels)
var x = d3.time.scale().range([0, width]);
var x2 = d3.time.scale().range([0, width]);

var y = d3.scale.linear().range([height, 0]);
var y2 = d3.scale.linear().range([height2, 0]);

//Set up and define graph content
//----------axis----------
var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),

	yAxis = d3.svg.axis().scale(y).orient("left");

//----------mean line----------
var alpha = 0.1;
var ypre, xpre;
var meanline = d3.svg.line()
	.interpolate("basis")
	.x(function(d, i) { 	
		return x(d.date);
	})
	.y(function(d, i) { 	
		if(i==0)
		ypre = y(d.Answer);   
		
		var ythis = alpha*y(d.Answer) + (1.0-alpha)*ypre;
		ypre = ythis;
		return ythis;
	});

//----------area fill----------
var	areaFill = d3.svg.area()
	.x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.Answer); });

var	areaFill2 = d3.svg.area()
	.x(function(d) { return x2(d.date); })
    .y0(height2)
    .y1(function(d) { return y2(d.Answer); });

//Setup groups to organize layout, brush areas and perform clipping
//----------groups----------
var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

svg.append("defs")
	.append("clipPath")
		.attr("id", "clip")
  	.append("rect")
    	.attr("width", width)
    	.attr("height", height);

var focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var data1;
var data2;

var x0; //This copy of x captures the original domain setup


//----------Setup brush-------------------------------------------------------------
var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

 //.x(x).scaleExtent([1,10]) limits zoom from 1X to 10X
var zoom = d3.behavior.zoom().x(x).scaleExtent([0,10])
    .on("zoom", zoomed);//.x(x).scaleExtent([1,10])

function brushed() {  
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  focus.select("#data1").attr("d", areaFill);
  focus.select("#data2").attr("d", areaFill);
  focus.select("#mean1").attr("d", meanline(data1));
  focus.select("#mean2").attr("d", meanline(data2));
  focus.select(".x.axis").call(xAxis);

  //Since domain has been modified, call zoom again
  zoom.x(x);
}

//----------Setup zoom-------------------------------------------------------------
function zoomed() {
 	

  	//check if domain is okay
  	if(x.domain()[0] < x0.domain()[0]){
  		zoom.translate([0,0]);
  	}



  focus.select("#data1").attr("d", areaFill);
  focus.select("#data2").attr("d", areaFill);
  focus.select("#mean1").attr("d", meanline(data1));
  focus.select("#mean2").attr("d", meanline(data2));
  focus.select(".x.axis").call(xAxis);

 //Find extent of zoomed area, what's currently at edges of graphed region
  var brushExtent = [x.invert(0), x.invert(width)]; 
  context.select(".brush").call(brush.extent(brushExtent));
}

function reset() {
   zoom.scale(1);
   zoom.translate([0,0]);
}


//----------import dataset 1-----------------------------------------------------------
	data1 = json1;

	data1.forEach(function(d) {
		d.date = parseDate(d.date);
		d.Answer = +d.Answer;
	});

	// Scale the range of the data
	x.domain(d3.extent(data1, function(d) { return d.date; }));
	y.domain([0, d3.max(data1, function(d) { return d.Answer; })]);

	//Call zoom
	zoom.x(x);

	// Scale the range of the data in context graph too
	x2.domain(x.domain());
	y2.domain(y.domain());
	
	// Add the area graph and mean line to focus and context
	focus.append("path")
			.datum(data1)
			.attr("id", "data1")
			.attr("class", "area1")
			.attr("clip-path", "url(#clip)")
			.attr("d", areaFill);

	focus.append("path")
			.attr("id", "mean1")
			.attr("class", "mean1")
			.attr("clip-path", "url(#clip)")
			.attr("d", meanline(data1));
		
	context.append("path")
			.datum(data1)
			.attr("class", "area1")
			.attr("d", areaFill2);



//----------import dataset 2-----------------------------------------------------------
	data2 = json2;
	
	data2.forEach(function(d) {
		d.date = parseDate(d.date);	
		d.Answer = +d.Answer;
	});
	
	// Scale the range of the data
	x.domain(d3.extent(data2, function(d) { return d.date; }));
	y.domain([0, d3.max(data2, function(d) { return d.Answer; })]);

    //Call zoom
	zoom.x(x);

	// Add the area graph and mean line to focus and context
	focus.append("path")
			.datum(data2)
			.attr("id", "data2")
			.attr("class", "area2")
			.attr("clip-path", "url(#clip)")
			.attr("d", areaFill);

	focus.append("path")
		.attr("id", "mean2")
		.attr("class", "mean2")
		.attr("clip-path", "url(#clip)")
		.attr("d", meanline(data2));

	context.append("path")
		.datum(data2)
		.attr("class", "area2")
		.attr("d", areaFill2);

	//Functions called after all json datasets loaded
	x0 = x.copy();

	//Axis
	focus.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis);

	focus.append("g")	
	.attr("class", "y axis")
	.call(yAxis);

	context.append("g")
  	.attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

    //Brush
	context.append("g")
  	.attr("class", "x brush")
  	.attr("clip-path", "url(#clip)")
  	.call(brush)
  	.selectAll("rect")
  	.attr("y", -6)
  	.attr("height", height2 + 7);

	//Used for zoom function
	focus.append("rect")
    .attr("class", "pane")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);



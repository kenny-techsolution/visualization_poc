
/*
function print_filter(filter){
	var f=eval(filter);
	if (typeof(f.length) != "undefined") {}else{}
	if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
	if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
	console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 
var data = [
		{date: "12/27/2012", http_404: 2, http_200: 190, http_302: 100},
		{date: "12/28/2012", http_404: 2, http_200: 10, http_302: 100},
		{date: "12/29/2012", http_404: 1, http_200: 300, http_302: 200},
		{date: "12/30/2012", http_404: 2, http_200: 90, http_302: 0},
		{date: "12/31/2012", http_404: 2, http_200: 90, http_302: 0},
		{date: "01/01/2013", http_404: 2, http_200: 90, http_302: 0},
		{date: "01/02/2013", http_404: 1, http_200: 10, http_302: 1},
		{date: "01/03/2013", http_404: 2, http_200: 90, http_302: 0},
		{date: "01/04/2013", http_404: 2, http_200: 90, http_302: 0},
		{date: "01/05/2013", http_404: 2, http_200: 90, http_302: 0},
		{date: "01/06/2013", http_404: 2, http_200: 200, http_302: 1},
		{date: "01/07/2013", http_404: 1, http_200: 200, http_302: 100}
		];
var ndx = crossfilter(data);
 
var parseDate = d3.time.format("%m/%d/%Y").parse;
data.forEach(function(d) {
	d.date = parseDate(d.date);
	d.total= d.http_404+d.http_200+d.http_302;
});
print_filter("data");
var dateDim = ndx.dimension(function(d) {return d.date;});
var hits = dateDim.group().reduceSum(function(d) {return d.total;}); 
console.log("hits");
print_filter("hits");
console.log(hits);
var minDate = dateDim.bottom(1)[0].date;
var maxDate = dateDim.top(1)[0].date;

var hitslineChart  = dc.lineChart("#chart-line-hitsperday"); 

hitslineChart
	.width(500).height(200)
	.dimension(dateDim)
	.group(hits)
	.x(d3.time.scale().domain([minDate,maxDate])).brushOn(true).yAxisLabel("Hits per day")  ; 
	dc.renderAll(); 
*/	
	
//var totalDim = ndx.dimension(function(d) { return d.total; });
//var total_90 = totalDim.filter(90);
//print_filter(total_90);




/*
var quarter = ndx.dimension(function (d) {
       var month = d.dd.getMonth();
       if (month <= 2) {
           return 'Q1';
       } else if (month > 2 && month <= 5) {
           return 'Q2';
       } else if (month > 5 && month <= 8) {
           return 'Q3';
       } else {
           return 'Q4';
       }
   });
   
   var quarterGroup = quarter.group().reduceSum(function (d) {
           return d.volume;
       });
var chart1 = dc.pieChart("#chart-container1");
quarterChart.width(180)
        .height(180)
        .radius(80)
        .innerRadius(30)
        .dimension(quarter)
        .group(quarterGroup);
		
		
dc.renderAll();
*/
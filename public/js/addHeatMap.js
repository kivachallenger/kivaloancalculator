var cal = new CalHeatMap();

alert(heatMap);

cal.init({
	data: JSON.stringify(heatMap),
	domain : "month",
	subDomain : "day",
});

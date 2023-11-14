document.addEventListener('DOMContentLoaded', function() {
    simulateRealTimeData();
});

let charts = [];


function registerChart(updateFunction, svgSelector, dataFunction) {
    charts.push({ updateFunction, svgSelector, dataFunction, data: dataFunction() });
}

function generalUpdate() {
    charts.forEach(chart => {
        const svg = d3.select(chart.svgSelector);
        const rect = svg.node().getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Update data for each chart
        chart.data = chart.dataFunction();

        svg.attr('width', width).attr('height', height);
        chart.updateFunction(chart.data, width, height);
    });
}

window.addEventListener('resize', generalUpdate);

// Update functions for each chart type
function updateBarChart(data, width, height) {
    const svg = d3.select('#barChart svg');
    const margin = { top: 20, right: 0, bottom: 30, left: 0 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    // Define 'g' here, so it's available throughout the function
    const g = svg.selectAll('g').data([null]);
    const gEnter = g.enter().append('g');
    gEnter.merge(g).attr('transform');

    
    const xScale = d3.scaleBand()
        .rangeRound([0, width])
        .padding(0.1)
        .domain(data.map((d, i) => i));

    const yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data)]);

    // Select all bars on the graph, bind them to the data
    const bars = svg.selectAll('.bar')
        .data(data, (d, i) => i);

    // Create the X-axis
    const xAxis = d3.axisBottom(xScale);

    // Create the Y-axis
    const yAxis = d3.axisLeft(yScale);

    // Update or append the X-axis
    const xAxisGroup = g.selectAll(".x-axis").data([null]);
    xAxisGroup.enter().append("g")
        .attr("class", "x-axis")
        .merge(xAxisGroup)
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);

    // Update or append the Y-axis
    const yAxisGroup = g.selectAll(".y-axis").data([null]);
    yAxisGroup.enter().append("g")
        .attr("class", "y-axis")
        .merge(yAxisGroup)
        .call(yAxis);

    // Update or append the X-axis label
    const xAxisLabel = svg.selectAll(".x-axis-label").data([null]);
    xAxisLabel.enter().append("text")
        .attr("class", "x-axis-label")
        .merge(xAxisLabel)
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 20)
        .text("X-Axis Label");

    // Update or append the Y-axis label
    const yAxisLabel = svg.selectAll(".y-axis-label").data([null]);
    yAxisLabel.enter().append("text")
        .attr("class", "y-axis-label")
        .merge(yAxisLabel)
        .attr("text-anchor", "middle")
        .attr("transform", `translate(${margin.left * -1},${(height / 2) + margin.top}) rotate(-90)`)
        .text("Y-Axis Label");


    // Enter selection: Initialize new bars
    bars.enter().append('rect')
        .attr('class', 'bar')
        .attr('x', (d, i) => xScale(i))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d))
        .attr('height', d => height - yScale(d))
        .merge(bars)
      .transition()
        .duration(1000)
        .attr('x', (d, i) => xScale(i))
        .attr('y', d => yScale(d))
        .attr('height', d => height - yScale(d));

    // Update selection: Update existing bars
    bars.transition()
        .duration(1000)
        .attr('x', (d, i) => xScale(i))
        .attr('width', xScale.bandwidth())
        .attr('y', d => yScale(d))
        .attr('height', d => height - yScale(d));

    // Exit selection: Remove bars that are no longer in the data
    bars.exit()
      .transition()
        .duration(1000)
        .attr('y', height)
        .attr('height', 0)
        .remove();

}

function updateLineChart(data, width, height) {
    const svg = d3.select('#lineChart svg');
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .rangeRound([0, width])
        .domain(d3.extent(data, d => d.x));

    const yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, d3.max(data, d => d.y)]);

    const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));

    // Select the existing path, if it exists
    const path = g.selectAll('.line')
        .data([data]);

    // Fade out the old line
    path.exit()
        .transition()
        .duration(500)
        .style('opacity', 0)
        .remove();

    // Draw and fade in the new line
    path.enter()
        .append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', line)
        .style('opacity', 0)
      .transition()
        .duration(500)
        .style('opacity', 1);

    // Update the line
    path.attr('d', line)
        .transition()
        .duration(500)
        .style('opacity', 1);
}



function updatePieChart(data, width, height) {
    const svg = d3.select('#pieChart svg');
    const radius = Math.min(width, height) / 2;

    svg.selectAll('*').remove();
    const g = svg.append('g')
        .attr('class', 'pie-container')
        .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.value)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const path = g.selectAll('path')
        .data(pie);

    path.enter()
        .append('path')
        .merge(path)
        .attr('d', arc)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10]);

    path.exit().remove();
}



function updateScatterPlot(data, width, height) {
    const svg = d3.select('#scatterPlot svg');
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y))
        .range([height, 0]);

    g.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .merge(g.selectAll('circle'))
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 5)
        .attr('fill', 'blue');

    g.selectAll('circle').exit().remove();
}


function updateHeatMap(data, width, height) {
    const svg = d3.select('#heatMap svg');
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const rows = data.length;
    const cols = data[0].length;
    const gridSize = Math.min(width / cols, height / rows);

    const colorScale = d3.scaleSequential(d3.interpolateInferno)
        .domain([0, d3.max(data, row => d3.max(row))]);

    g.selectAll('rect')
        .data(data.flat())
        .enter().append('rect')
        .merge(g.selectAll('rect'))
        .attr('x', (d, i) => (i % cols) * gridSize)
        .attr('y', (d, i) => Math.floor(i / cols) * gridSize)
        .attr('width', gridSize)
        .attr('height', gridSize)
        .attr('fill', d => colorScale(d));

    g.selectAll('rect').exit().remove();
}


function updateAreaPlot(data, width, height) {
    const svg = d3.select('#areaPlot svg');
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);

    const area = d3.area()
        .x(d => xScale(d.x))
        .y0(height)
        .y1(d => yScale(d.y));

    g.selectAll('path')
        .data([data]) // Wrap data in an array for area generator
        .join('path')
        .attr('d', area)
        .attr('fill', 'steelblue');
}


function updateBoxPlot(data, width, height) {
    const svg = d3.select('#boxPlot svg');
    const margin = { top: 10, right: 50, bottom: 30, left: 50 };
    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    const boxWidth = 30;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map((_, i) => i))
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.flat())])
        .range([height, 0]);

    // Drawing each box
    data.forEach((group, index) => {
        const q1 = d3.quantile(group.sort(d3.ascending), .25);
        const median = d3.quantile(group, .5);
        const q3 = d3.quantile(group, .75);
        const interQuantileRange = q3 - q1;
        const min = q1 - 1.5 * interQuantileRange;
        const max = q3 + 1.5 * interQuantileRange;

        // Draw box
        g.append('rect')
            .attr('x', xScale(index) + xScale.bandwidth() / 2 - boxWidth / 2)
            .attr('y', yScale(q3))
            .attr('width', boxWidth)
            .attr('height', yScale(q1) - yScale(q3))
            .attr('stroke', 'black')
            .style('fill', '#69b3a2');

        // Draw median line
        g.append('line')
            .attr('x1', xScale(index) + xScale.bandwidth() / 2 - boxWidth / 2)
            .attr('x2', xScale(index) + xScale.bandwidth() / 2 + boxWidth / 2)
            .attr('y1', yScale(median))
            .attr('y2', yScale(median))
            .attr('stroke', 'black');

        // Draw whiskers
        // ... Add whisker drawing code here
        // Draw whiskers
    // Line from min to q1
        g.append('line')
            .attr('x1', xScale(index) + xScale.bandwidth() / 2)
            .attr('x2', xScale(index) + xScale.bandwidth() / 2)
            .attr('y1', yScale(min))
            .attr('y2', yScale(q1))
            .attr('stroke', 'black');

        // Line from q3 to max
        g.append('line')
            .attr('x1', xScale(index) + xScale.bandwidth() / 2)
            .attr('x2', xScale(index) + xScale.bandwidth() / 2)
            .attr('y1', yScale(q3))
            .attr('y2', yScale(max))
            .attr('stroke', 'black');

        // Horizontal line at min
        g.append('line')
            .attr('x1', xScale(index) + xScale.bandwidth() / 2 - boxWidth / 4)
            .attr('x2', xScale(index) + xScale.bandwidth() / 2 + boxWidth / 4)
            .attr('y1', yScale(min))
            .attr('y2', yScale(min))
            .attr('stroke', 'black');

        // Horizontal line at max
        g.append('line')
            .attr('x1', xScale(index) + xScale.bandwidth() / 2 - boxWidth / 4)
            .attr('x2', xScale(index) + xScale.bandwidth() / 2 + boxWidth / 4)
            .attr('y1', yScale(max))
            .attr('y2', yScale(max))
            .attr('stroke', 'black');
    });
}



// Real-time data simulation
function simulateRealTimeData() {
    simulateRealTimeDataForBarChart();
    simulateRealTimeDataForLineChart();
    simulateRealTimeDataForPieChart();
    simulateRealTimeDataForScatterPlot();
    simulateRealTimeDataForHeatMap();
    simulateRealTimeDataForAreaPlot();
    simulateRealTimeDataForBoxPlot();
}

// Sample real-time data simulation functions (to be replaced with actual implementations)
// Data generation function for bar chart
function generateBarChartData() {
    return Array.from({ length: 5 }, () => Math.floor(Math.random() * 100) + 1);
}

// Register the bar chart
registerChart(updateBarChart, '#barChart svg', generateBarChartData);


// Real-time data simulation
function simulateRealTimeDataForBarChart() {
    setInterval(() => {
        // Update the data for bar chart
        charts.find(chart => chart.svgSelector === '#barChart svg').data = generateBarChartData();
        generalUpdate(); // Call the general update to refresh the chart
    }, 5000); // Update every 2 seconds
}


// Data generation function for line chart
function generateLineChartData() {
    return Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.random() * 100 }));
}

// Register the line chart
registerChart(updateLineChart, '#lineChart svg', generateLineChartData);

// Adapt the real-time data simulation for line chart
function simulateRealTimeDataForLineChart() {
    const data = [];
    setInterval(() => {
        data.push({ x: data.length, y: Math.random() * 100 });
        if (data.length > 20) data.shift(); // Keep the array size manageable
        charts.find(chart => chart.svgSelector === '#lineChart svg').data = data;
        generalUpdate(); // Call the general update to refresh the chart
    }, 50000);
}


// Data generation function for pie chart
function generatePieChartData() {
    return Array.from({ length: 5 }, (_, i) => ({
        label: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 100) + 1
    }));
}

// Register the pie chart
registerChart(updatePieChart, '#pieChart svg', generatePieChartData);

// Adapt the real-time data simulation for pie chart
function simulateRealTimeDataForPieChart() {
    setInterval(() => {
        const pieData = Array.from({ length: 5 }, () => ({
            label: `Item ${Math.floor(Math.random() * 100)}`, 
            value: Math.random() * 100
        }));
        charts.find(chart => chart.svgSelector === '#pieChart svg').data = pieData;
        generalUpdate(); // Call the general update to refresh the chart
    }, 2000);
}


// Data generation function for scatter plot
function generateScatterPlotData() {
    return Array.from({ length: 30 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100
    }));
}

// Register the scatter plot
registerChart(updateScatterPlot, '#scatterPlot svg', generateScatterPlotData);

// Adapt the real-time data simulation for scatter plot
function simulateRealTimeDataForScatterPlot() {
    setInterval(() => {
        const scatterData = Array.from({ length: 20 }, () => ({
            x: Math.random() * 100, 
            y: Math.random() * 100
        }));
        charts.find(chart => chart.svgSelector === '#scatterPlot svg').data = scatterData;
        generalUpdate(); // Call the general update to refresh the chart
    }, 2000);
}


// Data generation function for heat map
function generateHeatMapData() {
    return Array.from({ length: 10 }, () => 
        Array.from({ length: 10 }, () => Math.random() * 100)
    );
}

// Register the heat map
registerChart(updateHeatMap, '#heatMap svg', generateHeatMapData);

// Adapt the real-time data simulation for heat map
function simulateRealTimeDataForHeatMap() {
    setInterval(() => {
        const heatMapData = Array.from({ length: 10 }, () => 
            Array.from({ length: 10 }, () => Math.random() * 100)
        );
        charts.find(chart => chart.svgSelector === '#heatMap svg').data = heatMapData;
        generalUpdate(); // Call the general update to refresh the chart
    }, 2000);
}

// Data generation function for area plot
function generateAreaPlotData() {
    return Array.from({ length: 50 }, (_, i) => ({ x: i, y: Math.random() * 100 }));
}

// Register the area plot
registerChart(updateAreaPlot, '#areaPlot svg', generateAreaPlotData);

// Adapt the real-time data simulation for area plot
function simulateRealTimeDataForAreaPlot() {
    const data = [];
    let xCounter = 0;

    setInterval(() => {
        data.push({ x: xCounter++, y: Math.random() * 100 });
        if (data.length > 50) data.shift(); // Keep the array size manageable
        charts.find(chart => chart.svgSelector === '#areaPlot svg').data = data;
        generalUpdate(); // Call the general update to refresh the chart
    }, 1000);
}

// Data generation function for box plot
function generateBoxPlotData() {
    return Array.from({ length: 5 }, () => 
        Array.from({ length: Math.floor(Math.random() * 40 + 10) }, () => Math.random() * 100)
    );
}

// Register the box plot
registerChart(updateBoxPlot, '#boxPlot svg', generateBoxPlotData);

// Adapt the real-time data simulation for box plot
function simulateRealTimeDataForBoxPlot() {
    setInterval(() => {
        const data = Array.from({ length: 5 }, () => 
            Array.from({ length: Math.floor(Math.random() * 40 + 10) }, () => Math.random() * 100)
        );
        charts.find(chart => chart.svgSelector === '#boxPlot svg').data = data;
        generalUpdate(); // Call the general update to refresh the chart
    }, 2000);
}





// File upload handling
document.getElementById('fileUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = parseData(e.target.result);
            // Update the relevant chart with this data
            // This will depend on the format of your data and the type of chart
        };
        reader.readAsText(file);
    }
});

function parseData(dataString) {
    // Parse the data string based on your file format (CSV, JSON, etc.)
    // Return the data in a format suitable for your charts
    return []; // Placeholder
}

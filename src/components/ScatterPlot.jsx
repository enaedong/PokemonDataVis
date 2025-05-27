import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot({ items, selectedItem, setSelectedItem, TYPE_COLORS }) {
    const ref = useRef();

    useEffect(() => {
        const svg = d3.select(ref.current);
        svg.selectAll('*').remove(); // Clear SVG content before redrawing

        if (!items || items.length === 0) return;

        // 1. Define chart dimensions
        const width = 500;
        const height = 300;
        const marginTop = 20;
        const marginBottom = 20;
        const marginLeft = 40;
        const marginRight = 20;

        // 2. Set up scales
        const x = d3.scaleLinear()
            .domain([0, 5]) // Damage count
            .range([marginLeft, width - marginRight]);

        const y = d3.scaleLinear()
            .domain([0, 200]) // Pokemon speed
            .range([height - marginBottom, marginTop]);

        svg.attr('width', width).attr('height', height);

        // 3. Render axes
        svg.append('g')
            .attr('transform', `translate(0, ${height - marginBottom})`)
            .call(d3.axisBottom(x).ticks(6));

        svg.append('g')
            .attr('transform', `translate(${marginLeft}, 0)`)
            .call(d3.axisLeft(y));

        // 4. Plot data points
        const dataPoints = svg.append('g')
            .selectAll('g')
            .data(items)
            .join('g')
            .attr('class', 'datapoint')
            .attr('fill', d => TYPE_COLORS[d.type])
            .attr('transform', d => `translate(${x(d.count)}, ${y(d.speed)})`);

        dataPoints.append('circle')
            .attr('r', 3)
            .style('cursor', 'pointer')
            .on('click', (event, d) => {
                // Toggle selection on click
                setSelectedItem(d.name === selectedItem ? null : d.name);
            });

        // 5. Display tooltips for selected points
        const tooltips = dataPoints.append('g')
            .attr('class', d => (selectedItem === d.name ? 'display' : 'hide'))
            .style('pointer-events', 'none');

        tooltips.append('rect')
            .attr('x', -30)
            .attr('y', -20)
            .attr('width', 60)
            .attr('height', 20)
            .attr('fill', 'black')
            .attr('rx', 5);

        tooltips.append('text')
            .attr('x', 0)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'white')
            .text(d => d.name);

    }, [items, selectedItem, setSelectedItem, TYPE_COLORS]);

    return <svg ref={ref} />;
}

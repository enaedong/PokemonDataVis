import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot({ items, selectedItem, setSelectedItem, TYPE_COLORS, showMove = false }) {
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
            .attr('x', 0)            // will be repositioned in the loop
            .attr('y', 0)            // ditto
            .attr('fill', 'black')   // or move this into CSS
            .attr('rx', 5);          // corner radius

        // 1. Append <text> with two <tspan> lines
        const text = tooltips.append('text')
            .attr('text-anchor', 'middle')    // center text horizontally
            .attr('dominant-baseline', 'middle')
            .attr('fill', 'white')
            .attr('font-size', 10);

        // first line: Pokémon name
        text.append('tspan')
            .attr('x', 0)
            .attr('dy', 0)
            .text(d => d.name);

        // second line: move, 1.2em below the first line
        text.append('tspan')
            .attr('x', 0)
            .attr('dy', '1.2em')
            .text(d => d.bestMove);

        // In section "2. After the text is in the DOM, measure and resize the rect"

        tooltips.each(function () {
            const tooltipG = d3.select(this);
            const rect = tooltipG.select('rect');
            const textEl = tooltipG.select('text'); // Get the text element
            const bbox = textEl.node().getBBox();   // Get its bounding box

            const paddingX = 6;
            const paddingY = 4;
            const gap = 8; // A small gap between the data point and the tooltip

            const rectHeight = bbox.height + paddingY * 2;
            const rectWidth = bbox.width + paddingX * 2;

            // Position the rectangle to be above the data point
            rect
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('x', -rectWidth / 2) // Center the rect horizontally
                .attr('y', -(rectHeight + gap)); // Position rect above the point

            // Calculate the vertical center of the rect and position the text there
            const textY = -(rectHeight + gap) + (rectHeight / 2);
            textEl.attr('y', textY);
        });

    }, [items, selectedItem, setSelectedItem, TYPE_COLORS, showMove]);

    return <svg ref={ref} />;
}

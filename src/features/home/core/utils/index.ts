import * as d3 from "d3";

import { CHART_MARGIN } from "@/features/home/core/constants";
import type { IChartData, ID3TimeFormat } from "@/features/home/core/types";

export const createScales = (
  history: IChartData[],
  width: number,
  height: number,
  priceChange: number
) => {
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(history, (d) => d.time) as [number, number])
    .range([CHART_MARGIN.left, width - CHART_MARGIN.right]);

  const currentPrice = history[history.length - 1].price;
  const priceRange = d3.extent(history, (d) => d.price) as [number, number];
  const volatility = Math.abs(priceChange) / 100;
  const padding = currentPrice * Math.max(0.001, volatility * 0.01);

  const yScale = d3
    .scaleLinear()
    .domain([
      Math.min(currentPrice - padding, priceRange[0]),
      Math.max(currentPrice + padding, priceRange[1]),
    ])
    .range([height - CHART_MARGIN.bottom, CHART_MARGIN.top]);

  return { xScale, yScale };
};

export const createLineGenerator = (
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>
) => {
  return d3
    .line<IChartData>()
    .x((d) => xScale(d.time))
    .y((d) => yScale(d.price))
    .curve(d3.curveMonotoneX);
};

export const createAreaGenerator = (
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  height: number
) => {
  return d3
    .area<IChartData>()
    .x((d) => xScale(d.time))
    .y0(height - CHART_MARGIN.bottom)
    .y1((d) => yScale(d.price))
    .curve(d3.curveMonotoneX);
};

export const updateLabelBackground = (
  label: d3.Selection<SVGTextElement, unknown, null, undefined>,
  padding: number = 4
) => {
  const bbox = (label.node() as SVGTextElement)?.getBBox();
  if (!bbox) return;

  let bg = label.select<SVGRectElement>("rect.label-bg");
  if (bg.empty()) {
    bg = label
      .insert("rect", ":first-child")
      .attr("class", "label-bg")
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "#1e293b")
      .attr("opacity", 0.8);
  }

  bg.transition()
    .duration(150)
    .ease(d3.easeLinear)
    .attr("x", bbox.x - padding)
    .attr("y", bbox.y - padding)
    .attr("width", bbox.width + padding * 2)
    .attr("height", bbox.height + padding * 2);
};

export const createAxes = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  height: number
) => {
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(6)
    .tickFormat(d3.timeFormat("%H:%M:%S") as ID3TimeFormat);

  const yAxis = d3
    .axisRight(yScale)
    .ticks(6)
    .tickFormat((d) => `$${d.toLocaleString()}`);

  // Create or update X-axis
  let xAxisGroup = svg.select<SVGGElement>(".x-axis");
  if (xAxisGroup.empty()) {
    xAxisGroup = svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - CHART_MARGIN.bottom})`);
  }
  xAxisGroup.transition().duration(150).ease(d3.easeLinear).call(xAxis);
  xAxisGroup
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("fill", "#64748b")
    .attr("font-weight", "500")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "middle");

  // Create or update Y-axis
  let yAxisGroup = svg.select<SVGGElement>(".y-axis");
  if (yAxisGroup.empty()) {
    yAxisGroup = svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width - CHART_MARGIN.right},0)`);
  }
  yAxisGroup
    .transition()
    .duration(150)
    .ease(d3.easeLinear)
    .attr("transform", `translate(${width - CHART_MARGIN.right},0)`)
    .call(yAxis);

  yAxisGroup
    .selectAll("text")
    .attr("font-size", "12px")
    .attr("fill", "#64748b")
    .attr("font-weight", "500")
    .style("text-anchor", "start")
    .style("dominant-baseline", "middle");

  return { xAxisGroup, yAxisGroup };
};

export const createGridLines = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  height: number
) => {
  // Create or update X grid lines
  let xGrid = svg.select<SVGGElement>(".x-grid");
  if (xGrid.empty()) {
    xGrid = svg
      .append("g")
      .attr("class", "x-grid")
      .attr("transform", `translate(0,${height - CHART_MARGIN.bottom})`);
  }
  xGrid
    .transition()
    .duration(150)
    .ease(d3.easeLinear)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(6)
        .tickSize(-(height - CHART_MARGIN.top - CHART_MARGIN.bottom))
        .tickFormat(() => "")
    );
  xGrid
    .selectAll("line")
    .attr("stroke", "#1e293b")
    .attr("stroke-opacity", 0.1)
    .attr("stroke-dasharray", "4,4");

  // Create or update Y grid lines
  let yGrid = svg.select<SVGGElement>(".y-grid");
  if (yGrid.empty()) {
    yGrid = svg
      .append("g")
      .attr("class", "y-grid")
      .attr("transform", `translate(${width - CHART_MARGIN.right},0)`);
  }
  yGrid
    .transition()
    .duration(150)
    .ease(d3.easeLinear)
    .attr("transform", `translate(${width - CHART_MARGIN.right},0)`)
    .call(
      d3
        .axisRight(yScale)
        .ticks(6)
        .tickSize(-(width - CHART_MARGIN.left - CHART_MARGIN.right))
        .tickFormat(() => "")
    );
  yGrid
    .selectAll("line")
    .attr("stroke", "#1e293b")
    .attr("stroke-opacity", 0.1)
    .attr("stroke-dasharray", "4,4");
};

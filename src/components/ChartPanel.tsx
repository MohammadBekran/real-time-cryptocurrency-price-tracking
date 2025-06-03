"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import { useBinanceTicker } from "@/core/hooks/useBinanceTicker";

// Chart dimensions
const MARGIN = { top: 40, right: 40, bottom: 40, left: 60 } as const;

interface IChartPanelProps {
  symbol?: string;
  maxPoints?: number;
  onPriceUpdate?: (price: number) => void;
}

export function ChartPanel({
  symbol = "btcusdt",
  maxPoints = 120,
  onPriceUpdate,
}: IChartPanelProps) {
  const { price, history, isConnected, error } = useBinanceTicker(
    symbol,
    maxPoints
  );
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHistoryRef = useRef<typeof history>([]);

  // Notify parent component of price updates
  useEffect(() => {
    if (price && onPriceUpdate) {
      onPriceUpdate(price);
    }
  }, [price, onPriceUpdate]);

  // Calculate price change
  const priceChange =
    history.length > 1
      ? ((history[history.length - 1].price - history[0].price) /
          history[0].price) *
        100
      : 0;

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || history.length === 0)
      return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create scales with minimal padding
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(history, (d) => d.time) as [number, number])
      .range([MARGIN.left, width - MARGIN.right]);

    // Calculate dynamic y-scale domain with smoother scaling
    const currentPrice = history[history.length - 1].price;
    const priceRange = d3.extent(history, (d) => d.price) as [number, number];

    // Dynamic padding based on price volatility
    const volatility = Math.abs(priceChange) / 100;
    const padding = currentPrice * Math.max(0.001, volatility * 0.01);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(currentPrice - padding, priceRange[0]),
        Math.max(currentPrice + padding, priceRange[1]),
      ])
      .range([height - MARGIN.bottom, MARGIN.top]);

    // Create line generator with natural curve
    const line = d3
      .line<{ time: number; price: number }>()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Determine color based on price movement with smooth transitions
    const isPriceUp = priceChange >= 0;
    const lineColor = isPriceUp ? "#22c55e" : "#ef4444";
    const gradientColor = isPriceUp ? "#22c55e" : "#ef4444";

    // Add gradient with dynamic opacity
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", gradientColor)
      .attr("stop-opacity", 0.3);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", gradientColor)
      .attr("stop-opacity", 0);

    // Create or update area path with smooth transitions
    const area = d3
      .area<{ time: number; price: number }>()
      .x((d) => xScale(d.time))
      .y0(height - MARGIN.bottom)
      .y1((d) => yScale(d.price))
      .curve(d3.curveMonotoneX);

    let areaPath = svg.select<SVGPathElement>(".area-path");
    if (areaPath.empty()) {
      areaPath = svg
        .append("path")
        .attr("class", "area-path")
        .attr("fill", "url(#area-gradient)")
        .attr("d", area(history));
    } else {
      areaPath
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr("d", area(history));
    }

    // Create or update line path with smooth transitions
    let linePath = svg.select<SVGPathElement>(".line-path");
    if (linePath.empty()) {
      linePath = svg
        .append("path")
        .attr("class", "line-path")
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line(history));
    } else {
      linePath
        .transition()
        .duration(300)
        .ease(d3.easeCubicInOut)
        .attr("d", line(history))
        .attr("stroke", lineColor);
    }

    // Update axes with smooth transitions
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.timeFormat("%H:%M:%S") as any);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat((d) => `$${d.toLocaleString()}`);

    // Update X-axis with smooth transitions
    let xAxisGroup = svg.select<SVGGElement>(".x-axis");
    if (xAxisGroup.empty()) {
      xAxisGroup = svg
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height - MARGIN.bottom})`);
    }
    xAxisGroup.transition().duration(150).ease(d3.easeLinear).call(xAxis);
    xAxisGroup
      .selectAll("text")
      .attr("font-size", "12px")
      .attr("fill", "#64748b");

    // Update Y-axis with smooth transitions
    let yAxisGroup = svg.select<SVGGElement>(".y-axis");
    if (yAxisGroup.empty()) {
      yAxisGroup = svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${MARGIN.left},0)`);
    }
    yAxisGroup.transition().duration(150).ease(d3.easeLinear).call(yAxis);
    yAxisGroup
      .selectAll("text")
      .attr("font-size", "12px")
      .attr("fill", "#64748b");

    // Update grid lines with smooth transitions
    let xGrid = svg.select<SVGGElement>(".x-grid");
    if (xGrid.empty()) {
      xGrid = svg
        .append("g")
        .attr("class", "x-grid")
        .attr("transform", `translate(0,${height - MARGIN.bottom})`);
    }
    xGrid
      .transition()
      .duration(150)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(6)
          .tickSize(-height + MARGIN.top + MARGIN.bottom)
          .tickFormat(() => "")
      );
    xGrid
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-opacity", 0.1)
      .attr("stroke-dasharray", "4,4");

    let yGrid = svg.select<SVGGElement>(".y-grid");
    if (yGrid.empty()) {
      yGrid = svg
        .append("g")
        .attr("class", "y-grid")
        .attr("transform", `translate(${MARGIN.left},0)`);
    }
    yGrid
      .transition()
      .duration(150)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(6)
          .tickSize(-width + MARGIN.left + MARGIN.right)
          .tickFormat(() => "")
      );
    yGrid
      .selectAll("line")
      .attr("stroke", "#1e293b")
      .attr("stroke-opacity", 0.1)
      .attr("stroke-dasharray", "4,4");

    // Update price labels with smooth transitions and better positioning
    const lastPoint = history[history.length - 1];
    const firstPoint = history[0];

    // Calculate label positions with padding
    const labelPadding = 30;
    const startX = Math.max(
      MARGIN.left + labelPadding,
      xScale(firstPoint.time)
    );
    const endX = Math.min(
      width - MARGIN.right - labelPadding,
      xScale(lastPoint.time)
    );

    // Update start price label with smooth transitions
    let startLabel = svg.select<SVGTextElement>(".start-label");
    if (startLabel.empty()) {
      startLabel = svg
        .append("text")
        .attr("class", "start-label")
        .attr("text-anchor", "start")
        .attr("fill", "#64748b")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .attr("opacity", 0);
    }
    startLabel
      .transition()
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("x", startX)
      .attr("y", yScale(firstPoint.price) - 15)
      .attr("opacity", 1)
      .text(`Start: $${firstPoint.price.toLocaleString()}`);

    // Update current price label with smooth transitions
    let currentLabel = svg.select<SVGTextElement>(".current-label");
    if (currentLabel.empty()) {
      currentLabel = svg
        .append("text")
        .attr("class", "current-label")
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .attr("opacity", 0);
    }
    currentLabel
      .transition()
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("x", endX)
      .attr("y", yScale(lastPoint.price) - 15)
      .attr("fill", lineColor)
      .attr("opacity", 1)
      .text(`Current: $${lastPoint.price.toLocaleString()}`);

    // Update price change indicator with smooth transitions
    const priceChangeText = `${
      priceChange >= 0 ? "+" : ""
    }${priceChange.toFixed(2)}%`;
    let changeLabel = svg.select<SVGTextElement>(".change-label");
    if (changeLabel.empty()) {
      changeLabel = svg
        .append("text")
        .attr("class", "change-label")
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .attr("opacity", 0);
    }
    changeLabel
      .transition()
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("x", endX)
      .attr("y", yScale(lastPoint.price) - 35)
      .attr("fill", lineColor)
      .attr("opacity", 1)
      .text(priceChangeText);

    // Update dots with smooth transitions
    let startDot = svg.select<SVGCircleElement>(".start-dot");
    if (startDot.empty()) {
      startDot = svg
        .append("circle")
        .attr("class", "start-dot")
        .attr("r", 3)
        .attr("fill", "#64748b")
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0);
    }
    startDot
      .transition()
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("cx", xScale(firstPoint.time))
      .attr("cy", yScale(firstPoint.price))
      .attr("opacity", 1);

    let endDot = svg.select<SVGCircleElement>(".end-dot");
    if (endDot.empty()) {
      endDot = svg
        .append("circle")
        .attr("class", "end-dot")
        .attr("r", 3)
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0);
    }
    endDot
      .transition()
      .duration(300)
      .ease(d3.easeCubicInOut)
      .attr("cx", xScale(lastPoint.time))
      .attr("cy", yScale(lastPoint.price))
      .attr("fill", lineColor)
      .attr("opacity", 1);

    // Add hover effect for better UX
    const tooltip = svg
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip
      .append("rect")
      .attr("width", 100)
      .attr("height", 40)
      .attr("fill", "#1e293b")
      .attr("rx", 4);

    const tooltipText = tooltip
      .append("text")
      .attr("x", 50)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "12px");

    // Add hover interaction with proper type handling
    svg
      .select(".line-path")
      .on("mouseover", function () {
        tooltip.style("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      })
      .on("mousemove", function (event) {
        const [x] = d3.pointer(event);
        const bisect = d3.bisector((d: { time: number }) => d.time).left;
        const x0 = xScale.invert(x);
        const i = bisect(history, x0, 1);
        const d0 = history[i - 1];
        const d1 = history[i];
        const d = x0.getTime() - d0.time > d1.time - x0.getTime() ? d1 : d0;

        tooltip.attr(
          "transform",
          `translate(${xScale(d.time) - 50},${yScale(d.price) - 60})`
        );
        tooltipText.text(`$${d.price.toLocaleString()}`);
      });

    // Store current history for next update
    prevHistoryRef.current = history;

    // Cleanup function
    return () => {
      svg.selectAll("*").remove();
    };
  }, [history, priceChange]);

  return (
    <div className="w-full h-[600px] bg-slate-900 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">
            {symbol.toUpperCase()}
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            <span className="text-sm text-slate-400">
              {isConnected ? "Live" : "Demo Mode"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-white">
            $
            {price?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              priceChange >= 0
                ? "bg-green-500/20 text-green-500"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full h-[500px] relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ overflow: "visible" }}
        />
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 text-red-500 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

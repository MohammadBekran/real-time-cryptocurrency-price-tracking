import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { createTooltip } from "@/features/home/components/chart-panel/chart-tooltip";
import type { IChartData } from "@/features/home/core/types";
import {
  createAreaGenerator,
  createAxes,
  createGridLines,
  createLineGenerator,
  createScales,
} from "@/features/home/core/utils";

interface IChartContainerProps {
  history: IChartData[];
  priceChange: number;
}

const ChartContainer = ({ history, priceChange }: IChartContainerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !svgRef.current ||
      !containerRef.current ||
      !history ||
      history.length === 0
    )
      return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    if (history.length < 2) return;

    const { xScale, yScale } = createScales(
      history,
      width,
      height,
      priceChange
    );
    const line = createLineGenerator(xScale, yScale);
    const area = createAreaGenerator(xScale, yScale, height);

    // Determine color based on price movement
    const isPriceUp = priceChange >= 0;
    const lineColor = isPriceUp ? "#22c55e" : "#ef4444";
    const gradientColor = isPriceUp ? "#22c55e" : "#ef4444";

    // Add gradient
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) {
      defs = svg.append<SVGDefsElement>("defs");
    }

    let gradient = defs.select<SVGLinearGradientElement>("#area-gradient");
    if (gradient.empty()) {
      gradient = defs
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
    } else {
      gradient.select("stop:first-child").attr("stop-color", gradientColor);
      gradient.select("stop:last-child").attr("stop-color", gradientColor);
    }

    // Create or update area path
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

    // Create or update line path
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

    // Create axes and grid lines
    createAxes(svg, xScale, yScale, width, height);
    createGridLines(svg, xScale, yScale, width, height);

    // Create tooltip
    createTooltip(svg, width, height, xScale, yScale, history);

    // Cleanup function
    return () => {
      d3.select(".tooltip").remove();
    };
  }, [history, priceChange]);

  return (
    <div ref={containerRef} className="w-full h-[500px] relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ overflow: "visible" }}
      />
    </div>
  );
};

export default ChartContainer;

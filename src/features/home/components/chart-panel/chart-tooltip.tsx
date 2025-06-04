import * as d3 from "d3";

import type { IChartData } from "@/features/home/core/types";

export const createTooltip = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
  xScale: d3.ScaleTime<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  history: IChartData[]
) => {
  const tooltip = svg.select<SVGGElement>(".tooltip");

  if (tooltip.empty()) {
    const newTooltip = svg
      .append("g")
      .attr("class", "tooltip")
      .style("pointer-events", "none")
      .style("opacity", 0);

    newTooltip
      .append("rect")
      .attr("width", 120)
      .attr("height", 50)
      .attr("fill", "#1e293b")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("opacity", 0.9);

    newTooltip
      .append("text")
      .attr("x", 60)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "13px")
      .attr("font-weight", "500");

    svg
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function () {
        tooltip.style("opacity", 1);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      })
      .on("mousemove", function (event) {
        const [x] = d3.pointer(event);
        const bisect = d3.bisector((d: IChartData) => d.time).left;
        const x0 = xScale.invert(x);
        const i = bisect(history, x0, 1);
        if (i === 0 || i >= history.length) return;
        const d0 = history[i - 1];
        const d1 = history[i];
        if (!d0 || !d1) return;
        const d = x0.getTime() - d0.time > d1.time - x0.getTime() ? d1 : d0;

        const tooltipX = Math.min(Math.max(xScale(d.time), 60), width - 60);
        const tooltipY = Math.min(
          Math.max(yScale(d.price) - 60, 25),
          height - 25
        );

        tooltip.attr("transform", `translate(${tooltipX - 60},${tooltipY})`);
        tooltip.select("text").text(`$${d.price.toLocaleString()}`);
      });
  }
};

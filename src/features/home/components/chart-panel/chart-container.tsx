import { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import type { IChartData } from "@/features/home/core/types";

interface IChartContainerProps {
  width: number;
  height: number;
  dataPoint: number | null;
  margin?: { top: number; right: number; bottom: number; left: number };
  visibleCount?: number;
  yPadding?: number;
}

/**
 * ChartContainer component renders a real-time price chart with smooth animations
 * using D3.js. Features include:
 * - Smooth drawing-like animations
 * - Real-time price updates
 * - Responsive scaling
 */
const ChartContainer = ({
  width: initialWidth,
  height: initialHeight,
  dataPoint,
  margin = { top: 20, right: 100, bottom: 20, left: 40 },
  visibleCount = 40,
  yPadding = 0.1,
}: IChartContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const GRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dataQueue = useRef<number[]>([]);
  const isAnimating = useRef(false);
  const isInitialized = useRef(false);
  const xScale = useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
  const yScale = useRef<d3.ScaleLinear<number, number>>(d3.scaleLinear());
  const lineGenerator = useRef<d3.Line<number>>(d3.line<number>());

  const yAxisG = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);
  const xAxisG = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  // Responsive margins based on screen width
  const responsiveMargin = {
    top: Math.max(15, Math.min(25, dimensions.width * 0.03)),
    right: Math.max(30, Math.min(120, dimensions.width * 0.12)),
    bottom: Math.max(15, Math.min(25, dimensions.width * 0.03)),
    left: Math.max(30, Math.min(50, dimensions.width * 0.05)),
  };

  const innerWidth =
    dimensions.width - responsiveMargin.left - responsiveMargin.right;
  const innerHeight =
    dimensions.height - responsiveMargin.top - responsiveMargin.bottom;

  // Responsive font sizes and stroke widths
  const fontSize = Math.max(8, Math.min(11, dimensions.width * 0.01));
  const strokeWidth = Math.max(1.5, Math.min(2.5, dimensions.width * 0.002));
  const circleRadius = Math.max(3, Math.min(4, dimensions.width * 0.003));

  const updateScales = useCallback(
    (currentData: number[]) => {
      xScale.current.domain([0, visibleCount - 1]).range([0, innerWidth]);

      let yMin = 0;
      let yMax = 0;

      if (currentData.length > 0) {
        const minVal = d3.min(currentData) as number;
        const maxVal = d3.max(currentData) as number;

        if (minVal === undefined || maxVal === undefined) {
          yMin = -1;
          yMax = 1;
        } else if (minVal === maxVal) {
          yMin = minVal - 1;
          yMax = maxVal + 1;
        } else {
          const domainExtent = maxVal - minVal;
          const paddingAmount = domainExtent * yPadding;
          yMin = minVal - paddingAmount;
          yMax = maxVal + paddingAmount;
        }
      } else {
        yMin = -1;
        yMax = 1;
      }

      yScale.current.domain([yMin, yMax]).range([innerHeight, 0]);

      lineGenerator.current
        .curve(d3.curveBasis)
        .x((d, i) => xScale.current(i))
        .y((d) => yScale.current(d));
    },
    [visibleCount, innerWidth, innerHeight, yPadding]
  );

  const updateAxes = useCallback(() => {
    if (!yAxisG.current || !xAxisG.current) return;

    const axisStyle = {
      color: "rgba(255, 255, 255, 0.4)",
      fontSize: `${fontSize}px`,
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontWeight: "500",
    };

    const yTicks = Math.max(
      3,
      Math.min(6, Math.floor(dimensions.height / 100))
    );
    yAxisG.current
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisLeft(yScale.current)
          .tickSize(-innerWidth)
          .tickFormat((d) => d3.format(",.2f")(d as number))
          .ticks(yTicks)
          .tickPadding(8) as any
      )
      .call((g) => {
        g.selectAll("line")
          .attr("stroke", "rgba(255, 255, 255, 0.08)")
          .attr("stroke-dasharray", "2,2");
        g.selectAll("text")
          .attr("fill", axisStyle.color)
          .style("font-size", axisStyle.fontSize)
          .style("font-family", axisStyle.fontFamily)
          .style("font-weight", axisStyle.fontWeight)
          .style("text-shadow", "0 0 10px rgba(255,255,255,0.1)");
        g.select(".domain")
          .attr("stroke", "rgba(255, 255, 255, 0.15)")
          .attr("stroke-width", "1.5");
      });

    const xTicks = Math.max(4, Math.min(8, Math.floor(dimensions.width / 100)));
    xAxisG.current
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .call(
        d3
          .axisBottom(xScale.current)
          .tickSize(-innerHeight)
          .ticks(xTicks)
          .tickPadding(8) as any
      )
      .call((g) => {
        g.selectAll("line")
          .attr("stroke", "rgba(255, 255, 255, 0.08)")
          .attr("stroke-dasharray", "2,2");
        g.selectAll("text")
          .attr("fill", axisStyle.color)
          .style("font-size", axisStyle.fontSize)
          .style("font-family", axisStyle.fontFamily)
          .style("font-weight", axisStyle.fontWeight)
          .style("text-shadow", "0 0 10px rgba(255,255,255,0.1)");
        g.select(".domain")
          .attr("stroke", "rgba(255, 255, 255, 0.15)")
          .attr("stroke-width", "1.5");
      });
  }, [dimensions.height, dimensions.width]);

  const runAnimationCycle = useCallback(() => {
    if (dataQueue.current.length === 0) {
      isAnimating.current = false;
      return;
    }
    isAnimating.current = true;

    const pointToAdd = dataQueue.current.shift()!;
    const currentData = (d3.select(pathRef.current).datum() as number[]) || [];
    const newData = [...currentData, pointToAdd];
    const dataAfterShift = newData.slice(1);

    updateScales(newData);
    updateAxes();

    const pathSelection = d3.select(pathRef.current);

    pathSelection
      .datum(newData)
      .attr("d", lineGenerator.current)
      .attr("transform", null)
      .transition()
      .duration(500 / (1 + dataQueue.current.length * 0.1))
      .ease(d3.easeLinear)
      .attr(
        "transform",
        `translate(${xScale.current(0) - xScale.current(1)}, 0)`
      )
      .on("end", () => {
        pathSelection
          .datum(dataAfterShift)
          .attr("d", lineGenerator.current)
          .attr("transform", null);
        runAnimationCycle();
      });
  }, [updateScales, updateAxes]);

  useEffect(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0 || !GRef.current)
      return;

    const group = d3.select(GRef.current);
    group.selectAll(".axis").remove();

    yAxisG.current = group.append("g").attr("class", "axis axis--y");
    xAxisG.current = group
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", `translate(0,${innerHeight})`);

    xScale.current.range([0, innerWidth]);
    yScale.current.range([innerHeight, 0]);

    xAxisG.current.call(d3.axisBottom(xScale.current) as any);
  }, [dimensions.width, dimensions.height, innerWidth, innerHeight]);

  useEffect(() => {
    if (dataPoint === null) return;

    if (!isInitialized.current) {
      const initialData = Array(visibleCount).fill(dataPoint);
      updateScales(initialData);
      updateAxes();
      d3.select(pathRef.current)
        .datum(initialData)
        .attr("d", lineGenerator.current);

      isInitialized.current = true;
      if (dataQueue.current.length > 0) {
        runAnimationCycle();
      }
    } else {
      dataQueue.current.push(dataPoint);
      if (!isAnimating.current) {
        runAnimationCycle();
      }
    }
  }, [dataPoint, runAnimationCycle, visibleCount, updateScales, updateAxes]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const isMobile = window.innerWidth <= 768;

        if (width > 0 && height > 0) {
          setDimensions({
            width: isMobile ? width : initialWidth,
            height: isMobile ? height : initialHeight,
          });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [initialWidth, initialHeight]);

  // Update dimensions when props change
  useEffect(() => {
    setDimensions({
      width: initialWidth,
      height: initialHeight,
    });
  }, [initialWidth, initialHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        maxWidth: initialWidth,
        maxHeight: initialHeight,
      }}
      className="size-full relative min-h-[500px]"
    >
      <svg
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible absolute inset-0"
        style={{
          filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.1))",
        }}
      >
        <defs>
          {/* Main line gradient */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.9" />
          </linearGradient>

          {/* Area gradient */}
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          {/* Glow effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Grid pattern */}
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <g
          ref={GRef}
          transform={`translate(${responsiveMargin.left},${responsiveMargin.top})`}
          className="transition-all duration-300 ease-in-out"
        >
          {/* Background grid */}
          <rect
            width={innerWidth}
            height={innerHeight}
            fill="url(#grid)"
            className="transition-opacity duration-300"
          />

          <defs>
            <clipPath id="clip">
              <rect width={innerWidth} height={innerHeight}></rect>
            </clipPath>
          </defs>

          <g clipPath="url(#clip)">
            {/* Area fill */}
            <path
              ref={pathRef}
              fill="url(#areaGradient)"
              stroke="none"
              opacity="0.4"
              className="transition-all duration-300"
            />

            {/* Main line */}
            <path
              ref={pathRef}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth={`${strokeWidth}px`}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-300"
            />

            {/* Interactive highlight circle */}
            <circle
              r={circleRadius}
              fill="white"
              stroke="url(#lineGradient)"
              strokeWidth={strokeWidth}
              filter="url(#glow)"
              opacity="0"
              className="transition-all duration-200"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ChartContainer;

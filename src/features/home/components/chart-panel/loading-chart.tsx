"use client";

import {
  useSpring,
  animated,
  useTrail,
  useTransition,
} from "@react-spring/web";
import { useEffect, useState } from "react";

/**
 * LoadingChart component provides an animated loading state for the trading chart.
 * Features multiple layered animations including:
 * - Pulsing background effects
 * - Animated price levels
 * - Simulated candlesticks and volume bars
 * - Floating particles
 * - Glowing effects and decorative elements
 *
 * The component uses react-spring for smooth animations and transitions.
 * All animations are optimized for performance and visual appeal.
 *
 * @example
 * ```tsx
 * <LoadingChart />
 * ```
 */
const LoadingChart = () => {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setShowParticles(true);
  }, []);

  /**
   * Main pulse animation for the background
   * Creates a subtle breathing effect
   */
  const pulseAnimation = useSpring({
    from: { opacity: 0.3 },
    to: { opacity: 0.7 },
    loop: { reverse: true },
    config: { duration: 1500 },
  });

  /**
   * Wave animation for the loading indicator
   * Creates a smooth horizontal movement
   */
  const waveAnimation = useSpring({
    from: { transform: "translateX(-100%)" },
    to: { transform: "translateX(100%)" },
    loop: true,
    config: { duration: 2000, tension: 280, friction: 60 },
  });

  /**
   * Price level animations
   * Creates a grid of animated lines representing price levels
   */
  const priceLevels = useTrail(12, {
    from: { opacity: 0.2, scale: 0.98 },
    to: { opacity: 0.4, scale: 1 },
    loop: { reverse: true },
    config: { duration: 1200 },
  });

  /**
   * Candlestick animations
   * Simulates trading activity with animated bars
   */
  const candlesticks = useTrail(30, {
    from: { opacity: 0.2, height: 0 },
    to: { opacity: 0.6, height: Math.random() * 100 },
    loop: { reverse: true },
    config: { duration: 1500 },
  });

  /**
   * Volume bar animations
   * Simulates trading volume with animated bars
   */
  const volumeBars = useTrail(30, {
    from: { opacity: 0.2, height: 0 },
    to: { opacity: 0.4, height: Math.random() * 30 },
    loop: { reverse: true },
    config: { duration: 1500 },
  });

  /**
   * Floating particles animation
   * Creates a dynamic background effect with floating dots
   */
  const particles = useTransition(
    showParticles ? Array.from({ length: 40 }) : [],
    {
      from: {
        opacity: 0,
        transform: "translateY(0) scale(0)",
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      enter: (item, i) => async (next) => {
        await next({
          opacity: 0.8,
          transform: "translateY(-20px) scale(1)",
          x: Math.random() * 100,
          y: Math.random() * 100,
          config: { duration: 1000 + Math.random() * 1000 },
        });
      },
      leave: {
        opacity: 0,
        transform: "translateY(-40px) scale(0)",
      },
      config: { tension: 280, friction: 60 },
    }
  );

  /**
   * Glowing effect animation
   * Adds a subtle pulsing glow to elements
   */
  const glowAnimation = useSpring({
    from: { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
    to: { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
    loop: { reverse: true },
    config: { duration: 2000 },
  });

  return (
    <div className="size-full flex items-center justify-center relative overflow-hidden">
      {/* Background with enhanced gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
      </div>

      {/* Price levels with enhanced glow effect */}
      <div className="absolute inset-0 flex flex-col justify-between py-12">
        {priceLevels.map((props, i) => (
          <animated.div
            key={i}
            style={props}
            className="w-full h-px bg-gradient-to-r from-transparent via-slate-700/30 to-transparent"
          />
        ))}
      </div>

      {/* Main chart area with enhanced styling */}
      <div className="absolute inset-0 flex flex-col">
        {/* Candlesticks with enhanced gradients */}
        <div className="flex-1 flex items-end justify-around px-4 py-8">
          {candlesticks.map((props, i) => (
            <animated.div
              key={i}
              style={props}
              className="w-2 bg-gradient-to-b from-blue-500/50 via-blue-500/30 to-blue-500/10 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.2)]"
            />
          ))}
        </div>

        {/* Volume bars with enhanced styling */}
        <div className="h-20 flex items-end justify-around px-4 pb-4">
          {volumeBars.map((props, i) => (
            <animated.div
              key={i}
              style={props}
              className="w-2 bg-gradient-to-b from-slate-600/50 via-slate-600/30 to-slate-600/10 rounded-sm shadow-[0_0_8px_rgba(148,163,184,0.2)]"
            />
          ))}
        </div>
      </div>

      {/* Enhanced loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-slate-300 text-lg font-medium tracking-wide bg-slate-800/50 px-8 py-4 rounded-lg backdrop-blur-sm border border-slate-700/50 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span>Loading market data</span>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
          <div className="w-48 h-1 relative overflow-hidden rounded-full bg-slate-700/30 shadow-inner">
            <animated.div
              style={waveAnimation}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Corner accents with enhanced glow */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />

      {/* Additional decorative elements with enhanced gradients */}
      <div className="absolute top-1/2 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute top-1/2 right-0 w-1/3 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="absolute top-1/3 left-0 w-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
      <div className="absolute top-2/3 right-0 w-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />

      {/* Floating particles */}
      {particles((style, item, _, i) => (
        <animated.div
          key={i}
          style={{
            ...style,
            position: "absolute",
            width: "4px",
            height: "4px",
            background: "rgba(59, 130, 246, 0.6)",
            borderRadius: "50%",
            left: `${style.x}%`,
            top: `${style.y}%`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingChart;

"use client";

import React from "react";

interface OrderButtonProps {
  isAnimating: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  label?: string;
  successLabel?: string;
  className?: string;
}

/**
 * Animated Delivery Truck Order Button
 * Based on the Aaron Iker micro-interaction with truck parcel loading,
 * speed lines, and animated draw-in checkmark upon order completion.
 */
export default function OrderButton({
  isAnimating,
  disabled,
  onClick,
  type = "submit",
  label = "Complete Order",
  successLabel = "Order Placed",
  className = "",
}: OrderButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isAnimating}
      onClick={onClick}
      className={`order ${isAnimating ? "animate" : ""} ${className}`}
      aria-label={isAnimating ? successLabel : label}
    >
      <span className="default">{label}</span>
      <span className="success">
        {successLabel}{" "}
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" />
        </svg>
      </span>
      <div className="box" />
      <div className="truck">
        <div className="back" />
        <div className="fronts">
          <div className="window" />
        </div>
        <div className="light top" />
        <div className="light bottom" />
      </div>
      <div className="lines" />
    </button>
  );
}

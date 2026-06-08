import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "../context/ThemeContext";

const Typography = ({
  variant = "body",
  as,
  className = "",
  children,
  color,
  ...props
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const baseStyles = "font-display transition-colors duration-200";

  const variants = {
    h1: "text-4xl md:text-4xl lg:text-4xl font-bold leading-tight",
    h2: "text-3xl md:text-4xl font-bold leading-tight",
    h3: "text-2xl md:text-3xl font-semibold leading-snug",
    h4: "text-xl md:text-2xl font-semibold leading-snug",
    h5: "text-lg md:text-xl font-medium leading-normal",
    h6: "text-base md:text-lg font-medium leading-normal",
    body: "text-base md:text-md leading-relaxed",
    small: "text-sm leading-normal",
    caption: "text-xs leading-normal",
    button: "text-sm font-semibold uppercase tracking-wide",
  };

  const colors = {
    primary: isDark ? "text-white" : "text-gray-900",
    secondary: isDark ? "text-gray-300" : "text-gray-600",
    muted: isDark ? "text-gray-400" : "text-gray-500",
    accent: "text-red-500",
    white: "text-white",
    black: "text-black",
    inherit: "text-inherit",
  };

  // Determine the HTML tag
  const Component = as || (variant.startsWith("h") ? variant : "p");

  // Determine the color class
  const colorClass = color ? colors[color] : colors.primary;

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${colorClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "body",
    "small",
    "caption",
    "button",
  ]),
  as: PropTypes.elementType,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "muted",
    "accent",
    "white",
    "black",
    "inherit",
  ]),
};

export default Typography;

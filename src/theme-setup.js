import colorScales from './theme-color-scales.json';

function applyTheme(mode = 'light') {
  const theme = colorScales[mode];
  const root = document.documentElement;
  
  // Set CSS variables for each color and its scale
  Object.entries(theme).forEach(([colorName, colorData]) => {
    // Set the base color
    root.style.setProperty(`--${colorName}`, colorData.base);
    
    // Set each scale value
    Object.entries(colorData.scale).forEach(([scaleValue, color]) => {
      root.style.setProperty(`--${colorName}-${scaleValue}`, color);
    });
  });
}

// Export the function to be used in your Vue app
export { applyTheme }; 
const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js'); // We'll use this library for color manipulation

// Define the scale steps (standard is typically 50, 100, 200, ..., 900)
const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Read the theme-colors.json file
const themePath = path.join(__dirname, 'theme-colors.json');
const themeColors = JSON.parse(fs.readFileSync(themePath, 'utf8'));

// Object to store our generated scales
const colorScales = {};

// Process each theme mode (light, dark)
Object.entries(themeColors).forEach(([themeName, themeVariables]) => {
  // Initialize theme in the color scales object
  colorScales[themeName] = {};
  
  // Process each color in the theme
  Object.entries(themeVariables).forEach(([colorName, baseColor]) => {
    // Generate a scale from light to dark for this color
    const scale = {};
    
    // Create a color scale using chroma.js
    // The domain sets the input range (0-1), the range sets the output colors
    const colorScale = chroma.scale(['#ffffff', baseColor, '#000000'])
      .domain([0, 0.5, 1])
      .mode('lab'); // Lab color space often gives better results for color scales
    
    // Generate each step in the scale
    scaleSteps.forEach(step => {
      // Map 50-900 to a 0-1 scale for chroma
      const value = (step - 50) / 850;
      scale[step] = colorScale(value).hex();
    });
    
    // Add to our color scales object
    colorScales[themeName][colorName] = {
      base: baseColor,
      scale: scale
    };
  });
});

// Write the result to a new file
const outputPath = path.join(__dirname, 'theme-color-scales.json');
fs.writeFileSync(outputPath, JSON.stringify(colorScales, null, 2));

console.log(`Color scales generated and saved to ${outputPath}`); 
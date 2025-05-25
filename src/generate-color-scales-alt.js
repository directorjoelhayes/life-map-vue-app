const fs = require('fs');
const path = require('path');
const chroma = require('chroma-js');

// Define the scale steps
const scaleSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Read the theme-colors.json file
const themePath = path.join(__dirname, 'theme-colors.json');
const themeColors = JSON.parse(fs.readFileSync(themePath, 'utf8'));

// Object to store our generated scales
const colorScales = {};

// This assumes your theme-colors.json has base colors defined somewhere
// Adjust this according to your actual JSON structure
Object.entries(themeColors).forEach(([variableName, useCase]) => {
  // For this example, let's assume you need to provide base colors separately
  // since they're not in your JSON
  
  // Example mapping - replace with your actual base colors
  const baseColorMap = {
    'primary': '#1976d2',
    'secondary': '#9c27b0',
    'success': '#2e7d32',
    'warning': '#ed6c02',
    'error': '#d32f2f',
    'info': '#0288d1',
    // Add other colors as needed
  };
  
  // Get the base color for this use case
  const baseColor = baseColorMap[useCase.toLowerCase()];
  
  if (!baseColor) {
    console.log(`No base color defined for "${useCase}"`);
    return;
  }
  
  // Generate color scale as before
  const scale = {};
  const colorScale = chroma.scale(['#ffffff', baseColor, '#000000'])
    .domain([0, 0.5, 1])
    .mode('lab');
  
  scaleSteps.forEach(step => {
    const value = (step - 50) / 850;
    scale[step] = colorScale(value).hex();
  });
  
  colorScales[variableName] = {
    useCase: useCase,
    base: baseColor,
    scale: scale
  };
});

// Write the result to a new file
const outputPath = path.join(__dirname, 'theme-color-scales.json');
fs.writeFileSync(outputPath, JSON.stringify(colorScales, null, 2));

console.log(`Color scales generated and saved to ${outputPath}`); 
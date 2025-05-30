const handleResizePointerMove = (event) => {
  if (!isResizing.value) return;
  
  const deltaX = event.clientX - startX.value;
  const deltaY = event.clientY - startY.value;
  
  let newWidth = props.width;
  let newHeight = props.height;
  let newX = props.x;
  let newY = props.y;
  
  // Handle different resize directions
  switch (isResizing.value) {
    case 'east':
      newWidth = props.width + deltaX;
      break;
    case 'west':
      newWidth = props.width - deltaX;
      newX = initialX.value + deltaX;
      break;
    case 'north':
      newHeight = props.height - deltaY;
      newY = initialY.value + deltaY;
      break;
    case 'south':
      newHeight = props.height + deltaY;
      break;
    case 'north-east':
      newWidth = props.width + deltaX;
      newHeight = props.height - deltaY;
      newY = initialY.value + deltaY;
      break;
    case 'north-west':
      newWidth = props.width - deltaX;
      newHeight = props.height - deltaY;
      newX = initialX.value + deltaX;
      newY = initialY.value + deltaY;
      break;
    case 'south-east':
      newWidth = props.width + deltaX;
      newHeight = props.height + deltaY;
      break;
    case 'south-west':
      newWidth = props.width - deltaX;
      newHeight = props.height + deltaY;
      newX = initialX.value + deltaX;
      break;
  }
  
  // Enforce minimum dimensions
  const minWidth = 100;
  const minHeight = 100;
  
  if (newWidth < minWidth) {
    if (isResizing.value.includes('west')) {
      newX = initialX.value + (props.width - minWidth);
    }
    newWidth = minWidth;
  }
  
  if (newHeight < minHeight) {
    if (isResizing.value.includes('north')) {
      newY = initialY.value + (props.height - minHeight);
    }
    newHeight = minHeight;
  }
  
  // Emit the updated position and dimensions
  emit("update:resize", {
    direction: isResizing.value,
    width: newWidth,
    height: newHeight,
    x: newX,
    y: newY
  });
}; 
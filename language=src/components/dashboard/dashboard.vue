const onResize = (id, resize) => {
  const item = items.value.find((item) => item.id === id);
  if (item) {
    // Update width and height
    item.width = snapToGrid(resize.width);
    item.height = snapToGrid(resize.height);
    
    // Update position if resizing from left or top edges
    if (resize.x !== undefined) {
      item.x = snapToGrid(resize.x);
    }
    if (resize.y !== undefined) {
      item.y = snapToGrid(resize.y);
    }
    
    // Ensure the item stays within container boundaries
    if (dashboardContainer.value) {
      const containerWidth = dashboardContainer.value.clientWidth;
      const containerHeight = dashboardContainer.value.clientHeight;
      
      // Check boundaries and adjust if needed
      if (item.x < 0) {
        item.x = 0;
        item.width = resize.width + resize.x; // Adjust width when hitting left boundary
      }
      
      if (item.y < 0) {
        item.y = 0;
        item.height = resize.height + resize.y; // Adjust height when hitting top boundary
      }
      
      if (item.x + item.width > containerWidth) {
        item.width = containerWidth - item.x;
      }
      
      if (item.y + item.height > containerHeight) {
        item.height = containerHeight - item.y;
      }
    }
  }
}; 
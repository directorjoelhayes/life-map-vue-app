// rippleDirective.js
export const ripple = {
    mounted(el, binding) {
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
  
      el.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
  
        // Position and size
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
  
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.background = binding.value || 'rgba(0, 0, 0, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        ripple.style.opacity = '1';
  
        el.appendChild(ripple);
  
        // Trigger animation
        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(2)';
          ripple.style.opacity = '0';
        });
  
        // Cleanup
        setTimeout(() => {
          ripple.remove();
        }, 400);
      });
    }
  };
  
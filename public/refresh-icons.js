// Script to force refresh icons
(function() {
  const timestamp = '20240600001';
  
  // Preload all icon images
  const iconUrls = [
    `/icon.svg?v=${timestamp}`,
    `/favicon.svg?v=${timestamp}`,
    `/logo.svg?v=${timestamp}`,
    `/logo-with-icon.svg?v=${timestamp}`
  ];
  
  // Force browser to load these images
  iconUrls.forEach(url => {
    const img = new Image();
    img.src = url;
    console.log(`Preloading: ${url}`);
  });
  
  // Update favicon
  const updateFavicon = () => {
    const linkElements = document.querySelectorAll('link[rel="icon"]');
    if (linkElements.length === 0) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = `/favicon.svg?v=${timestamp}`;
      newLink.type = 'image/svg+xml';
      document.head.appendChild(newLink);
      console.log('Added new favicon link');
    } else {
      linkElements.forEach(link => {
        const oldHref = link.href;
        link.href = `/favicon.svg?v=${timestamp}`;
        console.log(`Updated favicon from ${oldHref} to ${link.href}`);
      });
    }
    
    // Also update apple-touch-icon
    const appleIconElements = document.querySelectorAll('link[rel="apple-touch-icon"]');
    if (appleIconElements.length === 0) {
      const newLink = document.createElement('link');
      newLink.rel = 'apple-touch-icon';
      newLink.href = `/icon.svg?v=${timestamp}`;
      document.head.appendChild(newLink);
      console.log('Added new apple-touch-icon link');
    } else {
      appleIconElements.forEach(link => {
        const oldHref = link.href;
        link.href = `/icon.svg?v=${timestamp}`;
        console.log(`Updated apple-touch-icon from ${oldHref} to ${link.href}`);
      });
    }
  };
  
  // Run when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFavicon);
  } else {
    updateFavicon();
  }
  
  console.log('Icon refresh script executed');
})(); 
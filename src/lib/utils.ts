import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a dominant color from an image URL
 * @param imageUrl URL of the image to extract color from
 * @returns Promise resolving to an RGB color string or null if extraction fails
 */
export const extractDominantColor = async (imageUrl: string): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  return new Promise((resolve) => {
    try {
      // Create an image element to load the image
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        try {
          // Create a canvas to draw the image and analyze colors
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            resolve(null);
            return;
          }
          
          // Size the canvas to the image
          const size = Math.min(img.width, img.height, 100); // Limit size for performance
          canvas.width = size;
          canvas.height = size;
          
          // Draw image on canvas
          context.drawImage(img, 0, 0, size, size);
          
          // Get image data
          const imageData = context.getImageData(0, 0, size, size);
          const pixels = imageData.data;
          
          // Simple color averaging for dominant color
          let r = 0, g = 0, b = 0, count = 0;
          
          for (let i = 0; i < pixels.length; i += 4) {
            // Skip transparent pixels
            if (pixels[i + 3] < 128) continue;
            
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            count++;
          }
          
          if (count > 0) {
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            resolve(`rgb(${r}, ${g}, ${b})`);
          } else {
            // Default color if we couldn't extract
            resolve('rgb(79, 70, 229)');
          }
        } catch (error) {
          console.error('Error processing image data:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        resolve(null);
      };
      
      img.src = imageUrl;
      
      // Set a timeout to avoid hanging
      setTimeout(() => {
        if (!img.complete) {
          resolve(null);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error extracting dominant color:', error);
      resolve(null);
    }
  });
};

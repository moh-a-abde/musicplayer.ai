"use client";

import { useEffect, useRef, useState } from 'react';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "This music platform completely changed how I discover new artists. The AI recommendations are spot on!",
    author: "Alex Johnson",
    role: "Premium Member"
  },
  {
    id: 2,
    quote: "I've been able to find so many hidden gems from indie artists that I never would have discovered otherwise.",
    author: "Sophia Kim",
    role: "Music Producer"
  },
  {
    id: 3,
    quote: "The playlist creation tools are incredible. I can create the perfect mood for any occasion in seconds.",
    author: "Marcus Chen",
    role: "DJ & Content Creator"
  },
  {
    id: 4,
    quote: "I've tried many music platforms but this one has the best interface and sound quality by far.",
    author: "Jamie Rodriguez",
    role: "Audio Engineer"
  },
  {
    id: 5,
    quote: "The cross-platform sync is seamless. My playlists are always up to date no matter which device I'm using.",
    author: "Priya Patel",
    role: "Everyday Listener"
  },
  {
    id: 6,
    quote: "As someone who loves music from all decades, I appreciate how this platform makes discovering classics just as easy as new releases.",
    author: "Thomas Wilson",
    role: "Music Enthusiast"
  },
];

export default function TestimonialScroller() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    
    // Set initial scroll position to 0
    scroller.scrollTop = 0;
    
    // Calculate the height of a single testimonial (average)
    const testimonialHeight = scroller.scrollHeight / (testimonials.length * 2);
    
    // Auto-scrolling animation
    const scrollInterval = setInterval(() => {
      if (isHovered) return;
      
      // Get current scroll position
      const currentScroll = scroller.scrollTop;
      
      // If we've scrolled to the halfway point, reset to top to create infinite loop
      if (currentScroll >= scroller.scrollHeight / 2 - testimonialHeight) {
        scroller.scrollTop = 0;
      } else {
        // Smooth scrolling - increment by small amount
        scroller.scrollTop = currentScroll + 1;
      }
    }, 30); // Adjust timing for faster/slower scrolling
    
    return () => {
      clearInterval(scrollInterval);
    };
  }, [isHovered]);
  
  // Triple the testimonials for smoother continuous scrolling
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials];
  
  return (
    <div 
      className="relative h-full max-h-[500px] overflow-hidden rounded-lg bg-gradient-to-b from-indigo-600 to-purple-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlays for smooth fade in/out effect */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-indigo-600 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-purple-700 to-transparent z-10 pointer-events-none" />
      
      {/* Scrolling container */}
      <div 
        ref={scrollerRef}
        className="h-full overflow-y-auto scrollbar-hide py-6"
      >
        <div className="px-6">
          {allTestimonials.map((testimonial, index) => (
            <div 
              key={`${testimonial.id}-${index}`}
              className="mb-6 p-5 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
            >
              <p className="text-gray-800 text-lg mb-4 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-gray-900 font-semibold">{testimonial.author}</p>
                  <p className="text-indigo-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

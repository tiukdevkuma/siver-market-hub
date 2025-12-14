import { useEffect, useState } from "react";

export const PageLoader = () => {
  const [faviconUrl, setFaviconUrl] = useState<string>("/favicon.ico");

  useEffect(() => {
    const updateFavicon = () => {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link && link.href) {
        setFaviconUrl(link.href);
      }
    };

    updateFavicon();

    // Observe DOM changes in case the favicon changes dynamically
    const observer = new MutationObserver(updateFavicon);
    observer.observe(document.head, { childList: true, subtree: true, attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Spinning Circle */}
        <div className="h-24 w-24 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        
        {/* Favicon in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={faviconUrl} 
            alt="Loading..." 
            className="h-10 w-10 object-contain"
            onError={(e) => {
              // Fallback if favicon fails to load, maybe hide it or show a default icon
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
      <div className="container flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6 md:max-w-2xl md:py-24 lg:max-w-3xl lg:py-32">
        {/* 404 SVG Animation */}
        <div className="relative mb-8 h-64 w-64 md:h-80 md:w-80">
          <svg
            className="absolute inset-0"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="var(--primary)"
              d="M47.5,-57.2C59.9,-45.8,67.4,-29.6,71.1,-12.1C74.8,5.4,74.7,24.1,66.3,38.5C57.9,52.9,41.2,62.9,23.5,68.4C5.8,73.9,-12.9,74.9,-29.9,68.8C-46.9,62.7,-62.2,49.6,-70.1,32.7C-78,15.8,-78.5,-4.9,-71.3,-22.1C-64.1,-39.3,-49.2,-53,-33.5,-64.1C-17.8,-75.2,-1.3,-83.7,13.6,-79.9C28.5,-76.1,35.1,-68.6,47.5,-57.2Z"
              transform="translate(100 100)"
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="M47.5,-57.2C59.9,-45.8,67.4,-29.6,71.1,-12.1C74.8,5.4,74.7,24.1,66.3,38.5C57.9,52.9,41.2,62.9,23.5,68.4C5.8,73.9,-12.9,74.9,-29.9,68.8C-46.9,62.7,-62.2,49.6,-70.1,32.7C-78,15.8,-78.5,-4.9,-71.3,-22.1C-64.1,-39.3,-49.2,-53,-33.5,-64.1C-17.8,-75.2,-1.3,-83.7,13.6,-79.9C28.5,-76.1,35.1,-68.6,47.5,-57.2Z;
                M43.1,-49.6C55.4,-39.9,64.9,-25.2,68.2,-8.7C71.5,7.8,68.7,26.1,59.3,39.9C49.9,53.7,33.9,63,16.4,68.5C-1.1,74,-20.1,75.7,-35.6,68.7C-51.1,61.7,-63.1,46,-69.8,27.7C-76.5,9.5,-77.9,-11.3,-70.8,-28.5C-63.7,-45.7,-48.1,-59.3,-31.6,-67.1C-15.1,-74.9,3.3,-76.9,18.4,-70.3C33.5,-63.7,30.8,-59.3,43.1,-49.6Z;
                M47.5,-57.2C59.9,-45.8,67.4,-29.6,71.1,-12.1C74.8,5.4,74.7,24.1,66.3,38.5C57.9,52.9,41.2,62.9,23.5,68.4C5.8,73.9,-12.9,74.9,-29.9,68.8C-46.9,62.7,-62.2,49.6,-70.1,32.7C-78,15.8,-78.5,-4.9,-71.3,-22.1C-64.1,-39.3,-49.2,-53,-33.5,-64.1C-17.8,-75.2,-1.3,-83.7,13.6,-79.9C28.5,-76.1,35.1,-68.6,47.5,-57.2Z"
              />
            </path>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-6xl font-bold text-white md:text-7xl">404</h1>
          </div>
        </div>
      </div>
      {/* Decorative Elements */}
      <div className="bg-primary/10 absolute top-1/4 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full blur-3xl"></div>
      <div className="bg-primary/20 absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full blur-3xl"></div>
      <div className="bg-primary/10 absolute bottom-1/3 left-1/4 h-40 w-40 rounded-full blur-3xl"></div>
    </div>
  );
}

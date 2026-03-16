import React from "react";
import useCarousel from "../../hooks/useCarousel";
import { DEFAULT_IMAGE } from "../../utils/constants";

const ImageCarousel = ({ images }) => {
  const safeImages = images && images.length > 0 ? images : [];
  const { currentIndex, prev, next, currentImage } = useCarousel(safeImages);

  if (safeImages.length === 0) {
    return (
      <div className="image-carousel">
        <img src={DEFAULT_IMAGE} alt="Placeholder" className="carousel-image" />
      </div>
    );
  }

  return (
    <div className="image-carousel">
      {safeImages.length > 1 && (
        <button className="carousel-btn carousel-btn-prev" onClick={prev}>
          &#8249;
        </button>
      )}

     <img
        src={currentImage}  // was currentImage?.url
        alt={`Image ${currentIndex + 1}`}
        className="carousel-image"
      />
      

      {safeImages.length > 1 && (
        <button className="carousel-btn carousel-btn-next" onClick={next}>
          &#8250;
        </button>
      )}

      {safeImages.length > 1 && (
        <div className="carousel-dots">
          {safeImages.map((_, index) => (
            <span
              key={index}
              className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;

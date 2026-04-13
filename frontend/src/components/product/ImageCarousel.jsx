import React from "react";
import PropTypes from "prop-types";
import useCarousel from "../../hooks/useCarousel";
import { DEFAULT_IMAGE } from "../../utils/constants";

const ImageCarousel = ({ images, id }) => {
  const safeImages = images && images.length > 0 ? images : [];
  const { index, prev, next, currentImage } = useCarousel(safeImages);

  if (safeImages.length === 0) {
    return (
      <div id={id || "carousel-container"} className="image-carousel">
        <img id="carousel-active-img" src={DEFAULT_IMAGE} alt="Placeholder" className="carousel-image" />
      </div>
    );
  }

  return (
    <div id={id || "carousel-container"} className="image-carousel">
      {safeImages.length > 1 && (
        <button id="carousel-prev-btn" className="carousel-btn carousel-btn-prev" onClick={prev}>
          &#8249;
        </button>
      )}

      <img
        id="carousel-active-img"
        src={currentImage}
        alt={`Image ${index + 1}`}
        className="carousel-image"
      />

      {safeImages.length > 1 && (
        <button id="carousel-next-btn" className="carousel-btn carousel-btn-next" onClick={next}>
          &#8250;
        </button>
      )}

      {safeImages.length > 1 && (
        <div className="carousel-dots">
        {safeImages.map((img, i) => (
          <span
            key={img}
            className={`carousel-dot ${i === index ? "active" : ""}`}
          />
        ))}
        </div>
      )}
    </div>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  id: PropTypes.string,
};

export default ImageCarousel;

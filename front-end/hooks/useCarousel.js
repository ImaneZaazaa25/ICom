import { useState } from "react";

const useCarousel = (images = []) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () =>
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));

  const next = () =>
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return {
    currentIndex,
    prev,
    next,
    currentImage: images[currentIndex],
  };
};

export default useCarousel;

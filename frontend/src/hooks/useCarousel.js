import { useState } from "react";

/**
 * Gère l'état d'un carrousel d'images avec navigation.
 * @param {Array} images - Tableau des URLs d'images
 * @returns {{ index: number, prev: Function, next: Function, goTo: Function, currentImage: string|undefined }}
 */
const useCarousel = (images = []) => {
  const [index, setIndex] = useState(0);

  const prev = () => {
    if (images.length === 0) return;
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    if (images.length === 0) return;
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const goTo = (n) => {
    if (images.length === 0) return;
    setIndex(n);
  };

  return {
    index,
    currentIndex: index,
    prev,
    next,
    goTo,
    currentImage: images[index],
  };
};

export { useCarousel };
export default useCarousel;

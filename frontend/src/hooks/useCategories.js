import { useState, useEffect } from "react";
import { getAllCategories } from "../api/categoryApi";

const useCategories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  return categories;
};

export default useCategories;
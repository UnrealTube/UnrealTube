"use client";

import { useState } from "react";

const categories = [
  "All", "Music", "Gaming", "News", "Movies", "Sports",
  "Technology", "Science", "Travel", "Food", "Education",
  "Comedy", "Beauty", "Fitness", "Finance", "Animals",
];

interface CategoryFilterProps {
  onCategoryChange?: (category: string) => void;
  selectedCategory?: string;
}

export function CategoryFilter({ onCategoryChange, selectedCategory = "All" }: CategoryFilterProps) {
  const [active, setActive] = useState(selectedCategory);

  const handleClick = (cat: string) => {
    setActive(cat);
    onCategoryChange?.(cat);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: isActive
                ? "linear-gradient(135deg, #00D4FF, #8B5CF6)"
                : "rgba(255,255,255,0.06)",
              color: isActive ? "#050810" : "#7A8BA0",
              border: isActive
                ? "1px solid transparent"
                : "1px solid rgba(255,255,255,0.1)",
              boxShadow: isActive ? "0 0 15px rgba(0, 212, 255, 0.3)" : "none",
              fontWeight: isActive ? 700 : 500,
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

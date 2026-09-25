"use client";

import Button from "@/components/ui/Button";
import { resolveIcon } from "@/lib/utils/iconMap";
import type { Category } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryFilterBarProps {
  /** List of category objects to render as filter buttons. */
  categories: Category[];
  /** The currently active category name, or `null` for "All". */
  selectedCategory: string | null;
  /** Callback fired when the user picks a category (or `null` for "All"). */
  onSelectCategory: (categoryName: string | null) => void;
  /**
   * Optional label for the "All" button.
   * Defaults to `"# الكل"`.
   */
  allLabel?: string;
  /**
   * Optional message shown when `categories` is empty instead of returning `null`.
   * Pass `false` to keep the original "return null" behaviour.
   */
  emptyMessage?: string | false;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A horizontal (scrollable on mobile, wrapping on md+) row of pill buttons
 * used to filter a list by category.
 *
 * Usage:
 * ```tsx
 * <CategoryFilterBar
 *   categories={categories}
 *   selectedCategory={selectedCategory}
 *   onSelectCategory={setSelectedCategory}
 * />
 * ```
 */
const CategoryFilterBar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  allLabel = "# الكل",
  emptyMessage = false,
}: CategoryFilterBarProps) => {
  if (categories.length === 0) {
    if (emptyMessage) {
      return (
        <p className="text-sm text-gray-400 mt-2 italic">{emptyMessage}</p>
      );
    }
    return null;
  }

  return (
    <div className="flex md:flex-wrap gap-1 md:gap-2 mt-2 overflow-x-scroll md:overflow-x-auto catFilter">
      {/* "All" button */}
      <Button
        variant="solid"
        solidColor={selectedCategory === null ? "" : "#f3f4f6"}
        className={`text-sm transition-all flex justify-center items-center h-fit ${
          selectedCategory === null
            ? "gradient-primary text-white shadow-md"
            : "!text-gray-700 hover:!bg-gray-200 bg-glass"
        }  !px-1 min-w-24 !rounded-full h-fit`}
        onClick={() => onSelectCategory(null)}
      >
        {allLabel}
      </Button>

      {/* Category buttons */}
      {categories.map((category) => {
        const isActive = selectedCategory === category.name;
        const icon = resolveIcon(category.icon);

        return (
          <Button
            key={category.id}
            variant="solid"
            solidColor={isActive ? "" : "#f3f4f6"}
            className={`text-sm transition-all flex justify-center items-center h-fit ${
              isActive
                ? "gradient-primary text-white shadow-md"
                : "!text-gray-700 hover:!bg-gray-200 bg-glass"
            } py-2 px-6 min-w-40 !rounded-full`}
            onClick={() => onSelectCategory(category.name)}
            icon={icon}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilterBar;

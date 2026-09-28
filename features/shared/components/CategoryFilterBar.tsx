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
    <div className="catFilter mt-2 flex gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:gap-2 md:overflow-x-visible">
      {/* "All" button */}
      <Button
        variant="solid"
        solidColor={selectedCategory === null ? "" : "#f3f4f6"}
        className={`flex items-center justify-center rounded-full text-[11px] transition-all sm:text-xs md:text-sm ${
          selectedCategory === null
            ? "gradient-primary text-white shadow-md"
            : "bg-glass !text-gray-700 hover:!bg-gray-200"
        } !px-2 py-2 sm:!px-3 md:!px-4 min-w-[76px] h-[38px] md:h-[42px] md:min-w-[90px]`}
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
            className={`flex items-center justify-center rounded-full text-[11px] transition-all sm:text-xs md:text-sm ${
              isActive
                ? "gradient-primary text-white shadow-md"
                : "bg-glass !text-gray-700 hover:!bg-gray-200"
            } !px-2 py-2 sm:!px-3 md:!px-4 min-w-[90px] h-[38px] md:h-[42px] md:min-w-[120px]`}
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

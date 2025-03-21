"use client";

import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";
import {
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Sliders,
  Home,
} from "lucide-react";
import { Range, getTrackBackground } from "react-range";
import { Slider } from "@heroui/react";
import { ALL_CATEGORIES, getCategoryName } from "@/lib/categories";

// Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet as SheetPrimitive,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Drawer as DrawerPrimitive,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define interfaces for our data structures
interface Brand {
  id: string;
  name: string;
  nameKey?: string;
}

interface Subcategorie {
  id: string;
  nume: string;
  numeKey?: string;
}

interface CategoryWithSubcategories {
  id: string;
  nume: string;
  numeKey?: string;
  subcategorii: Subcategorie[];
}

interface FilterSystemProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  subcategories: string[];
  brands: string[];
  sortOption: string;
  inStock: boolean;
}

const defaultPriceRange: [number, number] = [0, 10000];
const sortOptions = [
  { value: "featured", label: "featured" },
  { value: "price-asc", label: "price_low_to_high" },
  { value: "price-desc", label: "price_high_to_low" },
  { value: "newest", label: "newest" },
  { value: "popularity", label: "popularity" },
];

// Add this custom SliderWrapper component
function SliderWrapper({
  value,
  onFinalChange,
  min,
  max,
  step = 10,
  label,
  formatOptions,
}: {
  value: [number, number];
  onFinalChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  formatOptions?: { style: "currency"; currency: string };
}) {
  // Local state for dragging - completely isolated from parent state
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const isDraggingRef = useRef(false);

  // Update local value when prop value changes (but not while dragging)
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <div>
      <Slider
        className="my-4"
        minValue={min}
        maxValue={max}
        step={step}
        label={label}
        formatOptions={formatOptions}
        value={localValue}
        onChange={(values) => {
          // Start dragging and update only local state
          isDraggingRef.current = true;
          setLocalValue(values as [number, number]);
        }}
        onChangeEnd={(values) => {
          // End dragging and notify parent
          isDraggingRef.current = false;
          onFinalChange(values as [number, number]);
        }}
      />
    </div>
  );
}

// Add this custom FilterBreadcrumb component
function FilterBreadcrumb({
  filters,
  categories,
  brands,
  handleRemoveFilter,
  handleClearFilters,
  viewMode = "desktop", // Add viewMode prop with default value
}: {
  filters: FilterOptions;
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  handleRemoveFilter: (type: string, id?: string) => void;
  handleClearFilters: () => void;
  viewMode?: "desktop" | "mobile" | "tablet"; // New prop to specify the view
}) {
  const { t } = useLanguage();
  const router = useRouter();

  // Check if any filters are active
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.inStock ||
    filters.priceRange[0] > defaultPriceRange[0] ||
    filters.priceRange[1] < defaultPriceRange[1];

  // Mobile and tablet breadcrumbs get different styling
  const isMobileOrTablet = viewMode === "mobile" || viewMode === "tablet";

  // Apply device-specific classes
  const breadcrumbClasses = cn(
    "mb-4",
    isMobileOrTablet && "overflow-x-auto pb-1 scrollbar-hide max-w-full",
    viewMode === "desktop" ? "block" : "md:block lg:hidden"
  );

  const listClasses = cn(isMobileOrTablet && "whitespace-nowrap min-w-max");

  return (
    <Breadcrumb className={breadcrumbClasses}>
      <BreadcrumbList className={listClasses}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center">
            <Home className="h-3.5 w-3.5 mr-1" />
            {t("home")}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />

        <BreadcrumbItem>
          {/* If there are no active filters, "All Products" is the current page */}
          {!hasActiveFilters ? (
            <BreadcrumbPage className="text-sm font-semibold">
              {t("all_products")}
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              href="/catalog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("all_products")}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {filters.categories.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-primary font-medium">
                  {filters.categories.length === 1
                    ? categories.find((c) => c.id === filters.categories[0])
                        ?.numeKey
                      ? t(
                          categories.find((c) => c.id === filters.categories[0])
                            ?.numeKey || ""
                        )
                      : categories.find((c) => c.id === filters.categories[0])
                          ?.nume
                    : t("categories") + ` (${filters.categories.length})`}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {filters.categories.map((catId) => {
                    const category = categories.find((c) => c.id === catId);
                    if (!category) return null;
                    return (
                      <DropdownMenuItem
                        key={catId}
                        onClick={() => handleRemoveFilter("category", catId)}
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        {category.numeKey ? t(category.numeKey) : category.nume}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {filters.brands.length > 0 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-primary font-medium">
                  {filters.brands.length === 1
                    ? brands.find((b) => b.id === filters.brands[0])?.nameKey
                      ? t(
                          brands.find((b) => b.id === filters.brands[0])
                            ?.nameKey || ""
                        )
                      : brands.find((b) => b.id === filters.brands[0])?.name
                    : t("brands") + ` (${filters.brands.length})`}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {filters.brands.map((brandId) => {
                    const brand = brands.find((b) => b.id === brandId);
                    if (!brand) return null;
                    return (
                      <DropdownMenuItem
                        key={brandId}
                        onClick={() => handleRemoveFilter("brand", brandId)}
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        {brand.nameKey ? t(brand.nameKey) : brand.name}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {(filters.priceRange[0] > defaultPriceRange[0] ||
          filters.priceRange[1] < defaultPriceRange[1]) && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                onClick={() => handleRemoveFilter("price")}
                className="cursor-pointer text-primary font-medium"
              >
                {filters.priceRange[0]}-{filters.priceRange[1]} MDL
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {filters.inStock && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage
                onClick={() => handleRemoveFilter("inStock")}
                className="cursor-pointer text-primary font-medium"
              >
                {t("in_stock_only")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}

        {hasActiveFilters && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-sm text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                {t("clear_all")}
              </Button>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Define interfaces for the memoized components
interface FilterContentProps {
  filters: FilterOptions;
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  handlePriceChange: (value: number[]) => void;
  handleCategoryChange: (categoryId: string) => void;
  handleSubcategoryChange: (subcategoryId: string, categoryId: string) => void;
  handleBrandChange: (brandId: string) => void;
  handleSortChange: (value: string) => void;
  handleInStockChange: (checked: CheckedState) => void;
  handleClearFilters: () => void;
  handleRemoveFilter: (type: string, id?: string) => void;
  defaultPriceRange: [number, number];
  activeFilterCount: number;
  sortOptions: { value: string; label: string }[];
  t: (key: string) => string;
}

interface TabletFilterContentProps extends FilterContentProps {
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MobileFilterContentProps extends FilterContentProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Update the memo function definitions
const MemoizedFilterContent = memo(function MemoizedFilterContent({
  filters,
  categories,
  brands,
  handlePriceChange,
  handleCategoryChange,
  handleSubcategoryChange,
  handleBrandChange,
  handleSortChange,
  handleInStockChange,
  handleClearFilters,
  handleRemoveFilter,
  defaultPriceRange,
  activeFilterCount,
  sortOptions,
  t,
}: FilterContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Sort - always visible on all devices */}
      <div className="bg-card rounded-lg border p-3 shadow-sm">
        <Label className="text-sm font-semibold mb-1.5 block text-foreground">
          {t("sort_by")}
        </Label>
        <Select value={filters.sortOption} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full text-base h-9 bg-background border-primary/20 hover:border-primary">
            <SelectValue placeholder={t("sort_by")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option: { value: string; label: string }) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="bg-card rounded-lg border p-3 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="font-semibold text-sm">{t("active_filters")}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 px-2 text-sm text-muted-foreground hover:text-primary"
            >
              {t("clear_all")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {filters.categories.map((categoryId: string) => {
              const category = categories.find(
                (c: CategoryWithSubcategories) => c.id === categoryId
              );
              if (!category) return null;
              return (
                <Badge
                  key={`cat-${categoryId}`}
                  variant="outline"
                  className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-sm"
                  onClick={() => handleRemoveFilter("category", categoryId)}
                >
                  {category.numeKey ? t(category.numeKey) : category.nume}
                  <X className="h-3 w-3 ml-1 text-muted-foreground group-hover:text-primary inline" />
                </Badge>
              );
            })}
            {filters.brands.map((brandId: string) => {
              const brand = brands.find((b: Brand) => b.id === brandId);
              if (!brand) return null;
              return (
                <Badge
                  key={`brand-${brandId}`}
                  variant="outline"
                  className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-sm"
                  onClick={() => handleRemoveFilter("brand", brandId)}
                >
                  {brand.nameKey ? t(brand.nameKey) : brand.name}
                  <X className="h-3 w-3 ml-1 text-muted-foreground group-hover:text-primary inline" />
                </Badge>
              );
            })}
            {(filters.priceRange[0] > defaultPriceRange[0] ||
              filters.priceRange[1] < defaultPriceRange[1]) && (
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-sm"
                onClick={() => handleRemoveFilter("price")}
              >
                {filters.priceRange[0]}-{filters.priceRange[1]} MDL
                <X className="h-3 w-3 ml-1 text-muted-foreground group-hover:text-primary inline" />
              </Badge>
            )}
            {filters.inStock && (
              <Badge
                variant="outline"
                className="px-2 py-0.5 bg-primary/5 hover:bg-primary/10 transition-colors group cursor-pointer text-sm"
                onClick={() => handleRemoveFilter("inStock")}
              >
                {t("in_stock_only")}
                <X className="h-3 w-3 ml-1 text-muted-foreground group-hover:text-primary inline" />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* In Stock Filter */}
      <div className="bg-card rounded-lg border p-3 shadow-sm">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={handleInStockChange}
            className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
          />
          <Label
            htmlFor="inStock"
            className="cursor-pointer font-medium text-foreground text-base"
          >
            {t("in_stock_only")}
          </Label>
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="bg-card rounded-lg border p-3 shadow-sm">
        <div className="px-1">
          <h3 className="font-semibold text-sm mb-3">{t("price_price")}</h3>
          <div className="pt-1 pb-4">
            <SliderWrapper
              value={filters.priceRange}
              onFinalChange={handlePriceChange}
              min={defaultPriceRange[0]}
              max={defaultPriceRange[1]}
              step={10}
              label={t("price_range")}
              formatOptions={{ style: "currency", currency: "MDL" }}
            />
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-card rounded-lg border p-3 shadow-sm">
        <h3 className="font-semibold text-sm mb-2">{t("categories")}</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {categories.map((category: CategoryWithSubcategories) => (
            <div key={category.id} className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                  className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="cursor-pointer font-medium text-foreground text-base"
                >
                  {category.numeKey ? t(category.numeKey) : category.nume}
                </Label>
              </div>

              {/* Subcategories */}
              {filters.categories.includes(category.id) && (
                <div className="pl-6 space-y-1.5 mt-1">
                  {category.subcategorii.map((subcategory: Subcategorie) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`subcategory-${subcategory.id}`}
                        checked={filters.subcategories.includes(subcategory.id)}
                        onCheckedChange={() =>
                          handleSubcategoryChange(subcategory.id, category.id)
                        }
                        className="border-2 border-primary/30 data-[state=checked]:bg-primary/80 h-3.5 w-3.5"
                      />
                      <Label
                        htmlFor={`subcategory-${subcategory.id}`}
                        className="cursor-pointer text-sm"
                      >
                        {subcategory.numeKey
                          ? t(subcategory.numeKey)
                          : subcategory.nume}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Brands Filter */}
      <div className="bg-card rounded-lg border p-3 shadow-sm">
        <h3 className="font-semibold text-sm mb-2">{t("brands")}</h3>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
          {brands.map((brand: Brand) => (
            <div key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={filters.brands.includes(brand.id)}
                onCheckedChange={() => handleBrandChange(brand.id)}
                className="border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
              />
              <Label
                htmlFor={`brand-${brand.id}`}
                className="cursor-pointer font-medium text-base"
              >
                {brand.nameKey ? t(brand.nameKey) : brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear filters button */}
      <Button
        variant="outline"
        onClick={handleClearFilters}
        className="w-full mt-1 border-primary/30 hover:bg-primary/5 hover:text-primary font-medium text-base h-9"
      >
        <X className="mr-1.5 h-4 w-4" />
        {t("clear_filters")}
      </Button>
    </div>
  );
});

// Create a completely independent tablet filter wrapper
function TabletFilterWrapper({
  filters,
  categories,
  brands,
  handlePriceChange,
  handleCategoryChange,
  handleSubcategoryChange,
  handleBrandChange,
  handleSortChange,
  handleInStockChange,
  handleClearFilters,
  handleRemoveFilter,
  activeFilterCount,
  t,
  defaultPriceRange,
  sortOptions,
  onFilterChange,
  router,
  setFilters,
  applyFilters,
}: {
  filters: FilterOptions;
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  handlePriceChange: (value: number[]) => void;
  handleCategoryChange: (categoryId: string) => void;
  handleSubcategoryChange: (subcategoryId: string, categoryId: string) => void;
  handleBrandChange: (brandId: string) => void;
  handleSortChange: (value: string) => void;
  handleInStockChange: (checked: CheckedState) => void;
  handleClearFilters: () => void;
  handleRemoveFilter: (type: string, id?: string) => void;
  activeFilterCount: number;
  t: (key: string) => string;
  defaultPriceRange: [number, number];
  sortOptions: { value: string; label: string }[];
  onFilterChange: (filters: FilterOptions) => void;
  router: any;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  applyFilters: (filters: FilterOptions) => void;
}) {
  // Use regular state for tracking open/closed
  const [isOpen, setIsOpen] = useState(false);

  // Create local draft filters that don't affect the parent until applied
  const [draftFilters, setDraftFilters] = useState<FilterOptions>(filters);

  // Update draft filters when parent filters change and drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setDraftFilters(filters);
    }
  }, [filters, isOpen]);

  // Modified version of applyFilters that allows forcing all changes
  const forceApplyFilters = () => {
    // Simply update the parent filters with our draft filters directly
    // This avoids the complex process that was causing filters to be lost
    setFilters(draftFilters);

    // Close the filter UI
    setIsOpen(false);
  };

  // Create toggle function
  const toggleSheet = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Create close function that discards changes
  const cancelFilters = useCallback(() => {
    setDraftFilters(filters); // Reset to parent filters
    setIsOpen(false);
  }, [filters]);

  // Draft filter handlers - these only update local state
  const handleDraftPriceChange = (value: number[]) => {
    setDraftFilters({
      ...draftFilters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleDraftCategoryChange = (categoryId: string) => {
    let newCategories = [...draftFilters.categories];
    let newSubcategories = [...draftFilters.subcategories];

    if (newCategories.includes(categoryId)) {
      // Remove category
      newCategories = newCategories.filter((id) => id !== categoryId);

      // Remove all subcategories of this category
      const categorySubcategories =
        categories
          .find((cat) => cat.id === categoryId)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newSubcategories = newSubcategories.filter(
        (id) => !categorySubcategories.includes(id)
      );
    } else {
      // Add category
      newCategories.push(categoryId);
    }

    setDraftFilters({
      ...draftFilters,
      categories: newCategories,
      subcategories: newSubcategories,
    });
  };

  const handleDraftSubcategoryChange = (
    subcategoryId: string,
    categoryId: string
  ) => {
    let newSubcategories = [...draftFilters.subcategories];
    let newCategories = [...draftFilters.categories];

    if (newSubcategories.includes(subcategoryId)) {
      // Remove subcategory
      newSubcategories = newSubcategories.filter((id) => id !== subcategoryId);
    } else {
      // Add subcategory
      newSubcategories.push(subcategoryId);

      // Make sure parent category is selected
      if (!newCategories.includes(categoryId)) {
        newCategories.push(categoryId);
      }
    }

    setDraftFilters({
      ...draftFilters,
      categories: newCategories,
      subcategories: newSubcategories,
    });
  };

  const handleDraftBrandChange = (brandId: string) => {
    let newBrands = [...draftFilters.brands];

    if (newBrands.includes(brandId)) {
      newBrands = newBrands.filter((id) => id !== brandId);
    } else {
      newBrands.push(brandId);
    }

    setDraftFilters({
      ...draftFilters,
      brands: newBrands,
    });
  };

  const handleDraftSortChange = (value: string) => {
    setDraftFilters({
      ...draftFilters,
      sortOption: value,
    });
  };

  const handleDraftInStockChange = (checked: CheckedState) => {
    setDraftFilters({
      ...draftFilters,
      inStock: checked === true,
    });
  };

  const handleDraftClearFilters = () => {
    setDraftFilters({
      priceRange: defaultPriceRange,
      categories: [],
      subcategories: [],
      brands: [],
      sortOption: "featured",
      inStock: false,
    });
  };

  const handleDraftRemoveFilter = (type: string, id?: string) => {
    let newFilters = { ...draftFilters };

    if (type === "category" && id) {
      // Remove category
      newFilters.categories = draftFilters.categories.filter(
        (catId: string) => catId !== id
      );

      // Also remove any subcategories belonging to this category
      const categorySubcategories =
        categories
          .find((cat: CategoryWithSubcategories) => cat.id === id)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newFilters.subcategories = draftFilters.subcategories.filter(
        (subId: string) => !categorySubcategories.includes(subId)
      );
    } else if (type === "brand" && id) {
      // Remove brand
      newFilters.brands = draftFilters.brands.filter(
        (brandId: string) => brandId !== id
      );
    } else if (type === "price") {
      // Reset price range
      newFilters.priceRange = defaultPriceRange;
    } else if (type === "inStock") {
      // Turn off in stock filter
      newFilters.inStock = false;
    }

    setDraftFilters(newFilters);
  };

  return (
    <div className="tablet-filter-wrapper">
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-card shadow-sm border-primary/20 hover:border-primary text-base h-9"
        onClick={toggleSheet}
      >
        <Filter className="h-4 w-4" />
        {t("filters")}
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <SheetPrimitive
        open={isOpen}
        onOpenChange={(open) => {
          // If closing the sheet, apply the filters
          if (!open && isOpen) {
            // Use the more reliable forceApplyFilters for outside clicks
            forceApplyFilters();
            setIsOpen(false);
          } else {
            setIsOpen(open);
          }
        }}
      >
        <SheetContent
          side="left"
          className="w-[320px] sm:w-[400px] overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle className="text-lg">{t("filters")}</SheetTitle>
            <SheetDescription className="text-base">
              {t("adjust_filters_description")}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <MemoizedFilterContent
              filters={draftFilters}
              categories={categories}
              brands={brands}
              handlePriceChange={handleDraftPriceChange}
              handleCategoryChange={handleDraftCategoryChange}
              handleSubcategoryChange={handleDraftSubcategoryChange}
              handleBrandChange={handleDraftBrandChange}
              handleSortChange={handleDraftSortChange}
              handleInStockChange={handleDraftInStockChange}
              handleClearFilters={handleDraftClearFilters}
              handleRemoveFilter={handleDraftRemoveFilter}
              defaultPriceRange={defaultPriceRange}
              activeFilterCount={
                // Count active filters in draft state
                draftFilters.categories.length +
                draftFilters.brands.length +
                (draftFilters.inStock ? 1 : 0) +
                (draftFilters.priceRange[0] > defaultPriceRange[0] ||
                draftFilters.priceRange[1] < defaultPriceRange[1]
                  ? 1
                  : 0)
              }
              sortOptions={sortOptions}
              t={t}
            />
          </div>
          <SheetFooter className="mt-4 flex gap-2 justify-between">
            <Button
              variant="secondary"
              className="text-base"
              onClick={cancelFilters}
            >
              {t("cancel")}
            </Button>
            <Button className="text-base" onClick={forceApplyFilters}>
              {t("apply_filters")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </SheetPrimitive>
    </div>
  );
}

// Create a completely independent mobile filter wrapper
function MobileFilterWrapper({
  filters,
  categories,
  brands,
  handlePriceChange,
  handleCategoryChange,
  handleSubcategoryChange,
  handleBrandChange,
  handleSortChange,
  handleInStockChange,
  handleClearFilters,
  handleRemoveFilter,
  activeFilterCount,
  t,
  defaultPriceRange,
  sortOptions,
  onFilterChange,
  router,
  setFilters,
  applyFilters,
}: {
  filters: FilterOptions;
  categories: CategoryWithSubcategories[];
  brands: Brand[];
  handlePriceChange: (value: number[]) => void;
  handleCategoryChange: (categoryId: string) => void;
  handleSubcategoryChange: (subcategoryId: string, categoryId: string) => void;
  handleBrandChange: (brandId: string) => void;
  handleSortChange: (value: string) => void;
  handleInStockChange: (checked: CheckedState) => void;
  handleClearFilters: () => void;
  handleRemoveFilter: (type: string, id?: string) => void;
  activeFilterCount: number;
  t: (key: string) => string;
  defaultPriceRange: [number, number];
  sortOptions: { value: string; label: string }[];
  onFilterChange: (filters: FilterOptions) => void;
  router: any;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  applyFilters: (filters: FilterOptions) => void;
}) {
  // Use regular state for tracking open/closed
  const [isOpen, setIsOpen] = useState(false);

  // Create local draft filters that don't affect the parent until applied
  const [draftFilters, setDraftFilters] = useState<FilterOptions>(filters);

  // Update draft filters when parent filters change and drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setDraftFilters(filters);
    }
  }, [filters, isOpen]);

  // Modified version of applyFilters that allows forcing all changes
  const forceApplyFilters = () => {
    // Simply update the parent filters with our draft filters directly
    // This avoids the complex process that was causing filters to be lost
    setFilters(draftFilters);

    // Close the filter UI
    setIsOpen(false);
  };

  // Create toggle function
  const toggleDrawer = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Create close function that discards changes
  const cancelFilters = useCallback(() => {
    setDraftFilters(filters); // Reset to parent filters
    setIsOpen(false);
  }, [filters]);

  // Draft filter handlers - these only update local state
  const handleDraftPriceChange = (value: number[]) => {
    setDraftFilters({
      ...draftFilters,
      priceRange: [value[0], value[1]] as [number, number],
    });
  };

  const handleDraftCategoryChange = (categoryId: string) => {
    let newCategories = [...draftFilters.categories];
    let newSubcategories = [...draftFilters.subcategories];

    if (newCategories.includes(categoryId)) {
      // Remove category
      newCategories = newCategories.filter((id) => id !== categoryId);

      // Remove all subcategories of this category
      const categorySubcategories =
        categories
          .find((cat) => cat.id === categoryId)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newSubcategories = newSubcategories.filter(
        (id) => !categorySubcategories.includes(id)
      );
    } else {
      // Add category
      newCategories.push(categoryId);
    }

    setDraftFilters({
      ...draftFilters,
      categories: newCategories,
      subcategories: newSubcategories,
    });
  };

  const handleDraftSubcategoryChange = (
    subcategoryId: string,
    categoryId: string
  ) => {
    let newSubcategories = [...draftFilters.subcategories];
    let newCategories = [...draftFilters.categories];

    if (newSubcategories.includes(subcategoryId)) {
      // Remove subcategory
      newSubcategories = newSubcategories.filter((id) => id !== subcategoryId);
    } else {
      // Add subcategory
      newSubcategories.push(subcategoryId);

      // Make sure parent category is selected
      if (!newCategories.includes(categoryId)) {
        newCategories.push(categoryId);
      }
    }

    setDraftFilters({
      ...draftFilters,
      categories: newCategories,
      subcategories: newSubcategories,
    });
  };

  const handleDraftBrandChange = (brandId: string) => {
    let newBrands = [...draftFilters.brands];

    if (newBrands.includes(brandId)) {
      newBrands = newBrands.filter((id) => id !== brandId);
    } else {
      newBrands.push(brandId);
    }

    setDraftFilters({
      ...draftFilters,
      brands: newBrands,
    });
  };

  const handleDraftSortChange = (value: string) => {
    setDraftFilters({
      ...draftFilters,
      sortOption: value,
    });
  };

  const handleDraftInStockChange = (checked: CheckedState) => {
    setDraftFilters({
      ...draftFilters,
      inStock: checked === true,
    });
  };

  const handleDraftClearFilters = () => {
    setDraftFilters({
      priceRange: defaultPriceRange,
      categories: [],
      subcategories: [],
      brands: [],
      sortOption: "featured",
      inStock: false,
    });
  };

  const handleDraftRemoveFilter = (type: string, id?: string) => {
    let newFilters = { ...draftFilters };

    if (type === "category" && id) {
      // Remove category
      newFilters.categories = draftFilters.categories.filter(
        (catId: string) => catId !== id
      );

      // Also remove any subcategories belonging to this category
      const categorySubcategories =
        categories
          .find((cat: CategoryWithSubcategories) => cat.id === id)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newFilters.subcategories = draftFilters.subcategories.filter(
        (subId: string) => !categorySubcategories.includes(subId)
      );
    } else if (type === "brand" && id) {
      // Remove brand
      newFilters.brands = draftFilters.brands.filter(
        (brandId: string) => brandId !== id
      );
    } else if (type === "price") {
      // Reset price range
      newFilters.priceRange = defaultPriceRange;
    } else if (type === "inStock") {
      // Turn off in stock filter
      newFilters.inStock = false;
    }

    setDraftFilters(newFilters);
  };

  return (
    <div className="mobile-filter-wrapper">
      <Button
        variant="outline"
        className="flex items-center gap-2 w-full bg-card shadow-sm border-primary/20 hover:border-primary text-base h-9"
        onClick={toggleDrawer}
      >
        <Sliders className="h-4 w-4" />
        {t("filters")}
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      <DrawerPrimitive
        open={isOpen}
        onOpenChange={(open) => {
          // If closing the drawer, apply the filters
          if (!open && isOpen) {
            // Use the more reliable forceApplyFilters for outside clicks
            forceApplyFilters();
            setIsOpen(false);
          } else {
            setIsOpen(open);
          }
        }}
        shouldScaleBackground={false}
      >
        <DrawerContent
          className="max-h-[90vh]"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DrawerHeader>
            <DrawerTitle className="text-lg">{t("filters")}</DrawerTitle>
            <DrawerDescription className="text-base">
              {t("adjust_filters_description")}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto max-h-[calc(80vh-190px)]">
            <MemoizedFilterContent
              filters={draftFilters}
              categories={categories}
              brands={brands}
              handlePriceChange={handleDraftPriceChange}
              handleCategoryChange={handleDraftCategoryChange}
              handleSubcategoryChange={handleDraftSubcategoryChange}
              handleBrandChange={handleDraftBrandChange}
              handleSortChange={handleDraftSortChange}
              handleInStockChange={handleDraftInStockChange}
              handleClearFilters={handleDraftClearFilters}
              handleRemoveFilter={handleDraftRemoveFilter}
              defaultPriceRange={defaultPriceRange}
              activeFilterCount={
                // Count active filters in draft state
                draftFilters.categories.length +
                draftFilters.brands.length +
                (draftFilters.inStock ? 1 : 0) +
                (draftFilters.priceRange[0] > defaultPriceRange[0] ||
                draftFilters.priceRange[1] < defaultPriceRange[1]
                  ? 1
                  : 0)
              }
              sortOptions={sortOptions}
              t={t}
            />
          </div>
          <DrawerFooter className="pt-2 flex gap-2 justify-between">
            <Button
              variant="secondary"
              className="text-base"
              onClick={cancelFilters}
            >
              {t("cancel")}
            </Button>
            <Button className="text-base" onClick={forceApplyFilters}>
              {t("apply_filters")}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPrimitive>
    </div>
  );
}

export default function FilterSystem({
  onFilterChange,
  initialFilters,
}: FilterSystemProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  // Responsive state
  const [isDesktop, setIsDesktop] = useState(true);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Data state - use real categories instead of mock data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: initialFilters?.priceRange || defaultPriceRange,
    categories: initialFilters?.categories || [],
    subcategories: initialFilters?.subcategories || [],
    brands: initialFilters?.brands || [],
    sortOption: initialFilters?.sortOption || "featured",
    inStock: initialFilters?.inStock || false,
  });

  // Active filter counts for badges
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Price range input state
  const [priceInput, setPriceInput] = useState<{ min: string; max: string }>({
    min: filters.priceRange[0].toString(),
    max: filters.priceRange[1].toString(),
  });

  // Mobile drawer state
  const [open, setOpen] = useState(false);
  // Add tablet sheet state
  const [sheetOpen, setSheetOpen] = useState(false);

  // Remove all the refs and complex state management - keep it simple
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    filters.priceRange
  );

  // Create stable callbacks for sheet/drawer state
  const setMobileOpenStable = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      setOpen(value);
    },
    []
  );

  const setSheetOpenStable = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      setSheetOpen(value);
    },
    []
  );

  // Get data on component mount - use the centralized categories
  useEffect(() => {
    const fetchData = async () => {
      // Hardcoded real brands data
      const brandData: Brand[] = [
        { id: "brand-1", name: "Brand One" },
        { id: "brand-2", name: "Brand Two" },
        { id: "brand-3", name: "Brand Three" },
      ];

      // Use our centralized categories
      const categoryData = ALL_CATEGORIES.map(category => ({
        id: category.id,
        nume: language === "ru" ? category.name.ru : category.name.ro,
        subcategorii: category.subcategories.map(sub => ({
          id: sub.id,
          nume: language === "ru" ? sub.name.ru : sub.name.ro
        }))
      }));

      setBrands(brandData);
      setCategories(categoryData);
    };

    fetchData();
    setIsMounted(true);

    // Handle responsive breakpoints
    const handleResize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024);
      setIsTablet(width >= 768 && width < 1024);
      setIsMobile(width < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [language]);

  // Handle initial URL params on mount (only once)
  useEffect(() => {
    if (!isMounted || !categories.length || !brands.length) return;

    // Use a ref to track if this is the first load to avoid infinite updates
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const brandParam = searchParams.get("brand");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sortParam = searchParams.get("sort");
    const inStockParam = searchParams.get("inStock");

    // Create a new filters object from scratch
    const initialFiltersState: FilterOptions = {
      priceRange: defaultPriceRange,
      categories: [],
      subcategories: [],
      brands: [],
      sortOption: "featured",
      inStock: false,
    };

    if (categoryParam) {
      initialFiltersState.categories = categoryParam.split(",");
    }

    if (subcategoryParam) {
      initialFiltersState.subcategories = subcategoryParam.split(",");
    }

    if (brandParam) {
      initialFiltersState.brands = brandParam.split(",");
    }

    if (minPriceParam && maxPriceParam) {
      const min = parseInt(minPriceParam);
      const max = parseInt(maxPriceParam);
      initialFiltersState.priceRange = [min, max];
      setPriceInput({ min: min.toString(), max: max.toString() });
    }

    if (sortParam) {
      initialFiltersState.sortOption = sortParam;
    }

    if (inStockParam) {
      initialFiltersState.inStock = inStockParam === "true";
    }

    // Set filters only if something has changed
    setFilters(initialFiltersState);

    // Calculate active filter count
    updateActiveFilterCount(initialFiltersState);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, categories.length, brands.length]); // Remove searchParams to prevent infinite loop

  // Update parent on filter changes - but only after initial mount
  useEffect(() => {
    if (!isMounted) return;

    // Notify parent about filter changes
    onFilterChange(filters);

    // Update active filter count
    updateActiveFilterCount(filters);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isMounted]); // Remove onFilterChange from dependencies

  // Update active filter count
  const updateActiveFilterCount = (currentFilters: FilterOptions) => {
    let count = 0;

    if (currentFilters.categories.length > 0) count++;
    if (currentFilters.subcategories.length > 0) count++;
    if (currentFilters.brands.length > 0) count++;
    if (
      currentFilters.priceRange[0] > defaultPriceRange[0] ||
      currentFilters.priceRange[1] < defaultPriceRange[1]
    )
      count++;
    if (currentFilters.inStock) count++;

    setActiveFilterCount(count);
  };

  // Apply filters and update URL
  const applyFilters = (newFilters: FilterOptions) => {
    // Don't update if filters haven't actually changed
    if (JSON.stringify(newFilters) === JSON.stringify(filters)) {
      return; // Skip update if nothing changed
    }

    setFilters(newFilters);

    // Create new URL params
    const params = new URLSearchParams();

    if (newFilters.categories.length > 0) {
      params.set("category", newFilters.categories.join(","));
    }

    if (newFilters.subcategories.length > 0) {
      params.set("subcategory", newFilters.subcategories.join(","));
    }

    if (newFilters.brands.length > 0) {
      params.set("brand", newFilters.brands.join(","));
    }

    if (
      newFilters.priceRange[0] > defaultPriceRange[0] ||
      newFilters.priceRange[1] < defaultPriceRange[1]
    ) {
      params.set("minPrice", newFilters.priceRange[0].toString());
      params.set("maxPrice", newFilters.priceRange[1].toString());
    }

    if (newFilters.sortOption !== "featured") {
      params.set("sort", newFilters.sortOption);
    }

    if (newFilters.inStock) {
      params.set("inStock", "true");
    }

    // Apply the URL change without reloading
    const queryString = params.toString();
    const newUrl = queryString ? `/catalog?${queryString}` : "/catalog";

    // Only update URL if actually changed to prevent unnecessary history entries
    if (window.location.pathname + window.location.search !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  };

  // Filter handlers
  const handlePriceChange = (value: number[]) => {
    const newPriceRange = [value[0], value[1]] as [number, number];

    const newFilters = {
      ...filters,
      priceRange: newPriceRange,
    };

    applyFilters(newFilters);

    setPriceInput({
      min: value[0].toString(),
      max: value[1].toString(),
    });
  };

  const handlePriceInputChange = (key: "min" | "max", value: string) => {
    const newPriceInput = { ...priceInput, [key]: value };
    setPriceInput(newPriceInput);

    // Only update the actual filter when both values are valid numbers
    const min = parseInt(newPriceInput.min) || 0;
    const max = parseInt(newPriceInput.max) || defaultPriceRange[1];

    if (!isNaN(min) && !isNaN(max) && min <= max) {
      const newFilters = {
        ...filters,
        priceRange: [min, max] as [number, number],
      };

      applyFilters(newFilters);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    let newCategories = [...filters.categories];
    let newSubcategories = [...filters.subcategories];

    if (newCategories.includes(categoryId)) {
      // Remove category
      newCategories = newCategories.filter((id) => id !== categoryId);

      // Remove all subcategories of this category
      const categorySubcategories =
        categories
          .find((cat) => cat.id === categoryId)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newSubcategories = newSubcategories.filter(
        (id) => !categorySubcategories.includes(id)
      );
    } else {
      // Add category
      newCategories.push(categoryId);
    }

    const newFilters = {
      ...filters,
      categories: newCategories,
      subcategories: newSubcategories,
    };

    applyFilters(newFilters);
  };

  const handleSubcategoryChange = (
    subcategoryId: string,
    categoryId: string
  ) => {
    let newSubcategories = [...filters.subcategories];
    let newCategories = [...filters.categories];

    if (newSubcategories.includes(subcategoryId)) {
      // Remove subcategory
      newSubcategories = newSubcategories.filter((id) => id !== subcategoryId);
    } else {
      // Add subcategory
      newSubcategories.push(subcategoryId);

      // Make sure parent category is selected
      if (!newCategories.includes(categoryId)) {
        newCategories.push(categoryId);
      }
    }

    const newFilters = {
      ...filters,
      categories: newCategories,
      subcategories: newSubcategories,
    };

    applyFilters(newFilters);
  };

  const handleBrandChange = (brandId: string) => {
    let newBrands = [...filters.brands];

    if (newBrands.includes(brandId)) {
      newBrands = newBrands.filter((id) => id !== brandId);
    } else {
      newBrands.push(brandId);
    }

    const newFilters = {
      ...filters,
      brands: newBrands,
    };

    applyFilters(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = {
      ...filters,
      sortOption: value,
    };

    applyFilters(newFilters);
  };

  const handleInStockChange = () => {
    const newFilters = {
      ...filters,
      inStock: !filters.inStock,
    };

    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    // Set filters back to default values
    const defaultFilters = {
      priceRange: defaultPriceRange,
      categories: [],
      subcategories: [],
      brands: [],
      sortOption: "featured",
      inStock: false,
    };

    // Reset price input
    setPriceInput({
      min: defaultPriceRange[0].toString(),
      max: defaultPriceRange[1].toString(),
    });

    // Apply the filters (this will update the URL and state)
    applyFilters(defaultFilters);

    // Force navigation to the catalog page with no filters
    router.replace("/catalog", { scroll: false });
  };

  const handleRemoveFilter = (type: string, id?: string) => {
    let newFilters = { ...filters };

    if (type === "category" && id) {
      // Remove category
      newFilters.categories = filters.categories.filter(
        (catId) => catId !== id
      );

      // Also remove any subcategories belonging to this category
      const categorySubcategories =
        categories
          .find((cat) => cat.id === id)
          ?.subcategorii.map((sub: Subcategorie) => sub.id) || [];

      newFilters.subcategories = filters.subcategories.filter(
        (subId) => !categorySubcategories.includes(subId)
      );
    } else if (type === "brand" && id) {
      // Remove brand
      newFilters.brands = filters.brands.filter((brandId) => brandId !== id);
    } else if (type === "price") {
      // Reset price range
      newFilters.priceRange = defaultPriceRange;
      setPriceInput({
        min: defaultPriceRange[0].toString(),
        max: defaultPriceRange[1].toString(),
      });
    } else if (type === "inStock") {
      // Turn off in stock filter
      newFilters.inStock = false;
    }

    // Apply the updated filters
    applyFilters(newFilters);
  };

  // Add back effect to update local state when filters change from URL
  useEffect(() => {
    setLocalPriceRange(filters.priceRange);
  }, [filters.priceRange]);

  // Filter content that's shared between all view modes
  const FilterContent = () => (
    <MemoizedFilterContent
      filters={filters}
      categories={categories}
      brands={brands}
      handlePriceChange={handlePriceChange}
      handleCategoryChange={handleCategoryChange}
      handleSubcategoryChange={handleSubcategoryChange}
      handleBrandChange={handleBrandChange}
      handleSortChange={handleSortChange}
      handleInStockChange={handleInStockChange}
      handleClearFilters={handleClearFilters}
      handleRemoveFilter={handleRemoveFilter}
      defaultPriceRange={defaultPriceRange}
      activeFilterCount={activeFilterCount}
      sortOptions={sortOptions}
      t={t}
    />
  );

  // Desktop filter sidebar
  const DesktopFilter = () => (
    <div className="sticky top-48 max-h-[calc(100vh-160px)] overflow-y-auto pt-2">
      <FilterBreadcrumb
        filters={filters}
        categories={categories}
        brands={brands}
        handleRemoveFilter={handleRemoveFilter}
        handleClearFilters={handleClearFilters}
        viewMode="desktop"
      />
      <FilterContent />
    </div>
  );

  // Replace the entire Tablet and Mobile filter implementations with the standalone wrappers
  const TabletFilter = () => (
    <>
      <FilterBreadcrumb
        filters={filters}
        categories={categories}
        brands={brands}
        handleRemoveFilter={handleRemoveFilter}
        handleClearFilters={handleClearFilters}
        viewMode="tablet"
      />
      <TabletFilterWrapper
        filters={filters}
        categories={categories}
        brands={brands}
        handlePriceChange={handlePriceChange}
        handleCategoryChange={handleCategoryChange}
        handleSubcategoryChange={handleSubcategoryChange}
        handleBrandChange={handleBrandChange}
        handleSortChange={handleSortChange}
        handleInStockChange={handleInStockChange}
        handleClearFilters={handleClearFilters}
        handleRemoveFilter={handleRemoveFilter}
        activeFilterCount={activeFilterCount}
        t={t}
        defaultPriceRange={defaultPriceRange}
        sortOptions={sortOptions}
        onFilterChange={onFilterChange}
        router={router}
        setFilters={setFilters}
        applyFilters={applyFilters}
      />
    </>
  );

  const MobileFilter = () => (
    <>
      <FilterBreadcrumb
        filters={filters}
        categories={categories}
        brands={brands}
        handleRemoveFilter={handleRemoveFilter}
        handleClearFilters={handleClearFilters}
        viewMode="mobile"
      />
      <MobileFilterWrapper
        filters={filters}
        categories={categories}
        brands={brands}
        handlePriceChange={handlePriceChange}
        handleCategoryChange={handleCategoryChange}
        handleSubcategoryChange={handleSubcategoryChange}
        handleBrandChange={handleBrandChange}
        handleSortChange={handleSortChange}
        handleInStockChange={handleInStockChange}
        handleClearFilters={handleClearFilters}
        handleRemoveFilter={handleRemoveFilter}
        activeFilterCount={activeFilterCount}
        t={t}
        defaultPriceRange={defaultPriceRange}
        sortOptions={sortOptions}
        onFilterChange={onFilterChange}
        router={router}
        setFilters={setFilters}
        applyFilters={applyFilters}
      />
    </>
  );

  if (!isMounted) return null;

  return (
    <>
      {/* Desktop View */}
      {isDesktop && <DesktopFilter />}

      {/* Tablet View */}
      {isTablet && <TabletFilter />}

      {/* Mobile View */}
      {isMobile && <MobileFilter />}
    </>
  );
}

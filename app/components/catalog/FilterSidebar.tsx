"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Check,
  SlidersHorizontal,
  Tag,
  LayoutGrid,
  Search,
  ChevronRight,
  ChevronLeft,
  Home,
  Circle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ALL_CATEGORIES, MainCategory, SubcategoryGroup, Subcategory, getSubcategoryById, getCategoryBySubcategoryId } from "@/lib/categories";
import Link from "next/link";

// A dedicated SliderWrapper component to handle price range changes safely
const SliderWrapper = ({
  value,
  onFinalChange,
  min,
  max,
  step = 1,
  label,
}: {
  value: [number, number];
  onFinalChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // Format value for display
  const formatValue = (val: number) => {
    return val.toString();
  };

  // Update local value when dragging
  const handleValueChange = (newValue: number[]) => {
    // Ensure we're working with numbers
    const numericValues: [number, number] = [
      typeof newValue[0] === 'number' ? newValue[0] : parseFloat(String(newValue[0])) || min,
      typeof newValue[1] === 'number' ? newValue[1] : parseFloat(String(newValue[1])) || max
    ];
    setLocalValue(numericValues);
  };

  // Call the parent callback only when dragging ends
  const handleValueCommit = (newValue: number[]) => {
    // Ensure we're working with numbers
    const numericValues: [number, number] = [
      typeof newValue[0] === 'number' ? newValue[0] : parseFloat(String(newValue[0])) || min,
      typeof newValue[1] === 'number' ? newValue[1] : parseFloat(String(newValue[1])) || max
    ];

    // Prevent event from propagating up the DOM tree
    // This is important to prevent the sheet from closing accidentally
    // Only call onFinalChange if the values actually changed
    if (numericValues[0] !== value[0] || numericValues[1] !== value[1]) {
      onFinalChange(numericValues);
    }
  };

  // Update local value when props change
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="space-y-3">
      {/* Price values display above the slider */}
      <div className="flex justify-between text-xs text-muted-foreground pb-2">
        <span>{localValue[0]} MDL</span>
        <span>{localValue[1]} MDL</span>
      </div>

      <Slider
        value={localValue}
        onValueChange={handleValueChange}
        onValueCommit={(val) => {
          // Add stopPropagation to ensure the event doesn't bubble up
          handleValueCommit(val);
        }}
        step={step}
        min={min}
        max={max}
        className="w-full"
      />

      {label && (
        <div className="text-xs text-muted-foreground text-center mt-1">
          {label}
        </div>
      )}
    </div>
  );
};

// Define types for filter options
interface PriceRange {
  min: number;
  max: number;
}

interface FilterOption {
  id: string;
  name: string;
  count: number;
  nomenclatureId?: string;
  parentId?: string;
  subcategories?: FilterOption[];
}

interface FilterProps {
  categories?: FilterOption[];
  brands?: FilterOption[];
  priceRange: PriceRange;
  appliedFilters: {
    brands: string[];
    minPrice?: number;
    maxPrice?: number;
    nomenclatureIds?: string[];
  };
  totalProducts: number;
  activeNomenclatureId?: string;
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

// Convert MainCategory array to FilterOption array for the sidebar
function convertCategoriesForSidebar(categories: MainCategory[], lang: string = 'ro'): FilterOption[] {
  return categories.map(category => ({
    id: category.id,
    name: lang === 'ru' ? category.name.ru : category.name.ro,
    count: category.subcategoryGroups.reduce(
      (total, group) => total + group.subcategories.length, 0
    ),
    subcategories: category.subcategoryGroups.flatMap(group =>
      group.subcategories.map(subcat => ({
        id: subcat.id,
        name: lang === 'ru' ? subcat.name.ru : subcat.name.ro,
        count: 0, // We don't have count info
        nomenclatureId: subcat.nomenclatureId
      }))
    )
  }));
}

export function FilterSidebar({
  categories = [],
  brands = [],
  priceRange,
  appliedFilters,
  totalProducts,
  activeNomenclatureId,
  onApplyFilters,
  onClearFilters,
  isMobile = false,
}: FilterProps) {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Use converted ALL_CATEGORIES if no categories are provided
  const displayCategories = categories.length > 0 ? categories : convertCategoriesForSidebar(ALL_CATEGORIES, language);

  // Ensure price range has valid non-zero values
  const validPriceRange = {
    min: priceRange.min || 0,
    max: priceRange.max || 10000,
  };

  // If min and max are the same value, create a range
  const effectivePriceRange = validPriceRange.min === validPriceRange.max
    ? { min: validPriceRange.min, max: validPriceRange.min + 1000 }
    : validPriceRange;

  // Local state for filter values
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    appliedFilters.minPrice !== undefined ? appliedFilters.minPrice : effectivePriceRange.min,
    appliedFilters.maxPrice !== undefined ? appliedFilters.maxPrice : effectivePriceRange.max,
  ]);

  // Local state for selected brands
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    appliedFilters.brands || []
  );

  // Local state for selected nomenclatureIds
  const [selectedNomenclatureIds, setSelectedNomenclatureIds] = useState<string[]>(
    appliedFilters.nomenclatureIds || []
  );

  // Use a ref to track previous values for comparison
  const prevPropsRef = useRef({
    minPrice: appliedFilters.minPrice,
    maxPrice: appliedFilters.maxPrice,
    brands: JSON.stringify(appliedFilters.brands || []),
    nomenclatureIds: JSON.stringify(appliedFilters.nomenclatureIds || [])
  });

  // Use a ref to track if local changes were initiated by user
  const userInitiatedChangesRef = useRef(false);

  // Use a ref to track if we've synced with the URL
  const urlSyncedRef = useRef(false);

  // Draft state for mobile filters
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>(localPriceRange);
  const [draftBrands, setDraftBrands] = useState<string[]>(selectedBrands);
  const [draftNomenclatureIds, setDraftNomenclatureIds] = useState<string[]>(selectedNomenclatureIds);

  // Track expanded category groups for UI
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Search state for brands
  const [brandSearch, setBrandSearch] = useState("");

  // Sheet state for mobile
  const [isOpen, setIsOpen] = useState(false);

  // Track expanded accordion sections
  const [expandedAccordionValues, setExpandedAccordionValues] = useState<string[]>(["price", "categories", "brands"]);

  // Add loading state for brands
  const [isBrandsLoading, setIsBrandsLoading] = useState(true);

  // Filter brands by search term and ensure only brands with products are shown
  const sortedAndFilteredBrands = useMemo(() => {
    // Filter brands by search term AND only include those with products
    const filtered = brands
      .filter(brand =>
        brand.count > 0 && // Only include brands with products
        brand.name.toLowerCase().includes(brandSearch.toLowerCase())
      );

    // Sort by count (descending) then by name
    return filtered.sort((a, b) => {
      // Sort by count (descending)
      if (a.count !== b.count) return b.count - a.count;

      // Then sort by name
      return a.name.localeCompare(b.name);
    });
  }, [brands, brandSearch]);

  // Log brands data to help debug visibility issues
  useEffect(() => {
    console.log("Available brands for filtering:", brands);
    // Set loading to false when brands data is available
    setIsBrandsLoading(brands.length > 0 ? false : true);
  }, [brands]);

  // Ensure brands accordion is always expanded when brands are available
  useEffect(() => {
    if (brands.length > 0 && !expandedAccordionValues.includes("brands")) {
      setExpandedAccordionValues(prev => [...prev, "brands"]);
    }
  }, [brands, expandedAccordionValues]);

  // Parse nomenclatureIds from URL on component mount
  useEffect(() => {
    // Skip if user initiated the change or if we've already synced for this URL
    if (userInitiatedChangesRef.current) return;

    const nomenclatureParam = searchParams.get('nomenclature');
    if (nomenclatureParam) {
      const nomenclatureIds = nomenclatureParam.split(',');
      // Only update if different
      const currentIds = JSON.stringify(selectedNomenclatureIds.sort());
      const newIds = JSON.stringify(nomenclatureIds.sort());

      if (currentIds !== newIds) {
        urlSyncedRef.current = true;
        setSelectedNomenclatureIds(nomenclatureIds);
        setDraftNomenclatureIds(nomenclatureIds);
      }
    } else if (selectedNomenclatureIds.length > 0 && !userInitiatedChangesRef.current) {
      // Clear selections if URL doesn't have nomenclature
      urlSyncedRef.current = true;
      setSelectedNomenclatureIds([]);
      setDraftNomenclatureIds([]);
    }
  }, [searchParams, selectedNomenclatureIds]);

  // Sync local state with applied filters (one-way, only from props to state)
  useEffect(() => {
    // If user made changes, don't override with props
    if (userInitiatedChangesRef.current) return;

    const prevProps = prevPropsRef.current;
    let stateUpdated = false;

    // Check if props actually changed to avoid unnecessary updates
    if (
      prevProps.minPrice !== appliedFilters.minPrice ||
      prevProps.maxPrice !== appliedFilters.maxPrice
    ) {
      setLocalPriceRange([
        appliedFilters.minPrice !== undefined ? appliedFilters.minPrice : effectivePriceRange.min,
        appliedFilters.maxPrice !== undefined ? appliedFilters.maxPrice : effectivePriceRange.max,
      ]);
      stateUpdated = true;
    }

    const newBrandsString = JSON.stringify(appliedFilters.brands || []);
    if (prevProps.brands !== newBrandsString) {
      setSelectedBrands(appliedFilters.brands || []);
      stateUpdated = true;
    }

    const newNomenclatureIdsString = JSON.stringify(appliedFilters.nomenclatureIds || []);
    if (prevProps.nomenclatureIds !== newNomenclatureIdsString) {
      setSelectedNomenclatureIds(appliedFilters.nomenclatureIds || []);
      stateUpdated = true;
    }

    // Also update draft values when appliedFilters change (and drawer is closed)
    if (!isOpen && stateUpdated) {
      setDraftPriceRange([
        appliedFilters.minPrice !== undefined ? appliedFilters.minPrice : effectivePriceRange.min,
        appliedFilters.maxPrice !== undefined ? appliedFilters.maxPrice : effectivePriceRange.max,
      ]);
      setDraftBrands(appliedFilters.brands || []);
      setDraftNomenclatureIds(appliedFilters.nomenclatureIds || []);
    }

    // Update ref with current props
    prevPropsRef.current = {
      minPrice: appliedFilters.minPrice,
      maxPrice: appliedFilters.maxPrice,
      brands: newBrandsString,
      nomenclatureIds: newNomenclatureIdsString
    };
  }, [
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
    appliedFilters.brands,
    appliedFilters.nomenclatureIds,
    effectivePriceRange.min,
    effectivePriceRange.max,
    isOpen
  ]);

  // Handle filter changes (for desktop only)
  useEffect(() => {
    // Skip applying filters while mobile drawer is open
    if (isOpen) return;

    // Reset user-initiated flag since we're handling changes now
    if (userInitiatedChangesRef.current) {
      userInitiatedChangesRef.current = false;

      // Prepare filter object with only defined values
      const filters = {
        ...(localPriceRange[0] !== effectivePriceRange.min && {
          minPrice: localPriceRange[0],
        }),
        ...(localPriceRange[1] !== effectivePriceRange.max && {
          maxPrice: localPriceRange[1],
        }),
        ...(selectedBrands.length > 0 && { brands: selectedBrands }),
        ...(selectedNomenclatureIds.length > 0 && { nomenclature: selectedNomenclatureIds }),
      };

      // Call the parent's apply function
      onApplyFilters(filters);
    }
  }, [
    localPriceRange,
    selectedBrands,
    selectedNomenclatureIds,
    isOpen,
    effectivePriceRange,
    onApplyFilters
  ]);

  // Handle price range change (for desktop)
  const handlePriceChange = (values: [number, number]) => {
    userInitiatedChangesRef.current = true;
    setLocalPriceRange(values);
  };

  // Handle draft price range change (for mobile)
  const handleDraftPriceChange = (values: [number, number]) => {
    // Prevent any immediate side effects
    setDraftPriceRange(values);
  };

  // Handle brand selection (for desktop) - modified to only select one at a time
  const handleBrandToggle = (brandId: string) => {
    userInitiatedChangesRef.current = true;
    setSelectedBrands(prev => {
      // If this brand is already selected, deselect it
      if (prev.includes(brandId)) {
        return [];
      }
      // Otherwise, select only this brand (replacing any previously selected brand)
      else {
        return [brandId];
      }
    });
  };

  // Handle draft brand selection (for mobile) - modified to only select one at a time
  const handleDraftBrandToggle = (brandId: string) => {
    setDraftBrands(prev => {
      // If this brand is already selected, deselect it
      if (prev.includes(brandId)) {
        return [];
      }
      // Otherwise, select only this brand (replacing any previously selected brand)
      else {
        return [brandId];
      }
    });
  };

  // Handle subcategory click (using nomenclatureId only)
  const handleSubcategoryChange = (nomenclatureId: string) => {
    userInitiatedChangesRef.current = true;
    urlSyncedRef.current = false;

    // Only use nomenclatureId for filtering
    const newSelectedIds = selectedNomenclatureIds.includes(nomenclatureId)
      ? selectedNomenclatureIds.filter(id => id !== nomenclatureId)
      : [...selectedNomenclatureIds, nomenclatureId];

    // Update state first
    setSelectedNomenclatureIds(newSelectedIds);

    // Update the URL directly for immediate effect
    const params = new URLSearchParams(searchParams.toString());

    // Clear existing nomenclature parameter
    params.delete('nomenclature');

    // Add new nomenclature IDs
    if (newSelectedIds.length > 0) {
      newSelectedIds.forEach(id => params.append('nomenclature', id));
    }

    // Keep the current pathname (which might be a subcategory page)
    // and only update the query parameters
    const currentUrl = new URL(window.location.href);
    const newQuery = params.toString();

    // Use router.replace with a delay to ensure the UI updates first
    setTimeout(() => {
      router.replace(`${currentUrl.pathname}?${newQuery}`, { scroll: false });
    }, 0);

    // Also call the parent's apply function
    const filters = {
      ...(localPriceRange[0] !== effectivePriceRange.min && {
        minPrice: localPriceRange[0],
      }),
      ...(localPriceRange[1] !== effectivePriceRange.max && {
        maxPrice: localPriceRange[1],
      }),
      ...(selectedBrands.length > 0 && { brands: selectedBrands }),
      ...(newSelectedIds.length > 0 && { nomenclature: newSelectedIds }),
    };

    onApplyFilters(filters);
  };

  // Handle subcategory click (mobile)
  const handleDraftNomenclatureToggle = (id: string) => {
    // If already selected, remove it; otherwise, add it
    const newDraftIds = draftNomenclatureIds.includes(id)
      ? draftNomenclatureIds.filter(selectedId => selectedId !== id)
      : [...draftNomenclatureIds, id];

    setDraftNomenclatureIds(newDraftIds);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Apply filters function
  const applyFilters = () => {
    userInitiatedChangesRef.current = true;

    // Prepare filter object with only defined values
    const filters = {
      ...(localPriceRange[0] !== effectivePriceRange.min && {
        minPrice: localPriceRange[0],
      }),
      ...(localPriceRange[1] !== effectivePriceRange.max && {
        maxPrice: localPriceRange[1],
      }),
      ...(selectedBrands.length > 0 && { brands: selectedBrands }),
      ...(selectedNomenclatureIds.length > 0 && { nomenclature: selectedNomenclatureIds }),
    };

    // Call the parent's apply function
    onApplyFilters(filters);
    setIsOpen(false); // Close mobile filter on apply
  };

  // Apply draft filters from mobile drawer
  const applyDraftFilters = () => {
    userInitiatedChangesRef.current = true;
    urlSyncedRef.current = false;

    // First sync draft values to local state
    setLocalPriceRange(draftPriceRange);
    setSelectedBrands(draftBrands);
    setSelectedNomenclatureIds(draftNomenclatureIds);

    // Prepare filter object with only defined values
    const filters = {
      ...(draftPriceRange[0] !== effectivePriceRange.min && {
        minPrice: draftPriceRange[0],
      }),
      ...(draftPriceRange[1] !== effectivePriceRange.max && {
        maxPrice: draftPriceRange[1],
      }),
      ...(draftBrands.length > 0 && { brands: draftBrands }),
      ...(draftNomenclatureIds.length > 0 && { nomenclature: draftNomenclatureIds }),
    };

    // Update the URL directly for immediate effect
    const params = new URLSearchParams(searchParams.toString());

    // Clear existing filter parameters
    params.delete('nomenclature');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('brands');

    // Add new nomenclature IDs
    if (draftNomenclatureIds.length > 0) {
      draftNomenclatureIds.forEach(id => params.append('nomenclature', id));
    }

    // Add price range if adjusted
    if (draftPriceRange[0] !== effectivePriceRange.min) {
      params.set('minPrice', draftPriceRange[0].toString());
    }

    if (draftPriceRange[1] !== effectivePriceRange.max) {
      params.set('maxPrice', draftPriceRange[1].toString());
    }

    // Add brands
    if (draftBrands.length > 0) {
      draftBrands.forEach(id => params.append('brands', id));
    }

    // Keep the current pathname (which might be a subcategory page)
    // and only update the query parameters
    const currentUrl = new URL(window.location.href);
    const newQuery = params.toString();

    // Use router.replace with a delay to ensure the UI updates first
    setTimeout(() => {
      router.replace(`${currentUrl.pathname}?${newQuery}`, { scroll: false });
    }, 0);

    // Apply the filters and close the drawer
    onApplyFilters(filters);
    setIsOpen(false);
  };

  // Clear all filters
  const clearFilters = () => {
    // Reset local state
    setLocalPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
    setSelectedBrands([]);
    setSelectedNomenclatureIds([]);
    // Call parent's clear function
    onClearFilters();
  };

  // Clear draft filters (mobile only)
  const clearDraftFilters = () => {
    // Reset draft state
    setDraftPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
    setDraftBrands([]);
    setDraftNomenclatureIds([]);
  };

  // Count how many filters are applied
  const appliedFiltersCount = () => {
    let count = 0;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (selectedNomenclatureIds.length > 0) count += selectedNomenclatureIds.length;
    if (localPriceRange[0] > effectivePriceRange.min || localPriceRange[1] < effectivePriceRange.max) count += 1;
    return count;
  };

  // Count how many draft filters are applied
  const draftFiltersCount = () => {
    let count = 0;
    if (draftBrands.length > 0) count += draftBrands.length;
    if (draftNomenclatureIds.length > 0) count += draftNomenclatureIds.length;
    if (draftPriceRange[0] > effectivePriceRange.min || draftPriceRange[1] < effectivePriceRange.max) count += 1;
    return count;
  };

  // Function to create a new query string
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return '?' + params.toString();
  };

  // Function to get current subcategory information for breadcrumb
  const getCurrentSubcategoryInfo = () => {
    if (!activeNomenclatureId) return null;

    // Search all categories to find the one that matches the activeNomenclatureId
    for (const category of ALL_CATEGORIES) {
      for (const group of category.subcategoryGroups) {
        const subcategory = group.subcategories.find(
          (sub) => sub.nomenclatureId === activeNomenclatureId
        );
        if (subcategory) {
          return {
            category: {
              id: category.id,
              name: language === 'ru' ? category.name.ru : category.name.ro
            },
            subcategory: {
              id: subcategory.id,
              name: language === 'ru' ? subcategory.name.ru : subcategory.name.ro
            }
          };
        }
      }
    }
    return null;
  };

  const subcategoryInfo = getCurrentSubcategoryInfo();

  // Breadcrumb component
  const BreadcrumbNav = () => {
    if (!subcategoryInfo) return null;

    return (
      <div className="mb-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="flex items-center text-sm text-gray-700 hover:text-primary">
                <Home className="w-4 h-4 mr-2" />
                {t?.("home") || "Home"}
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link href="/catalog" className="ml-1 text-sm text-gray-700 hover:text-primary">
                  {t?.("catalog") || "Catalog"}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-primary">
                  {subcategoryInfo.subcategory.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    );
  };

  // Desktop filter sidebar
  const DesktopFilters = () => (
    <div className="hidden md:block w-full max-w-xs sticky top-44 self-start">
      {/* Add Breadcrumb */}
      <BreadcrumbNav />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-lg">{t?.("filters") || "Filters"}</h3>
          </div>

          {appliedFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {t?.("clear_all") || "Clear all"}
            </Button>
          )}
        </div>

        {/* Active Filters Section */}
        {appliedFiltersCount() > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">
                {t?.("active_filters") || "Active Filters"}:
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Price Range Filter Badge */}
                {(localPriceRange[0] > effectivePriceRange.min ||
                  localPriceRange[1] < effectivePriceRange.max) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 pr-1 pl-2 py-1"
                  >
                    <span>
                      {t?.("price") || "Price"}: {localPriceRange[0]} - {localPriceRange[1]} MDL
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => {
                        userInitiatedChangesRef.current = true;
                        setLocalPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}

                {/* Brand Filter Badges */}
                {selectedBrands.map(id => {
                  const brand = brands.find(b => b.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 pl-2 py-1"
                    >
                      <span>{brand?.name || id}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={() => {
                          userInitiatedChangesRef.current = true;
                          setSelectedBrands(prev => prev.filter(item => item !== id));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <ScrollArea className="max-h-[600px]">
          <div className="p-4">
            {/* Price Range Filter */}
            <Accordion
              type="multiple"
              value={expandedAccordionValues}
              onValueChange={setExpandedAccordionValues}
              className="w-full"
            >
              <AccordionItem value="price" className="border-b border-gray-100">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary/70" />
                    <span className="font-medium">{t?.("price_range") || "Price Range"}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-6">
                    <div className="px-1">
                      <SliderWrapper
                        value={localPriceRange}
                        onFinalChange={handlePriceChange}
                        min={effectivePriceRange.min}
                        max={effectivePriceRange.max}
                        step={Math.max(1, Math.floor((effectivePriceRange.max - effectivePriceRange.min) / 100))}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Brands Filter - Always show the brands section */}
              <AccordionItem value="brands" className="border-b border-gray-100">
                <AccordionTrigger className="py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary/70"
                    >
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                    <span className="font-medium">{t?.("brands") || "Brands"}</span>
                    {sortedAndFilteredBrands.length > 0 && (
                      <Badge variant="outline" className="ml-2">
                        {sortedAndFilteredBrands.length}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {isBrandsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {t?.("loading_brands") || "Loading brands..."}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1 pb-2 max-h-72 overflow-y-auto">
                      {sortedAndFilteredBrands.length > 0 ? (
                        sortedAndFilteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-center space-x-2 py-2 px-1 rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleBrandToggle(brand.id)}
                          >
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                                selectedBrands.includes(brand.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background"
                              )}
                            >
                              {selectedBrands.includes(brand.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 text-sm font-medium leading-none flex items-center justify-between">
                              <span className={selectedBrands.includes(brand.id) ? "text-primary font-medium" : ""}>
                                {brand.name}
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                {brand.count}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 text-sm text-muted-foreground">
                          {t?.("no_brands_found") || "No brands found"}
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  // Mobile filter dialog
  const MobileFilters = () => {
    // Define a modified renderSubcategories for mobile with draft state
    const renderMobileSubcategories = (categories: any[], indent = 0) => {
      return (
        <ul className="space-y-2 pl-2">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;

            // Check if this is a subcategory (has nomenclatureId) or main category
            const isSubcategory = !!category.nomenclatureId;

            // For subcategories, check if it's selected based on the nomenclatureId
            const isSelected = isSubcategory &&
              (draftNomenclatureIds.includes(category.nomenclatureId) ||
              searchParams.get('nomenclature')?.split(',').includes(category.nomenclatureId));

            return (
              <li key={category.id} className="mt-1">
                <div
                  className={`flex items-center justify-between pr-2 ${
                    indent > 0 ? 'ml-' + (indent * 4) : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSubcategory ? (
                      // Subcategory with checkbox (only subcategories are selectable)
                      <div className="relative flex items-center justify-center">
                        <Checkbox
                          id={`mobile-category-${category.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleDraftNomenclatureToggle(category.nomenclatureId)}
                          className={cn(
                            "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground rounded-full w-4 h-4 border-2",
                            isSelected ? "border-primary" : "border-gray-300"
                          )}
                        />
                        {isSelected && (
                          <div className="absolute w-2 h-2 bg-primary-foreground rounded-full pointer-events-none" />
                        )}
                      </div>
                    ) : hasSubcategories ? (
                      // Main category with expand/collapse button (no checkbox)
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}

                    <div
                      className={cn(
                        "text-sm cursor-pointer",
                        isSubcategory
                          ? isSelected ? "font-medium text-primary" : "font-normal"
                          : "font-medium"
                      )}
                      onClick={() => {
                        if (hasSubcategories) {
                          toggleCategory(category.id);
                        } else if (isSubcategory) {
                          handleDraftNomenclatureToggle(category.nomenclatureId);
                        }
                      }}
                    >
                      {category.name}
                    </div>
                  </div>

                  {hasSubcategories && !isExpanded && (
                    <Badge variant="outline" className="text-xs">
                      {category.subcategories.length}
                    </Badge>
                  )}
                </div>

                {hasSubcategories && isExpanded && (
                  renderMobileSubcategories(category.subcategories, indent + 1)
                )}
              </li>
            );
          })}
        </ul>
      );
    };

    return (
      <Sheet open={isOpen} onOpenChange={(open) => {
        if (isOpen && !open) {
          // Sheet is closing
          applyDraftFilters();
        }
        // Set the open state
        setIsOpen(open);
      }}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-2"
            onClick={(e) => {
              // Use stopPropagation to prevent events from bubbling
              e.stopPropagation();
            }}
          >
            <Filter className="h-4 w-4" />
            {t?.("filters") || "Filters"}
            {appliedFiltersCount() > 0 && (
              <Badge className="ml-1">
                {appliedFiltersCount()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[90%] sm:w-[450px] p-0"
          onPointerDownOutside={(e) => {
            // Prevent outside clicks from closing while dragging
            if (e.target && (e.target as HTMLElement).closest('.SliderRoot')) {
              e.preventDefault();
            }
          }}
        >
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>{t?.("filters") || "Filters"}</span>
              </div>
              {draftFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    // Stop propagation to prevent the sheet from closing
                    e.stopPropagation();
                    clearDraftFilters();
                  }}
                  className="text-sm text-muted-foreground"
                >
                  {t?.("clear_all") || "Clear all"}
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          {/* Breadcrumb for Mobile */}
          {subcategoryInfo && (
            <div className="px-4 py-3 border-b border-gray-100">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 text-sm">
                  <li className="inline-flex items-center">
                    <Link href="/" className="text-gray-700 hover:text-primary flex items-center">
                      <Home className="w-3.5 h-3.5 mr-1" />
                      {t?.("home") || "Home"}
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      <Link href="/catalog" className="ml-1 text-gray-700 hover:text-primary">
                        {t?.("catalog") || "Catalog"}
                      </Link>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="ml-1 font-medium text-primary">
                        {subcategoryInfo.subcategory.name}
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          )}

          {/* Active Filters Section for Mobile */}
          {draftFiltersCount() > 0 && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {t?.("active_filters") || "Active Filters"}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Price Range Filter Badge */}
                  {(draftPriceRange[0] > effectivePriceRange.min ||
                    draftPriceRange[1] < effectivePriceRange.max) && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 pr-1 pl-2 py-1"
                    >
                      <span>
                        {t?.("price") || "Price"}: {draftPriceRange[0]} - {draftPriceRange[1]} MDL
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDraftPriceRange([effectivePriceRange.min, effectivePriceRange.max]);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}

                  {/* Brand Filter Badges */}
                  {isBrandsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {t?.("loading_brands") || "Loading brands..."}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1 pb-2 max-h-96 overflow-y-auto">
                      {sortedAndFilteredBrands.length > 0 ? (
                        sortedAndFilteredBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-center space-x-2 py-2 px-1 rounded-md hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleDraftBrandToggle(brand.id)}
                          >
                            <div
                              className={cn(
                                "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                                draftBrands.includes(brand.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-input bg-background"
                              )}
                            >
                              {draftBrands.includes(brand.id) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1 text-sm font-medium leading-none flex items-center justify-between">
                              <span className={draftBrands.includes(brand.id) ? "text-primary font-medium" : ""}>
                                {brand.name}
                              </span>
                              <Badge variant="outline" className="ml-auto">
                                {brand.count}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 text-sm text-muted-foreground">
                          {t?.("no_brands_found") || "No brands found"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="px-4 py-3">
              {/* Price Range Filter */}
              <Accordion
                type="multiple"
                value={expandedAccordionValues}
                onValueChange={setExpandedAccordionValues}
                className="w-full"
              >
                <AccordionItem value="price" className="border-b">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary/70" />
                      <span className="font-medium">{t?.("price_range") || "Price Range"}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2 pb-4 space-y-6">
                      <div className="px-1 SliderRoot">
                        <SliderWrapper
                          value={draftPriceRange}
                          onFinalChange={handleDraftPriceChange}
                          min={effectivePriceRange.min}
                          max={effectivePriceRange.max}
                          step={Math.max(1, Math.floor((effectivePriceRange.max - effectivePriceRange.min) / 100))}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Brands Filter - Always show the brands section */}
                <AccordionItem value="brands" className="border-b-0">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary/70"
                      >
                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                      </svg>
                      <span className="font-medium">{t?.("brands") || "Brands"}</span>
                      {sortedAndFilteredBrands.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          {sortedAndFilteredBrands.length}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Search input for brands */}
                    <div className="relative mb-3 mt-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t?.("search_brands") || "Search brands..."}
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>

                    {isBrandsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
                        <span className="text-sm text-muted-foreground">
                          {t?.("loading_brands") || "Loading brands..."}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1 pt-1 pb-2 max-h-96 overflow-y-auto">
                        {sortedAndFilteredBrands.length > 0 ? (
                          sortedAndFilteredBrands.map((brand) => (
                            <div
                              key={brand.id}
                              className="flex items-center space-x-2 py-2 px-1 rounded-md hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleDraftBrandToggle(brand.id)}
                            >
                              <div
                                className={cn(
                                  "h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                                  draftBrands.includes(brand.id)
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input bg-background"
                                )}
                              >
                                {draftBrands.includes(brand.id) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <div className="flex-1 text-sm font-medium leading-none flex items-center justify-between">
                                <span className={draftBrands.includes(brand.id) ? "text-primary font-medium" : ""}>
                                  {brand.name}
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                  {brand.count}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-sm text-muted-foreground">
                            {t?.("no_brands_found") || "No brands found"}
                          </div>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>

          <SheetFooter className="px-4 py-4 border-t">
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
              >
                {t?.("cancel") || "Cancel"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  applyDraftFilters();
                }}
              >
                {t?.("apply_filters") || "Apply Filters"}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <>
      <DesktopFilters />
      <MobileFilters />
    </>
  );
}

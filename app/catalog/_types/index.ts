import { ReactNode } from "react";

export interface Product {
  id: string;
  nume: string;
  cod: string;
  pret: number;
  pretRedus?: number | null;
  imagini: string[];
  stoc: number;
  subcategorie: {
    id: string;
    nume: string;
    categoriePrincipala: {
      id: string;
      nume: string;
    };
  };
  stare?: string;
}

export interface FilterOptions {
  priceRange: [number, number];
  categories: string[];
  subcategories: string[];
  brands: string[];
  sortOption: string;
  inStock: boolean;
}

export interface CatalogContentProps {
  initialProducts: any[];
  initialFilters: FilterOptions;
  initialPage: number;
  searchQuery: string;
  totalProducts?: number;
  productsPerPage?: number;
  serverPagination?: boolean;
  randomSampling?: boolean;
}

export interface CatalogLoadingProps {}

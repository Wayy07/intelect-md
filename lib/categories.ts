/**
 * This file contains the centralized definitions of categories used throughout the application.
 * It ensures consistency between components and makes it easier to maintain the category structure.
 */

// Main category ID
export const HAIR_ACCESSORIES_ID = "accesorii-de-par";
export const BIROTICA_ID = "birotica";
export const JUCARII_DE_VARA_ID = "jucarii-de-vara";

// Define category structure with proper typing
export interface Subcategory {
  id: string;        // Raw ID from API
  name: {
    ro: string;      // Romanian name
    ru: string;      // Russian name
  };
}

export interface MainCategory {
  id: string;        // Category ID for routing
  name: {
    ro: string;      // Romanian name
    ru: string;      // Russian name
  };
  subcategories: Subcategory[];
}

// Define the hair accessories categories we're using from the API
export const HAIR_ACCESSORIES: MainCategory = {
  id: HAIR_ACCESSORIES_ID,
  name: {
    ro: "Accesorii de păr",
    ru: "Аксессуары для волос"
  },
  subcategories: [
    {
      id: "Резинки для волос",
      name: {
        ro: "Elastice pentru păr",
        ru: "Резинки для волос"
      }
    },
    {
      id: "Cerc pentru păr",
      name: {
        ro: "Cerc pentru păr",
        ru: "Обручи для волос"
      }
    },
    {
      id: "Заколки для волос",
      name: {
        ro: "Agrafe de păr",
        ru: "Заколки для волос"
      }
    }
  ]
};

export const BIROTICA: MainCategory = {
  id: BIROTICA_ID,
  name: {
    ro: "Birotica",
    ru: "Биротика"
  },
    subcategories: [
        {
            id: "Baterii",
            name: {
                ro: "Baterii",
                ru: "Батарейки"
            }
        },
        {
            id: "Набор канцелярский",
            name: {
                ro: "Articole de papetărie",
                ru: "Набор канцелярский"
            }
        }
  ]
};

export const JUCARII_DE_VARA: MainCategory = {
  id: JUCARII_DE_VARA_ID,
  name: {
    ro: "Jucării de vară",
    ru: "Игрушки для лета"
    },
    subcategories: [
        {
            id: "Пистолеты водяные\/насосы 100-200",
            name: {
                ro: "Pistoale cu apă",
                ru: "Пистолеты водяные"
            }
        }
    ]
};

// Export all categories in a single array for easy mapping
export const ALL_CATEGORIES: MainCategory[] = [
  HAIR_ACCESSORIES,
  BIROTICA,
  JUCARII_DE_VARA
];

// Helper function to get subcategory IDs
export function getSubcategoryIds(categoryId: string): string[] {
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.subcategories.map(sub => sub.id) : [];
}

// Helper function to get a subcategory by ID
export function getSubcategoryById(id: string): Subcategory | undefined {
  for (const category of ALL_CATEGORIES) {
    const subcategory = category.subcategories.find(sub => sub.id === id);
    if (subcategory) return subcategory;
  }
  return undefined;
}

// Helper function to get category by subcategory ID
export function getCategoryBySubcategoryId(subcategoryId: string): MainCategory | undefined {
  return ALL_CATEGORIES.find(
    category => category.subcategories.some(sub => sub.id === subcategoryId)
  );
}

// Function to get translated name based on language
export function getCategoryName(category: MainCategory | Subcategory, language: string): string {
  return language === 'ru' ? category.name.ru : category.name.ro;
}

// Export an array of just the subcategory IDs for easy filtering
export const ALL_SUBCATEGORY_IDS = ALL_CATEGORIES.flatMap(
  category => category.subcategories.map(sub => sub.id)
);

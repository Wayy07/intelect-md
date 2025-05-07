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
  nomenclatureId?: string; // Nomenclature ID for API integration
}

export interface SubcategoryGroup {
  id: string;        // Group ID for routing
  name: {
    ro: string;      // Romanian name
    ru: string;      // Russian name
  };
  subcategories: Subcategory[];
}

export interface MainCategory {
  id: string;        // Category ID for routing
  name: {
    ro: string;      // Romanian name
    ru: string;      // Russian name
  };
  icon: string;      // Icon name to use from Lucide or custom
  subcategoryGroups: SubcategoryGroup[];
}

// Define all categories based on the catalog shown in the image
export const SMARTPHONE_GADGET: MainCategory = {
  id: "smartphone-uri-si-gadget-uri",
  name: {
    ro: "Smartphone-uri și Gadget-uri",
    ru: "Смартфоны и Гаджеты"
  },
  icon: "Smartphone",
  subcategoryGroups: [
    {
      id: "telefoane",
      name: {
        ro: "Telefoane",
        ru: "Телефоны"
      },
      subcategories: [
        {
          id: "smartphone-uri",
          name: {
            ro: "Smartphone-uri",
            ru: "Смартфоны"
          },
          nomenclatureId: "d66ca3b3-4e6d-11ea-b816-00155d1de702" // Smartphones nomenclature ID
        },

      ]
    },
    {
      id: "tablete-ebook",
      name: {
        ro: "Tablete și eBook",
        ru: "Планшеты и электронные книги"
      },
      subcategories: [
        {
          id: "tablete",
          name: {
            ro: "Tablete",
            ru: "Планшеты"
          },
          nomenclatureId: "f0295da0-4e62-11ea-b816-00155d1de702" // Tablets nomenclature ID
        },
        {
          id: "ebook-readere",
          name: {
            ro: "eBook Readere",
            ru: "Электронные книги"
          },
          nomenclatureId: "01d4145f-4e63-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        }
      ]
      },
        {
      id: "gadget-uri",
      name: {
        ro: "Gadget-uri",
        ru: "Гаджеты"
      },
      subcategories: [
        {
          id: "ceasuri-inteligente",
          name: {
            ro: "Ceasuri inteligente",
            ru: "Смарт-часы"
          },
          nomenclatureId: "dc73244f-4e65-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        },
        {
          id: "curele-pentru-ceasuri-inteligente",
          name: {
            ro: "Curele pentru ceasuri inteligente",
            ru: "Браслеты для смарт-часов"
          },
          nomenclatureId: "c881e39f-aa27-11ea-b823-00155d1de702" // eBook readers nomenclature ID
        }
      ]
    },
    {
      id: "accesorii-mobile",
      name: {
        ro: "Accesorii Telefoane Mobile",
        ru: "Аксессуары для Телефон"
      },
      subcategories: [
        {
          id: "huse-telefon",
          name: {
            ro: "Huse Telefon",
            ru: "Чехлы для Телефонов"
          },
          nomenclatureId: "9c55f491-4e6a-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        },
        {
          id: "huse-tablete",
          name: {
            ro: "Huse Tablete",
            ru: "Чехлы для Планшетов"
          },
          nomenclatureId: "5351cb0c-4e64-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        },
        {
          id: "sticle-protectie",
          name: {
            ro: "Sticle Protectie",
            ru: "Стекла защиты"
          },
          nomenclatureId: "b1ee92e9-4e6a-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        },
        {
          id: "incarcatoare",
          name: {
            ro: "Incarcatoare ",
            ru: "Зарядные"
          },
          nomenclatureId: "fe990afd-4e69-11ea-b816-00155d1de702" // eBook readers nomenclature ID
        },
        {
          id: "stative-telefon",
          name: {
            ro: "Stative Telefon",
            ru: "Столы для Телефонов"
          },
          nomenclatureId: "757e16ff-4e6a-11ea-b816-00155d1de702"
        },
        {
          id: "cabluri-si-conectoare",
          name: {
            ro: "Cabluri si Conectoare USB / Lightning",
            ru: "Кабели и Соединители USB / Lightning"
          },
          nomenclatureId: "9f8e23ad-4e59-11ea-b816-00155d1de702"
        }
      ]
    }
  ]
};

export const TV_AUDIO: MainCategory = {
  id: "tv-audio-video-hi-fi",
  name: {
    ro: "TV, Audio-Video, Hi-Fi",
    ru: "ТВ, Аудио-Видео, Hi-Fi"
  },
  icon: "Tv",
  subcategoryGroups: [
    {
      id: "televizoare-si-suporturi",
      name: {
        ro: "Televizoare și Suporturi",
        ru: "Телевизоры и Подставки"
      },
      subcategories: [
        {
          id: "televizoare",
          name: {
            ro: "Televizoare",
            ru: "Телевизоры"
          },
          nomenclatureId: "ee525756-4e6d-11ea-b816-00155d1de702" // TVs nomenclature ID
        },
        {
          id: "suporturi-televizoare",
          name: {
            ro: "Suporturi Televizoare",
            ru: "Подставки для Телевизоров"
          },
          nomenclatureId: "12b049d1-4e6e-11ea-b816-00155d1de702"
        }
      ]
      },
        {
      id: "foto-si-video",
      name: {
        ro: "Foto și Video",
        ru: "Фото и Видео"
      },
      subcategories: [
        {
          id: "aparate-foto-video",
          name: {
            ro: "Camere foto",
            ru: "Фотоаппараты и видеокамеры"
          },
          nomenclatureId: "cdde6ac1-7894-11ea-b81c-00155d1de702"
        },
        {
          id: "blitzuri",
          name: {
            ro: "Blitzuri",
            ru: "Вспышки"
          },
          nomenclatureId: "cdde6ac8-7894-11ea-b81c-00155d1de702"
        },

        {
          id: "obiective",
          name: {
            ro: "Obiective",
            ru: "Объективы"
          },
          nomenclatureId: "cdde6ac7-7894-11ea-b81c-00155d1de702"
        },
      ]
    },
    {
      id: "audio",
      name: {
        ro: "Audio",
        ru: "Аудио"
      },
      subcategories: [
        {
          id: "casti",
          name: {
            ro: "Casti",
            ru: "Наушники"
          },
          nomenclatureId: "6386c044-4d7e-11ea-b816-00155d1de702"
        },
        {
          id: "boxe-portabile",
          name: {
            ro: "Boxe portabile",
            ru: "Портативная акустика"
          },
          nomenclatureId: "293c9672-4d7f-11ea-b816-00155d1de702"
        },
        {
          id: "boxe-calculator",
          name: {
            ro: "Boxe calculator",
            ru: "Компьютерные колонки"
          },
          nomenclatureId: "380907e3-4d7f-11ea-b816-00155d1de702"
          },
        {
          id: "boxe-inteligente",
          name: {
            ro: "Boxe inteligente",
            ru: "Смарт-колонки"
          },
          nomenclatureId: "4b96ff4c-2ee1-11ef-8a0b-00505683d016"
        },
        {
          id: "microfoane",
          name: {
            ro: "Microfoane",
            ru: "Микрофоны"
          },
          nomenclatureId: "9f2b55f7-4d7f-11ea-b816-00155d1de702"
        },
        {
          id: "sisteme-audio",
          name: {
            ro: "Sisteme audio",
            ru: "Аудиосистемы"
          },
          nomenclatureId: "9f494dd7-e133-11ea-b826-00155d1de702"
        }
      ]
      },
        {
      id: "echipamente-de-proiectie",
      name: {
        ro: "Echipamente de proiectie",
        ru: "Проекционное оборудование"
      },
      subcategories: [
        {
          id: "proiectoare",
          name: {
            ro: "Proiectoare",
            ru: "Проекторы"
          },
          nomenclatureId: "b11a8d49-4d72-11ea-b816-00155d1de702"
        },
        {
          id: "suporturi-proiectoare",
          name: {
            ro: "Suporturi Proiectoare",
            ru: "Подставки для Проекторов"
          },
          nomenclatureId: "4a762f59-4d73-11ea-b816-00155d1de702"
        },
        {
          id: "ecrane-proiectoare",
          name: {
            ro: "Ecrane pentru proiectoare",
            ru: "Экраны для проекторов"
          },
          nomenclatureId: "e166b3b3-4d72-11ea-b816-00155d1de702"
        },
        {
          id: "table-interactive",
          name: {
            ro: "Table interactive",
            ru: "Интерактивные столы"
          },
          nomenclatureId: "0803589f-4d73-11ea-b816-00155d1de702"
        }
      ]
      },

  ]
};

export const ELECTROCASNICE_BUCATARIE: MainCategory = {
  id: "electrocasnice-bucatarie",
  name: {
    ro: "Electrocasnice Bucătărie",
    ru: "Электроприборы Кухня"
  },
  icon: "Thermometer",
  subcategoryGroups: [
    {
      id: "aparate-mari-bucatarie",
      name: {
        ro: "Aparate mari bucătărie",
        ru: "Крупная бытовая техника для кухни"
      },
      subcategories: [
        {
          id: "frigidere",
          name: {
            ro: "Frigidere",
            ru: "Холодильники"
          },
          nomenclatureId: "86d48983-4e6e-11ea-b816-00155d1de702"
        },
        {
          id: "cuptoare",
          name: {
            ro: "Cuptoare",
            ru: "Духовки"
          },
          nomenclatureId: "dee5aca3-4f31-11ea-b816-00155d1de702"
        },
        {
          id: "masini-de-spalat-vase",
          name: {
            ro: "Mașini de spălat vase",
            ru: "Посудомоечные машины"
          },
          nomenclatureId: "05a79bd0-4e6f-11ea-b816-00155d1de702"
        }
      ]
    },
    {
      id: "aparate-mici-bucatarie",
      name: {
        ro: "Aparate mici bucătărie",
        ru: "Мелкая бытовая техника для кухни"
      },
      subcategories: [
        {
          id: "microunde",
          name: {
            ro: "Microunde",
            ru: "Микроволновки"
          },
          nomenclatureId: "5576a43a-4f34-11ea-b816-00155d1de702"
        },
        {
          id: "mixere",
          name: {
            ro: "Mixere",
            ru: "Миксеры"
          },
          nomenclatureId: "62939372-4f34-11ea-b816-00155d1de702"
        }
      ]
    }
  ]
};

export const ELECTROCASNICE: MainCategory = {
  id: "electrocasnice",
  name: {
    ro: "Electrocasnice",
    ru: "Электроприборы"
  },
  icon: "WashingMachine",
  subcategoryGroups: [
    {
      id: "aparate-mari-casa",
      name: {
        ro: "Aparate mari pentru casă",
        ru: "Крупная бытовая техника для дома"
      },
      subcategories: [
        {
          id: "masini-de-spalat",
          name: {
            ro: "Mașini de spălat",
            ru: "Стиральные машины"
          },
          nomenclatureId: "a0ab15aa-4e6e-11ea-b816-00155d1de702"
        },
        {
          id: "uscatoare",
          name: {
            ro: "Uscătoare",
            ru: "Сушилки"
          },
          nomenclatureId: "e370559c-4e6e-11ea-b816-00155d1de702"
        },
        {
          id: "masini-de-spalat-si-uscat",
          name: {
            ro: "Mașini de spălat și uscat",
            ru: "Стиральные и сушильные машины"
          },
          nomenclatureId: "eeb9e4cf-4e6e-11ea-b816-00155d1de702"
        }
      ]
    },
    {
      id: "curatenie",
      name: {
        ro: "Curățenie",
        ru: "Уборка"
      },
      subcategories: [
        {
          id: "aspiratoare",
          name: {
            ro: "Aspiratoare",
            ru: "Пылесосы"
          },
          nomenclatureId: "033999cf-4e76-11ea-b816-00155d1de702"
        },
        {
          id: "pressure-washers",
          name: {
            ro: "Masini de spalat cu presiune",
            ru: "Мойки высокого давления"
          },
          nomenclatureId: "57b91c14-04ad-11ec-89e9-00505683d016"
        }
      ]
    }
  ]
};

export const INGRIJIRE_PERSONALA: MainCategory = {
  id: "ingrijire-personala",
  name: {
    ro: "Îngrijire Personală",
    ru: "Личная гигиена"
  },
  icon: "Scissors",
  subcategoryGroups: [
    {
      id: "ingrijire-par-ten",
      name: {
        ro: "Îngrijire păr și ten",
        ru: "Уход за волосами и кожей"
      },
      subcategories: [
        {
          id: "ingrijire-par",
          name: {
            ro: "Îngrijire păr",
            ru: "Уход за волосами"
          }
        },
        {
          id: "aparate-de-tuns",
          name: {
            ro: "Aparate de tuns",
            ru: "Машинки для стрижки"
          },
          nomenclatureId: "3e5d207e-4e75-11ea-b816-00155d1de702"
        }
      ]
    },

  ]
};

export const COMPUTERE: MainCategory = {
  id: "computere",
  name: {
    ro: "Computere",
    ru: "Компьютеры"
  },
  icon: "Laptop",
  subcategoryGroups: [
    {
      id: "computere-si-laptopuri",
      name: {
        ro: "Computere și laptopuri",
        ru: "Компьютеры и ноутбуки"
      },
      subcategories: [
        {
          id: "laptop-uri",
          name: {
            ro: "Laptop-uri",
            ru: "Ноутбуки"
          },
          nomenclatureId: "e42c51cb-4e62-11ea-b816-00155d1de702" // Notebooks nomenclature ID
        },
      ]
    },
    {
      id: "periferice-componente",
      name: {
        ro: "Periferice și componente",
        ru: "Периферия и комплектующие"
      },
      subcategories: [
        {
          id: "monitoare",
          name: {
            ro: "Monitoare",
            ru: "Мониторы"
          },
          nomenclatureId: "223146a2-4d6e-11ea-b816-00155d1de702"
        },
        {
          id: "taste-clavier",
          name: {
            ro: "Tastaturi",
            ru: "Клавиатуры"
          },
          nomenclatureId: "05b393be-4d6f-11ea-b816-00155d1de702"
        }
      ]
    }
  ]
};



export const BIROTICA_RETELISTICA: MainCategory = {
  id: "birotica-si-retelistica",
  name: {
    ro: "Birotică și Rețelistică",
    ru: "Офисные и сетевые устройства"
  },
  icon: "Printer",
  subcategoryGroups: [
    {
      id: "echipamente-birou",
      name: {
        ro: "Echipamente birou",
        ru: "Офисное оборудование"
      },
      subcategories: [
        {
          id: "imprimante",
          name: {
            ro: "Imprimante",
            ru: "Принтеры"
          },
          nomenclatureId: "c52902bc-4d70-11ea-b816-00155d1de702"
        },
        {
          id: "scanere",
          name: {
            ro: "Scanere",
            ru: "Сканеры"
          },
          nomenclatureId: "42a90f7e-4d72-11ea-b816-00155d1de702"
        }
      ]
    },

  ]
};

export const GAMING_DIVERTISMENT: MainCategory = {
  id: "gaming-si-divertisment",
  name: {
    ro: "Gaming și Divertisment",
    ru: "Игры и развлечения"
  },
  icon: "Gamepad2",
  subcategoryGroups: [
    {
      id: "console-jocuri",
      name: {
        ro: "Console și jocuri",
        ru: "Консоли и игры"
          },

      subcategories: [
        {
          id: "console",
          name: {
            ro: "Console",
            ru: "Консоли"
          },
          nomenclatureId: "4c681087-4e6d-11ea-b816-00155d1de702"
        },
        {
          id: "jocuri",
          name: {
            ro: "Jocuri",
            ru: "Игры"
          },
          nomenclatureId: "f8eab680-12fc-11eb-b829-00155d1de702"
        }
      ]
    },
    {
      id: "accesorii-gaming",
      name: {
        ro: "Accesorii gaming",
        ru: "Игровые аксессуары"
      },
      subcategories: [

        {
          id: "scaune-gaming",
          name: {
            ro: "Scaune gaming",
            ru: "Игровые кресла"
          },
          nomenclatureId: "2fff193f-4d7e-11ea-b816-00155d1de702"
          },
           {
          id: "gaming-desks",
          name: {
            ro: "Mese de gaming",
            ru: "Игровые столы"
          },
          nomenclatureId: "55815328-4e6d-11ea-b816-00155d1de702"
           },
           {
          id: "gaming-headphones",
          name: {
            ro: "Headseturi gaming",
            ru: "Игровые наушники"
          },
          nomenclatureId: "8fa0b8ff-4e6d-11ea-b816-00155d1de702"
           },


           {
          id: "gaming-mousepad",
          name: {
            ro: "Mousepad gaming",
            ru: "Игровая мышка"
          },
          nomenclatureId: "85706c9e-4e6d-11ea-b816-00155d1de702"
           }
      ]
    }
  ]
};

export const LUMEA_COPIILOR: MainCategory = {
  id: "lumea-copiilor",
  name: {
    ro: "Lumea Copiilor",
    ru: "Мир детей"
  },
  icon: "Baby",
  subcategoryGroups: [
    {
      id: "jucarii-activitati",
      name: {
        ro: "Jucării și activități",
        ru: "Игрушки и занятия"
      },
      subcategories: [
        {
          id: "jucarii-de-plus",
          name: {
            ro: "Jucării de pluș",
            ru: "Игрушки для купания"
          },
          nomenclatureId: "Jucării din Pluș AMEK"
        },
        {
          id: "jocuri-educative",
          name: {
            ro: "Jocuri educative",
            ru: "Обучающие игры"
          },
          nomenclatureId: "Jocuri educative pentru copii"
        }
      ]
    },
    {
      id: "ingrijire-bebelusi",
      name: {
        ro: "Îngrijire bebeluși",
        ru: "Уход за малышами"
      },
      subcategories: [
        {
          id: "articole-bebelusi",
          name: {
            ro: "Articole bebeluși",
            ru: "Товары для малышей"
          },
          nomenclatureId: "Articole pentru bebeluși"
        },
        {
          id: "scaune-auto",
          name: {
            ro: "Scaune auto",
            ru: "Автокресла"
          },
          nomenclatureId: "Scaune auto pentru copii"
        }
      ]
    },
    {
      id: "jucarii-sezoniere",
      name: {
        ro: "Jucării sezoniere",
        ru: "Сезонные игрушки"
      },
      subcategories: [
        {
          id: "jucarii-vara",
          name: {
            ro: "Jucării de vară",
            ru: "Летние игрушки"
          },
          nomenclatureId: "Jucării de vară"
        },
        {
          id: "jucarii-iarna",
          name: {
            ro: "Jucării de iarnă",
            ru: "Зимние игрушки"
          },
          nomenclatureId: "Jucării de iarnă"
        }
      ]
    }
  ]
};

// Combine all categories
export const ALL_CATEGORIES: MainCategory[] = [
  SMARTPHONE_GADGET,
  TV_AUDIO,
  ELECTROCASNICE_BUCATARIE,
  ELECTROCASNICE,
  INGRIJIRE_PERSONALA,
  COMPUTERE,
  BIROTICA_RETELISTICA,
  GAMING_DIVERTISMENT,
  LUMEA_COPIILOR
];

// Helper function to get all subcategories for a category
export function getAllSubcategories(categoryId: string): Subcategory[] {
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  if (!category) return [];

  return category.subcategoryGroups.flatMap(group => group.subcategories);
}

// Helper function to get subcategory IDs
export function getSubcategoryIds(categoryId: string): string[] {
  return getAllSubcategories(categoryId).map(sub => sub.id);
}

// Helper function to get a subcategory by ID
export function getSubcategoryById(id: string): Subcategory | undefined {
  for (const category of ALL_CATEGORIES) {
    for (const group of category.subcategoryGroups) {
      const subcategory = group.subcategories.find(sub => sub.id === id);
      if (subcategory) return subcategory;
    }
  }
  return undefined;
}

// Helper function to get category by subcategory ID
export function getCategoryBySubcategoryId(subcategoryId: string): MainCategory | undefined {
  return ALL_CATEGORIES.find(
    category => category.subcategoryGroups.some(group =>
      group.subcategories.some(sub => sub.id === subcategoryId)
    )
  );
}

// Helper function to get subcategory group by subcategory ID
export function getSubcategoryGroupBySubcategoryId(subcategoryId: string): SubcategoryGroup | undefined {
  for (const category of ALL_CATEGORIES) {
    for (const group of category.subcategoryGroups) {
      if (group.subcategories.some(sub => sub.id === subcategoryId)) {
        return group;
      }
    }
  }
  return undefined;
}

// Function to get translated name based on language
export function getCategoryName(
  category: MainCategory | SubcategoryGroup | Subcategory,
  language: string
): string {
  return language === 'ru' ? category.name.ru : category.name.ro;
}

// Export an array of just the subcategory IDs for easy filtering
export const ALL_SUBCATEGORY_IDS = ALL_CATEGORIES.flatMap(
  category => category.subcategoryGroups.flatMap(
    group => group.subcategories.map(sub => sub.id)
  )
);

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
          }
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
          }
        },
        {
          id: "ebook-readere",
          name: {
            ro: "eBook Readere",
            ru: "Электронные книги"
          }
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
          }
        },
        {
          id: "curele-pentru-ceasuri-inteligente",
          name: {
            ro: "Curele pentru ceasuri inteligente",
            ru: "Браслеты для смарт-часов"
          }
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
          }
        },
        {
          id: "huse-tablete",
          name: {
            ro: "Huse Tablete",
            ru: "Чехлы для Планшетов"
          }
        },
        {
          id: "sticle-protectie",
          name: {
            ro: "Sticle Protectie",
            ru: "Стекла защиты"
          }
        },
        {
          id: "incarcatoare",
          name: {
            ro: "Incarcatoare ",
            ru: "Зарядные"
          }
        },
        {
          id: "stative-telefon",
          name: {
            ro: "Stative Telefon",
            ru: "Столы для Телефонов"
          }
        },
        {
          id: "cabluri-si-conectoare",
          name: {
            ro: "Cabluri si Conectoare USB / Lightning",
            ru: "Кабели и Соединители USB / Lightning"
          }
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
          }
        },
        {
          id: "suporturi-televizoare",
          name: {
            ro: "Suporturi Televizoare",
            ru: "Подставки для Телевизоров"
          }
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
            ro: "Aparate foto",
            ru: "Фотоаппараты"
          }
        },
        {
          id: "blitzuri",
          name: {
            ro: "Blitzuri",
            ru: "Вспышки"
          }
        },
        {
          id: "camere-video",
          name: {
            ro: "Camere video",
            ru: "Видеокамеры"
          }
        },
        {
          id: "obiective",
          name: {
            ro: "Obiective",
            ru: "Объективы"
          }
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
          }
        },
        {
          id: "boxe-portabile",
          name: {
            ro: "Boxe portabile",
            ru: "Портативная акустика"
          }
        },
        {
          id: "boxe-calculator",
          name: {
            ro: "Boxe calculator",
            ru: "Компьютерные колонки"
          }
        },
        {
          id: "microfoane",
          name: {
            ro: "Microfoane",
            ru: "Микрофоны"
          }
        },
        {
          id: "sisteme-audio",
          name: {
            ro: "Sisteme audio",
            ru: "Аудиосистемы"
          }
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
          }
        },
        {
          id: "suporturi-proiectoare",
          name: {
            ro: "Suporturi Proiectoare",
            ru: "Подставки для Проекторов"
          }
        },
        {
          id: "ecrane-proiectoare",
          name: {
            ro: "Ecrane pentru proiectoare",
            ru: "Экраны для проекторов"
          }
        },
        {
          id: "accesorii-proiectoare",
          name: {
            ro: "Accesorii proiectoare",
            ru: "Аксессуары для проекторов"
          }
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
          }
        },
        {
          id: "cuptoare",
          name: {
            ro: "Cuptoare",
            ru: "Духовки"
          }
        },
        {
          id: "masini-de-spalat-vase",
          name: {
            ro: "Mașini de spălat vase",
            ru: "Посудомоечные машины"
          }
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
          }
        },
        {
          id: "mixere",
          name: {
            ro: "Mixere",
            ru: "Миксеры"
          }
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
          }
        },
        {
          id: "uscatoare",
          name: {
            ro: "Uscătoare",
            ru: "Сушилки"
          }
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
          }
        },
        {
          id: "mopuri-electrice",
          name: {
            ro: "Mopuri electrice",
            ru: "Электрические швабры"
          }
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
          }
        }
      ]
    },
    {
      id: "igiena-personala",
      name: {
        ro: "Igienă personală",
        ru: "Личная гигиена"
      },
      subcategories: [
        {
          id: "aparate-de-ras",
          name: {
            ro: "Aparate de ras",
            ru: "Бритвы"
          }
        },
        {
          id: "periute-de-dinti",
          name: {
            ro: "Periuțe de dinți",
            ru: "Зубные щетки"
          }
        }
      ]
    }
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
          }
        },
        {
          id: "calculatoare",
          name: {
            ro: "Calculatoare",
            ru: "Компьютеры"
          }
        }
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
          }
        },
        {
          id: "componente",
          name: {
            ro: "Componente",
            ru: "Комплектующие"
          }
        }
      ]
    }
  ]
};

export const SMART_HOME: MainCategory = {
  id: "smart-home",
  name: {
    ro: "Smart Home",
    ru: "Умный дом"
  },
  icon: "Home",
  subcategoryGroups: [
    {
      id: "control-casa",
      name: {
        ro: "Control casă",
        ru: "Управление домом"
      },
      subcategories: [
        {
          id: "termostate",
          name: {
            ro: "Termostate",
            ru: "Термостаты"
          }
        },
        {
          id: "sisteme-securitate",
          name: {
            ro: "Sisteme securitate",
            ru: "Системы безопасности"
          }
        }
      ]
    },
    {
      id: "automatizare-confort",
      name: {
        ro: "Automatizare și confort",
        ru: "Автоматизация и комфорт"
      },
      subcategories: [
        {
          id: "lumini-inteligente",
          name: {
            ro: "Lumini inteligente",
            ru: "Умное освещение"
          }
        },
        {
          id: "asistenti-vocali",
          name: {
            ro: "Asistenți vocali",
            ru: "Голосовые помощники"
          }
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
          }
        },
        {
          id: "scanere",
          name: {
            ro: "Scanere",
            ru: "Сканеры"
          }
        }
      ]
    },
    {
      id: "retelistica",
      name: {
        ro: "Rețelistică",
        ru: "Сетевое оборудование"
      },
      subcategories: [
        {
          id: "routere",
          name: {
            ro: "Routere",
            ru: "Маршрутизаторы"
          }
        },
        {
          id: "switch-uri",
          name: {
            ro: "Switch-uri",
            ru: "Коммутаторы"
          }
        }
      ]
    }
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
          }
        },
        {
          id: "jocuri",
          name: {
            ro: "Jocuri",
            ru: "Игры"
          }
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
          id: "accesorii-gaming",
          name: {
            ro: "Accesorii gaming",
            ru: "Игровые аксессуары"
          }
        },
        {
          id: "scaune-gaming",
          name: {
            ro: "Scaune gaming",
            ru: "Игровые кресла"
          }
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
          id: "jucarii",
          name: {
            ro: "Jucării",
            ru: "Игрушки"
          }
        },
        {
          id: "jocuri-educative",
          name: {
            ro: "Jocuri educative",
            ru: "Обучающие игры"
          }
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
          }
        },
        {
          id: "scaune-auto",
          name: {
            ro: "Scaune auto",
            ru: "Автокресла"
          }
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
  SMART_HOME,
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

// Type definitions for the mock data
export interface CategoriePrincipala {
  id: string;
  nume: string;
  numeKey?: string; // Translation key
  descriere?: string | null;
  imagine?: string | null;
  activ: boolean;
}

export interface Subcategorie {
  id: string;
  nume: string;
  numeKey?: string; // Translation key
  descriere?: string | null;
  imagine?: string | null;
  categoriePrincipalaId: string;
  activ: boolean;
}

export interface Produs {
  id: string;
  cod: string;
  nume: string;
  descriere: string;
  pret: number;
  pretRedus?: number | null;
  stoc: number;
  imagini: string[];
  specificatii?: any;
  subcategorieId: string;
  activ: boolean;
  stare: string;
  culoare?: string | null;
  dimensiuni?: any;
  greutate?: number | null;
  creditOption?: {
    months: number;
    monthlyPayment: number;
  } | null;
}

export interface CategoryWithSubcategories extends CategoriePrincipala {
  subcategorii: (Subcategorie & {
    produse: Produs[];
  })[];
}

export interface SubcategoryWithCategory extends Subcategorie {
  categoriePrincipala: {
    id: string;
    nume: string;
    numeKey?: string; // Translation key
  };
}

// Brand interface
export interface Brand {
  id: string;
  name: string;
  nameKey?: string; // Translation key
  logo: string;
  color: string;
  hoverColor: string;
  background: string;
  category: string;
}

// Mock brands data from hero-grid.tsx
export const mockBrands: Brand[] = [
  {
    id: "apple",
    name: "Apple",
    nameKey: "apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    color: "#000000",
    hoverColor: "#111111",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "samsung",
    name: "Samsung",
    nameKey: "samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    color: "#1428a0",
    hoverColor: "#1c3bd4",
    background: "#ffffff",
    category: "cat2",
  },
  {
    id: "lg",
    name: "LG",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/LG_symbol.svg/2048px-LG_symbol.svg.png",
    color: "#a50034",
    hoverColor: "#c50040",
    background: "#ffffff",
    category: "cat3",
  },
  {
    id: "xiaomi",
    name: "Xiaomi",
    nameKey: "xiaomi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg",
    color: "#ff6700",
    hoverColor: "#ff8a3d",
    background: "#ffffff",
    category: "cat2",
  },
  {
    id: "sony",
    name: "Sony",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    color: "#ffffff",
    hoverColor: "#ffffff",
    background: "#ffffff",
    category: "cat3",
  },
  {
    id: "dell",
    name: "Dell",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
    color: "#007db8",
    hoverColor: "#0094d9",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "hp",
    name: "HP",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
    color: "#0096d6",
    hoverColor: "#00adfa",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "lenovo",
    name: "Lenovo",
    nameKey: "lenovo",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/03/Lenovo_Global_Corporate_Logo.png",
    color: "#e2231a",
    hoverColor: "#ff3c33",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "acer",
    name: "Acer",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/Acer_2011.svg",
    color: "#83b81a",
    hoverColor: "#9cdb1f",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "asus",
    name: "Asus",
    nameKey: "asus",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg",
    color: "#00539b",
    hoverColor: "#0068c4",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "msi",
    name: "MSI",
    logo: "https://1000logos.net/wp-content/uploads/2018/10/MSI-Logo.png",
    color: "#ff0000",
    hoverColor: "#ff3333",
    background: "#ffffff",
    category: "cat1",
  },
  {
    id: "huawei",
    name: "Huawei",
    nameKey: "huawei",
    logo: "https://1000logos.net/wp-content/uploads/2018/08/Huawei-Logo.png",
    color: "#ff0000",
    hoverColor: "#ff3333",
    background: "#ffffff",
    category: "cat2",
  },
];

// Mock categories with subcategories
export const mockCategories: CategoryWithSubcategories[] = [
  {
    id: "laptops",
    nume: "Laptopuri",
    numeKey: "category_laptops",
    descriere: "Computere portabile pentru orice necesitate",
    imagine: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
    activ: true,
    subcategorii: [
      {
        id: "notebooks",
        nume: "Notebook-uri",
        numeKey: "subcategory_notebooks",
        descriere: "Laptop-uri ușoare și portabile",
        imagine: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
        categoriePrincipalaId: "laptops",
        activ: true,
        produse: [],
      },
      {
        id: "gaming",
        nume: "Gaming",
        numeKey: "subcategory_gaming",
        descriere: "Laptop-uri pentru gaming de performanță",
        imagine: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6",
        categoriePrincipalaId: "laptops",
        activ: true,
        produse: [],
      },
      {
        id: "ultrabooks",
        nume: "Ultrabook-uri",
        numeKey: "subcategory_ultrabooks",
        descriere: "Laptop-uri subțiri și puternice",
        imagine: "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
        categoriePrincipalaId: "laptops",
        activ: true,
        produse: [],
      },
      {
        id: "business",
        nume: "Business",
        numeKey: "subcategory_business",
        descriere: "Laptop-uri pentru profesioniști",
        imagine: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
        categoriePrincipalaId: "laptops",
        activ: true,
        produse: [],
      },
      {
        id: "apple",
        nume: "Apple MacBook",
        numeKey: "subcategory_apple_macbook",
        descriere: "Laptop-uri premium de la Apple",
        imagine: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9",
        categoriePrincipalaId: "laptops",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "smartphones",
    nume: "Smartphone-uri",
    numeKey: "category_smartphones",
    descriere: "Telefoane inteligente de ultimă generație",
    imagine: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    activ: true,
    subcategorii: [
      {
        id: "iphone",
        nume: "iPhone",
        numeKey: "subcategory_iphone",
        descriere: "Smartphone-uri Apple",
        imagine: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
        categoriePrincipalaId: "smartphones",
        activ: true,
        produse: [],
      },
      {
        id: "samsung",
        nume: "Samsung",
        numeKey: "subcategory_samsung",
        descriere: "Smartphone-uri Samsung Galaxy",
        imagine: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
        categoriePrincipalaId: "smartphones",
        activ: true,
        produse: [],
      },
      {
        id: "xiaomi",
        nume: "Xiaomi",
        numeKey: "subcategory_xiaomi",
        descriere: "Smartphone-uri Xiaomi",
        imagine: "https://images.unsplash.com/photo-1598327105854-2b820363a3a0",
        categoriePrincipalaId: "smartphones",
        activ: true,
        produse: [],
      },
      {
        id: "huawei",
        nume: "Huawei",
        numeKey: "subcategory_huawei",
        descriere: "Smartphone-uri Huawei",
        imagine: "https://images.unsplash.com/photo-1545659705-95518b325e1e",
        categoriePrincipalaId: "smartphones",
        activ: true,
        produse: [],
      },
      {
        id: "budget",
        nume: "Buget",
        numeKey: "subcategory_budget",
        descriere: "Smartphone-uri accesibile",
        imagine: "https://images.unsplash.com/photo-1529653762956-b0a27278529c",
        categoriePrincipalaId: "smartphones",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "tablets",
    nume: "Tablete",
    numeKey: "category_tablets",
    descriere: "Tablete pentru muncă și divertisment",
    imagine: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
    activ: true,
    subcategorii: [
      {
        id: "ipad",
        nume: "iPad",
        numeKey: "subcategory_ipad",
        descriere: "Tablete Apple iPad",
        imagine: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
        categoriePrincipalaId: "tablets",
        activ: true,
        produse: [],
      },
      {
        id: "android",
        nume: "Android",
        numeKey: "subcategory_android_tablets",
        descriere: "Tablete cu Android",
        imagine: "https://images.unsplash.com/photo-1542751110-97427bbecf20",
        categoriePrincipalaId: "tablets",
        activ: true,
        produse: [],
      },
      {
        id: "windows",
        nume: "Windows",
        numeKey: "subcategory_windows_tablets",
        descriere: "Tablete cu Windows",
        imagine: "https://images.unsplash.com/photo-1543069190-f687e00648b2",
        categoriePrincipalaId: "tablets",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "tvs",
    nume: "Televizoare",
    numeKey: "category_tvs",
    descriere: "Televizoare Smart și Ultra HD",
    imagine: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
    activ: true,
    subcategorii: [
      {
        id: "smart",
        nume: "Smart TV",
        numeKey: "subcategory_smart_tv",
        descriere: "Televizoare inteligente",
        imagine: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
        categoriePrincipalaId: "tvs",
        activ: true,
        produse: [],
      },
      {
        id: "4k",
        nume: "4K Ultra HD",
        numeKey: "subcategory_4k",
        descriere: "Televizoare cu rezoluție 4K",
        imagine: "https://images.unsplash.com/photo-1509281373149-e957c6296406",
        categoriePrincipalaId: "tvs",
        activ: true,
        produse: [],
      },
      {
        id: "oled",
        nume: "OLED",
        numeKey: "subcategory_oled",
        descriere: "Televizoare cu tehnologie OLED",
        imagine: "https://images.unsplash.com/photo-1572314493295-09c6d5ec3cdf",
        categoriePrincipalaId: "tvs",
        activ: true,
        produse: [],
      },
      {
        id: "qled",
        nume: "QLED",
        numeKey: "subcategory_qled",
        descriere: "Televizoare cu tehnologie QLED",
        imagine: "https://images.unsplash.com/photo-1498810568083-2ed9a70f96ea",
        categoriePrincipalaId: "tvs",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "headphones",
    nume: "Căști",
    numeKey: "category_headphones",
    descriere: "Căști wireless și cu fir",
    imagine: "https://images.unsplash.com/photo-1545127398-14699f92334b",
    activ: true,
    subcategorii: [
      {
        id: "wireless",
        nume: "Wireless",
        numeKey: "subcategory_wireless",
        descriere: "Căști wireless",
        imagine: "https://images.unsplash.com/photo-1545127398-14699f92334b",
        categoriePrincipalaId: "headphones",
        activ: true,
        produse: [],
      },
      {
        id: "earbuds",
        nume: "Earbuds",
        numeKey: "subcategory_earbuds",
        descriere: "Căști in-ear",
        imagine: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
        categoriePrincipalaId: "headphones",
        activ: true,
        produse: [],
      },
      {
        id: "gaming-headsets",
        nume: "Gaming",
        numeKey: "subcategory_gaming_headsets",
        descriere: "Căști pentru gaming",
        imagine: "https://images.unsplash.com/photo-1612444530582-fc66183b16f7",
        categoriePrincipalaId: "headphones",
        activ: true,
        produse: [],
      },
      {
        id: "noise-cancelling",
        nume: "Anulare zgomot",
        numeKey: "subcategory_noise_cancelling",
        descriere: "Căști cu anulare de zgomot",
        imagine: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        categoriePrincipalaId: "headphones",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "smartwatches",
    nume: "Smartwatch-uri",
    numeKey: "category_smartwatches",
    descriere: "Ceasuri inteligente",
    imagine: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
    activ: true,
    subcategorii: [
      {
        id: "apple-watch",
        nume: "Apple Watch",
        numeKey: "subcategory_apple_watch",
        descriere: "Smartwatch-uri de la Apple",
        imagine: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
        categoriePrincipalaId: "smartwatches",
        activ: true,
        produse: [],
      },
      {
        id: "samsung-watch",
        nume: "Samsung Watch",
        numeKey: "subcategory_samsung_watch",
        descriere: "Smartwatch-uri de la Samsung",
        imagine: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
        categoriePrincipalaId: "smartwatches",
        activ: true,
        produse: [],
      },
      {
        id: "fitness",
        nume: "Fitness",
        numeKey: "subcategory_fitness",
        descriere: "Smartwatch-uri pentru fitness",
        imagine: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288",
        categoriePrincipalaId: "smartwatches",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "consoles",
    nume: "Console",
    numeKey: "category_consoles",
    descriere: "Console de jocuri video",
    imagine: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42",
    activ: true,
    subcategorii: [
      {
        id: "playstation",
        nume: "PlayStation",
        numeKey: "subcategory_playstation",
        descriere: "Console PlayStation",
        imagine: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42",
        categoriePrincipalaId: "consoles",
        activ: true,
        produse: [],
      },
      {
        id: "xbox",
        nume: "Xbox",
        numeKey: "subcategory_xbox",
        descriere: "Console Xbox",
        imagine: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d",
        categoriePrincipalaId: "consoles",
        activ: true,
        produse: [],
      },
      {
        id: "nintendo",
        nume: "Nintendo",
        numeKey: "subcategory_nintendo",
        descriere: "Console Nintendo",
        imagine: "https://images.unsplash.com/photo-1587815073078-f636169821e3",
        categoriePrincipalaId: "consoles",
        activ: true,
        produse: [],
      },
      {
        id: "accessories",
        nume: "Accesorii",
        numeKey: "subcategory_console_accessories",
        descriere: "Accesorii pentru console",
        imagine: "https://images.unsplash.com/photo-1592840496694-26d035b52b48",
        categoriePrincipalaId: "consoles",
        activ: true,
        produse: [],
      },
    ],
  },
  {
    id: "vacuums",
    nume: "Aspiratoare",
    numeKey: "category_vacuums",
    descriere: "Aspiratoare și roboți de curățare",
    imagine: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
    activ: true,
    subcategorii: [
      {
        id: "robot",
        nume: "Roboți",
        numeKey: "subcategory_robot_vacuums",
        descriere: "Aspiratoare robot",
        imagine: "https://images.unsplash.com/photo-1558317374-067fb5f30001",
        categoriePrincipalaId: "vacuums",
        activ: true,
        produse: [],
      },
      {
        id: "handheld",
        nume: "Portabile",
        numeKey: "subcategory_handheld_vacuums",
        descriere: "Aspiratoare portabile",
        imagine: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac",
        categoriePrincipalaId: "vacuums",
        activ: true,
        produse: [],
      },
      {
        id: "upright",
        nume: "Verticale",
        numeKey: "subcategory_upright_vacuums",
        descriere: "Aspiratoare verticale",
        imagine: "https://images.unsplash.com/photo-1563453392212-326f5e854473",
        categoriePrincipalaId: "vacuums",
        activ: true,
        produse: [],
      },
    ],
  },
];

// Additional subcategories with translation keys from hero-grid.tsx
export const mockGridSubcategories: SubcategoryWithCategory[] = [
  {
    id: "sub1",
    nume: "Laptopuri",
    numeKey: "subcategory_laptops",
    descriere: "Laptopuri performante pentru orice buget",
    imagine:
      "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat1",
    activ: true,
    categoriePrincipala: {
      id: "cat1",
      nume: "Computere",
      numeKey: "category_computers",
    },
  },
  {
    id: "sub2",
    nume: "Smartphone-uri",
    numeKey: "subcategory_smartphones",
    descriere: "Telefoane inteligente de la branduri de top",
    imagine:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat2",
    activ: true,
    categoriePrincipala: {
      id: "cat2",
      nume: "Telefoane",
      numeKey: "category_phones",
    },
  },
  {
    id: "sub3",
    nume: "Tablete",
    numeKey: "subcategory_tablets",
    descriere: "Tablete performante pentru orice buget",
    imagine:
      "https://images.unsplash.com/photo-1605236453806-6ff36851218e?q=80&w=3928&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat3",
    activ: true,
    categoriePrincipala: {
      id: "cat3",
      nume: "Tablete",
      numeKey: "category_tablets",
    },
  },
  {
    id: "sub4",
    nume: "Masini de spalat",
    numeKey: "subcategory_washingmachines",
    descriere: "Masini de spalat performante pentru orice buget",
    imagine:
      "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat4",
    activ: true,
    categoriePrincipala: {
      id: "cat4",
      nume: "Electrocasnice",
      numeKey: "category_appliances",
    },
  },
  {
    id: "sub5",
    nume: "Masini de uscat",
    numeKey: "subcategory_dryers",
    descriere: "Masini de uscat performante pentru orice buget",
    imagine:
      "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat4",
    activ: true,
    categoriePrincipala: {
      id: "cat4",
      nume: "Electrocasnice",
      numeKey: "category_appliances",
    },
  },
  {
    id: "sub6",
    nume: "Huse de telefon",
    numeKey: "subcategory_phonecase",
    descriere: "Huse de telefon performante pentru orice buget",
    imagine:
      "https://images.unsplash.com/photo-1651614422777-d92444842a65?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    categoriePrincipalaId: "cat6",
    activ: true,
    categoriePrincipala: {
      id: "cat6",
      nume: "Accesorii",
      numeKey: "category_accessories",
    },
  },
  {
    id: "sub7",
    nume: "Televizoare",
    numeKey: "subcategory_tvs",
    descriere: "Televizoare smart cu rezoluție de top",
    imagine:
      "https://images.unsplash.com/photo-1552975084-6e027cd345c2?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat3",
    activ: true,
    categoriePrincipala: {
      id: "cat3",
      nume: "Electronice",
      numeKey: "category_electronics",
    },
  },
  {
    id: "sub8",
    nume: "Căști",
    numeKey: "subcategory_headphones",
    descriere: "Căști wireless și cu fir de înaltă calitate",
    imagine:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=3865&auto=format&fit=crop",
    categoriePrincipalaId: "cat6",
    activ: true,
    categoriePrincipala: {
      id: "cat6",
      nume: "Accesorii",
      numeKey: "category_accessories",
    },
  },
  {
    id: "sub9",
    nume: "Smartwatch",
    numeKey: "subcategory_smartwatch",
    descriere: "Ceasuri inteligente pentru monitorizarea sănătății",
    imagine:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=3872&auto=format&fit=crop",
    categoriePrincipalaId: "cat2",
    activ: true,
    categoriePrincipala: {
      id: "cat2",
      nume: "Telefoane",
      numeKey: "category_phones",
    },
  },
  {
    id: "sub10",
    nume: "Frigidere",
    numeKey: "subcategory_fridges",
    descriere: "Frigidere economice și spațioase",
    imagine:
      "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat4",
    activ: true,
    categoriePrincipala: {
      id: "cat4",
      nume: "Electrocasnice",
      numeKey: "category_appliances",
    },
  },
  {
    id: "sub11",
    nume: "Monitoare",
    numeKey: "subcategory_monitors",
    descriere: "Monitoare pentru gaming și birou",
    imagine:
      "https://images.unsplash.com/photo-1588200908342-23b585c03e26?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat1",
    activ: true,
    categoriePrincipala: {
      id: "cat1",
      nume: "Computere",
      numeKey: "category_computers",
    },
  },
  {
    id: "sub12",
    nume: "Boxe Bluetooth",
    numeKey: "subcategory_speakers",
    descriere: "Boxe wireless portabile cu sunet premium",
    imagine:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat3",
    activ: true,
    categoriePrincipala: {
      id: "cat3",
      nume: "Electronice",
      numeKey: "category_electronics",
    },
  },
  {
    id: "sub13",
    nume: "Încărcătoare",
    numeKey: "subcategory_chargers",
    descriere: "Încărcătoare rapide pentru toate dispozitivele",
    imagine:
      "https://images.unsplash.com/photo-1583863788233-6292160c89c3?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat6",
    activ: true,
    categoriePrincipala: {
      id: "cat6",
      nume: "Accesorii",
      numeKey: "category_accessories",
    },
  },
  {
    id: "sub14",
    nume: "Console Gaming",
    numeKey: "subcategory_gaming",
    descriere: "Console de gaming de ultimă generație",
    imagine:
      "https://images.unsplash.com/photo-1605899435973-ca2d1a8431cf?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat3",
    activ: true,
    categoriePrincipala: {
      id: "cat3",
      nume: "Electronice",
      numeKey: "category_electronics",
    },
  },
  {
    id: "sub15",
    nume: "Routere",
    numeKey: "subcategory_routers",
    descriere: "Routere Wi-Fi pentru internet rapid",
    imagine:
      "https://images.unsplash.com/photo-1605514449244-db4e1c1a8c1c?q=80&w=3870&auto=format&fit=crop",
    categoriePrincipalaId: "cat3",
    activ: true,
    categoriePrincipala: {
      id: "cat3",
      nume: "Electronice",
      numeKey: "category_electronics",
    },
  },
];

// Generate subcategories with category data from our main categories
export const extendedSubcategories: SubcategoryWithCategory[] = [
  ...mockGridSubcategories,
  ...mockCategories.flatMap((category) =>
    category.subcategorii.map((subcategory) => ({
      ...subcategory,
      categoriePrincipala: {
        id: category.id,
        nume: category.nume,
        numeKey: category.numeKey || category.id,
      },
    }))
  ),
];

// Helper function to get categories with products
export function getCategoriesWithProducts(): CategoryWithSubcategories[] {
  return mockCategories;
}

// Helper function to get N random subcategories
export function getRandomSubcategories(
  count: number = 15
): SubcategoryWithCategory[] {
  // Make a copy to avoid modifying the original array
  const shuffled = [...extendedSubcategories];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return the first 'count' elements
  return shuffled.slice(0, count);
}

// Helper function to get all brands
export function getAllBrands(): Brand[] {
  return mockBrands;
}

// Helper function to get brands by category
export function getBrandsByCategory(categoryId: string): Brand[] {
  return mockBrands.filter((brand) => brand.category === categoryId);
}

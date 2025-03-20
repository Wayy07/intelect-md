// Mock product data for use across the application

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
  descriere?: string;
  specificatii?: Record<string, string | string[]>;
  stare?: string;
}

// Mock data from latest-products.tsx
export const latestProducts: Product[] = [
  {
    id: "1",
    nume: "Laptop Example Pro",
    cod: "LP-001",
    pret: 12999,
    pretRedus: 11499,
    imagini: [
      "https://i.pinimg.com/736x/e3/1e/cb/e31ecb6a811c226875b31dbcb5f48087.jpg",
    ],
    stoc: 10,
    subcategorie: {
      id: "sub1",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "cat1",
        nume: "Computere",
      },
    },
    descriere:
      "Un laptop performant pentru activitățile de zi cu zi și productivitate. Ecran de 15.6 inch, procesor de ultimă generație, și baterie de lungă durată.",
    specificatii: {
      Procesor: ["Intel Core i7", "4.5GHz", "8 nuclee"],
      Memorie: ["16GB DDR4", "Expandabilă până la 32GB"],
      Stocare: ["512GB SSD NVMe"],
      Display: ["15.6 inch", "Full HD", "Anti-glare"],
      Conectivitate: ["WiFi 6", "Bluetooth 5.1", "HDMI", "USB-C"],
    },
    stare: "nou",
  },
  {
    id: "2",
    nume: "Smartphone Example S",
    cod: "SP-002",
    pret: 8999,
    pretRedus: null,
    imagini: [
      "https://i.pinimg.com/736x/48/29/89/4829893a74f7fe42b8738bb1e1975ab1.jpg",
    ],
    stoc: 15,
    subcategorie: {
      id: "sub2",
      nume: "Smartphones",
      categoriePrincipala: {
        id: "cat2",
        nume: "Telefoane",
      },
    },
    descriere:
      "Smartphone de ultimă generație cu cameră foto premium și performanță excelentă. Baterie care durează toată ziua și încărcare rapidă.",
    specificatii: {
      Procesor: ["Octa-core", "2.8GHz"],
      Memorie: ["8GB RAM"],
      Stocare: ["256GB", "Expandabilă cu card microSD"],
      Display: ["6.5 inch", "AMOLED", "120Hz"],
      Cameră: ["50MP principal", "12MP ultra-wide", "8MP telephoto"],
    },
    stare: "nou",
  },
  {
    id: "3-tablet",
    nume: "Tablet Example X",
    cod: "TX-003",
    pret: 5999,
    pretRedus: 4999,
    imagini: [
      "https://i.pinimg.com/736x/a2/5d/49/a25d49f39d30a23c12bb7a10496de4e5.jpg",
    ],
    stoc: 8,
    subcategorie: {
      id: "sub3",
      nume: "Tablete",
      categoriePrincipala: {
        id: "cat2",
        nume: "Tablete",
      },
    },
    descriere:
      "Tabletă elegantă și performantă, ideală pentru muncă și distracție. Ecran vibrant și baterie de lungă durată pentru productivitate oriunde te-ai afla.",
    stare: "nou",
  },
  {
    id: "4",
    nume: "Gaming Laptop XR",
    cod: "GL-004",
    pret: 14999,
    pretRedus: 13499,
    imagini: [
      "https://i.pinimg.com/736x/98/53/a0/9853a02985f8d43c40e4e241510aafd0.jpg",
    ],
    stoc: 6,
    subcategorie: {
      id: "sub1",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "cat1",
        nume: "Computere",
      },
    },
    descriere:
      "Laptop de gaming cu performanțe excepționale. Procesor rapid, placă video dedicată și sistem de răcire avansat pentru sesiuni intense de gaming.",
    stare: "nou",
  },
  {
    id: "5",
    nume: "Smartwatch Pro",
    cod: "SW-005",
    pret: 2499,
    pretRedus: 1999,
    imagini: [
      "https://i.pinimg.com/736x/13/3d/f7/133df7a978301d2bf5be132bd31a6803.jpg",
    ],
    stoc: 20,
    subcategorie: {
      id: "sub4",
      nume: "Smartwatch-uri",
      categoriePrincipala: {
        id: "cat4",
        nume: "Accesorii",
      },
    },
    descriere:
      "Ceas inteligent cu monitorizare completă a sănătății și fitness. Rezistent la apă, cu autonomie de până la 7 zile și ecran always-on.",
  },
  {
    id: "6",
    nume: "Wireless Earbuds Elite",
    cod: "WE-006",
    pret: 1299,
    pretRedus: null,
    imagini: [
      "https://i.pinimg.com/736x/1d/0c/b0/1d0cb053d5f37b1ad0455c857f70b545.jpg",
    ],
    stoc: 25,
    subcategorie: {
      id: "sub5",
      nume: "Căști",
      categoriePrincipala: {
        id: "cat4",
        nume: "Accesorii",
      },
    },
    descriere:
      "Căști wireless compacte cu sunet excepțional și anularea zgomotului. Baterie de lungă durată și conectivitate stabilă pentru experiență audio premium.",
  },
  {
    id: "7",
    nume: "4K Curved Monitor",
    cod: "CM-007",
    pret: 5499,
    pretRedus: 4799,
    imagini: [
      "https://i.pinimg.com/736x/82/ce/b7/82ceb768cf79e9c05abfb88b2042115e.jpg",
    ],
    stoc: 7,
    subcategorie: {
      id: "sub6",
      nume: "Monitoare",
      categoriePrincipala: {
        id: "cat1",
        nume: "Computere",
      },
    },
    descriere:
      "Monitor curbat 4K pentru experiență vizuală imersivă. Perfect pentru gaming, editare foto/video și productivitate extinsă.",
  },
  {
    id: "8",
    nume: "Premium Smartphone Z",
    cod: "PSZ-008",
    pret: 11999,
    pretRedus: 10999,
    imagini: [
      "https://i.pinimg.com/736x/82/ba/f4/82baf46c486d9da8c187ee3f610c3d60.jpg",
    ],
    stoc: 5,
    subcategorie: {
      id: "sub2",
      nume: "Smartphones",
      categoriePrincipala: {
        id: "cat2",
        nume: "Telefoane",
      },
    },
    descriere:
      "Smartphone premium cu sistem de camere profesionale și performanțe de vârf. Design elegant din sticlă și metal, cu protecție IP68.",
  },
  {
    id: "9",
    nume: "Ultrabook Slim 14",
    cod: "US-009",
    pret: 8999,
    pretRedus: null,
    imagini: [
      "https://i.pinimg.com/736x/fe/d6/70/fed670c69d86adb5773596a2947ea8c4.jpg",
    ],
    stoc: 12,
    subcategorie: {
      id: "sub1",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "cat1",
        nume: "Computere",
      },
    },
    descriere:
      "Ultrabook super-subțire și ușor, perfect pentru profesioniștii în mișcare. Performanță excelentă într-un design elegant și portabil.",
  },
  {
    id: "10",
    nume: "Professional Camera X200",
    cod: "PC-010",
    pret: 18999,
    pretRedus: 16999,
    imagini: [
      "https://i.pinimg.com/736x/f0/58/57/f0585720ee52da014d80bcadd034bee4.jpg",
    ],
    stoc: 3,
    subcategorie: {
      id: "sub7",
      nume: "Camere Foto",
      categoriePrincipala: {
        id: "cat3",
        nume: "Electronice",
      },
    },
    descriere:
      "Cameră profesională pentru fotografi profesioniști. Senzor full-frame, autofocus rapid și filmare 4K pentru rezultate excepționale.",
  },
];

// Mock data from special-offers.tsx
export const specialOffersOriginal: Product[] = [
  {
    id: "11",
    nume: 'Smart TV Example 55"',
    cod: "TV-001",
    pret: 9999,
    pretRedus: 7999,
    imagini: [
      "https://i.pinimg.com/736x/43/56/a2/4356a298dfaed495458c8b5b42c6b0f4.jpg",
    ],
    stoc: 5,
    subcategorie: {
      id: "sub1",
      nume: "Smart TV",
      categoriePrincipala: {
        id: "cat1",
        nume: "Electronice",
      },
    },
    descriere:
      "Smart TV de 55 inch cu rezoluție 4K, sistem de operare inteligent și suport pentru toate aplicațiile populare de streaming.",
    stare: "nou",
  },
  {
    id: "12",
    nume: "Wireless Headphones Pro",
    cod: "WH-002",
    pret: 1999,
    pretRedus: 1499,
    imagini: [
      "https://i.pinimg.com/736x/7b/fe/a7/7bfea72d8abb5e0f43025ffe018ae8c1.jpg",
    ],
    stoc: 20,
    subcategorie: {
      id: "sub2",
      nume: "Căști",
      categoriePrincipala: {
        id: "cat2",
        nume: "Accesorii",
      },
    },
    descriere:
      "Căști wireless over-ear cu anulare activă a zgomotului și calitate audio premium. Autonomie de până la 30 ore.",
    stare: "nou",
  },
  {
    id: "13",
    nume: "Gaming Console X",
    cod: "GC-003",
    pret: 7999,
    pretRedus: 6999,
    imagini: [
      "https://i.pinimg.com/736x/bb/95/c6/bb95c677a7b2acfd476c078c89adc43d.jpg",
    ],
    stoc: 8,
    subcategorie: {
      id: "sub3",
      nume: "Console",
      categoriePrincipala: {
        id: "cat3",
        nume: "Gaming",
      },
    },
    descriere:
      "Consolă de gaming next-gen cu grafică 4K, SSD ultra-rapid și bibliotecă extinsă de jocuri. Experiență de gaming imersivă.",
    stare: "nou",
  },
  {
    id: "14",
    nume: "High-Performance SSD 1TB",
    cod: "SSD-004",
    pret: 1499,
    pretRedus: 999,
    imagini: [
      "https://i.pinimg.com/736x/83/59/1d/83591dc7938ec091dae42669370aacb8.jpg",
    ],
    stoc: 30,
    subcategorie: {
      id: "sub4",
      nume: "Componente PC",
      categoriePrincipala: {
        id: "cat4",
        nume: "Computere",
      },
    },
    descriere:
      "SSD de înaltă performanță cu capacitate de 1TB. Viteze de citire/scriere ultra-rapide pentru îmbunătățirea substanțială a sistemului.",
    stare: "nou",
  },
  {
    id: "15",
    nume: "Robot Vacuum Cleaner Pro",
    cod: "RVC-005",
    pret: 3499,
    pretRedus: 2799,
    imagini: [
      "https://i.pinimg.com/736x/32/b0/6a/32b06afb09187e18d8839cc5220578cf.jpg",
    ],
    stoc: 12,
    subcategorie: {
      id: "sub5",
      nume: "Aspiratoare",
      categoriePrincipala: {
        id: "cat5",
        nume: "Electrocasnice",
      },
    },
    descriere:
      "Robot aspirator inteligent cu navigație laser, mop integrat și control prin aplicație. Programare completă și suport pentru asistent vocal.",
  },
  {
    id: "16",
    nume: "Premium Coffee Machine",
    cod: "PCM-006",
    pret: 4999,
    pretRedus: 3999,
    imagini: [
      "https://i.pinimg.com/736x/d8/03/34/d803340190743d9ef5a5bca0789e2c1e.jpg",
    ],
    stoc: 8,
    subcategorie: {
      id: "sub6",
      nume: "Aparate Cafea",
      categoriePrincipala: {
        id: "cat5",
        nume: "Electrocasnice",
      },
    },
    descriere:
      "Aparat de cafea premium cu funcții automate, sistem de spumare a laptelui și setări personalizabile pentru băuturi perfecte.",
  },
  {
    id: "17",
    nume: "Bluetooth Speaker System",
    cod: "BSS-007",
    pret: 2499,
    pretRedus: 1999,
    imagini: [
      "https://i.pinimg.com/236x/8e/a8/81/8ea881b449381c96f067db99ff18374a.jpg",
    ],
    stoc: 15,
    subcategorie: {
      id: "sub7",
      nume: "Boxe",
      categoriePrincipala: {
        id: "cat6",
        nume: "Audio",
      },
    },
    descriere:
      "Sistem de boxe Bluetooth cu sunet surround și bas profund. Conectivitate multiplă și design elegant pentru orice spațiu.",
  },
  {
    id: "18",
    nume: "Digital Camera 24MP",
    cod: "DC-008",
    pret: 5999,
    pretRedus: 4799,
    imagini: [
      "https://i.pinimg.com/736x/d2/f8/15/d2f81582b1be7677913bdb47fd671465.jpg",
    ],
    stoc: 7,
    subcategorie: {
      id: "sub8",
      nume: "Camere Foto",
      categoriePrincipala: {
        id: "cat7",
        nume: "Foto & Video",
      },
    },
    descriere:
      "Cameră digitală performantă cu senzor de 24MP, zoom optic 10x și înregistrare video 4K. Perfectă pentru fotografii și videografi entuziaști.",
  },
  {
    id: "19",
    nume: "Smart Doorbell Camera",
    cod: "SDC-009",
    pret: 1299,
    pretRedus: 999,
    imagini: [
      "https://i.pinimg.com/736x/6e/0e/6a/6e0e6aafb33ead45243a32df63fd6a24.jpg",
    ],
    stoc: 22,
    subcategorie: {
      id: "sub9",
      nume: "Smart Home",
      categoriePrincipala: {
        id: "cat8",
        nume: "Securitate",
      },
    },
    descriere:
      "Sonerie inteligentă cu cameră HD, detecție de mișcare și comunicare bidirecțională. Integrare cu sisteme smart home pentru securitate sporită.",
  },
  {
    id: "20",
    nume: "Electric Scooter Pro",
    cod: "ESP-010",
    pret: 4999,
    pretRedus: 3999,
    imagini: [
      "https://i.pinimg.com/736x/12/74/ca/1274caad035ca4798dc73c03b53db448.jpg",
    ],
    stoc: 5,
    subcategorie: {
      id: "sub10",
      nume: "Transport",
      categoriePrincipala: {
        id: "cat9",
        nume: "Mobilitate",
      },
    },
    descriere:
      "Trotinetă electrică cu autonomie mare, motor puternic și design pliabil pentru transport facil. Suspensii duale pentru confort sporit.",
  },
  {
    id: "21",
    nume: "Fitness Smartwatch",
    cod: "FS-011",
    pret: 1999,
    pretRedus: 1499,
    imagini: [
      "https://i.pinimg.com/736x/75/73/d2/7573d2fc105e5f2108b17281889045ac.jpg",
    ],
    stoc: 25,
    subcategorie: {
      id: "sub11",
      nume: "Smartwatch-uri",
      categoriePrincipala: {
        id: "cat2",
        nume: "Accesorii",
      },
    },
    descriere:
      "Ceas inteligent dedicat fitness cu monitorizare avansată a antrenamentelor, senzori medicali și baterie de lungă durată.",
  },
  {
    id: "22",
    nume: "Gaming Keyboard RGB",
    cod: "GK-012",
    pret: 899,
    pretRedus: 699,
    imagini: [
      "https://i.pinimg.com/736x/39/8c/08/398c086c80c6dde50742d2c6562522d7.jpg",
    ],
    stoc: 30,
    subcategorie: {
      id: "sub12",
      nume: "Periferice",
      categoriePrincipala: {
        id: "cat3",
        nume: "Gaming",
      },
    },
    descriere:
      "Tastatură mecanică pentru gaming cu iluminare RGB personalizabilă, switch-uri rapide și construcție robustă pentru performanță competitivă.",
  },
];

// Updated special offers with additional products
export const specialOffers: Product[] = [...specialOffersOriginal];

// Combined products for easy access
export const allProducts: Product[] = [...latestProducts, ...specialOffers];

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
  return allProducts.find((product) => product.id === id);
}

// Helper function to get discount percentage
export function getDiscountPercentage(product: Product): number {
  if (!product.pretRedus) return 0;
  return Math.round(((product.pret - product.pretRedus) / product.pret) * 100);
}

// Helper function to get related products (same category)
export function getRelatedProducts(
  product: Product,
  limit: number = 4
): Product[] {
  const sameCategoryProducts = allProducts.filter(
    (p) =>
      p.id !== product.id &&
      p.subcategorie.categoriePrincipala.id ===
        product.subcategorie.categoriePrincipala.id
  );

  // Shuffle array to get random related products
  return sameCategoryProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(limit, sameCategoryProducts.length));
}

// Additional helper function to add test favorite products for testing
export function getRandomProducts(limit: number = 4): Product[] {
  return [...allProducts]
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(limit, allProducts.length));
}

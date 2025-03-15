// Product interface matching what is used throughout the app
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
    }
  };
  descriere?: string;
  specificatii?: {
    [key: string]: string;
  };
  stare: string;
}

// Mock database of products
export const mockProducts: Product[] = [
  {
    id: "1",
    nume: "Laptop Apple MacBook Air 13\" M2",
    cod: "MAC-M2-AIR",
    pret: 25999,
    pretRedus: 24499,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-digitalmat-gallery-1-202111?wid=728&hei=666&fmt=png-alpha&.v=1635183223000",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-digitalmat-gallery-2-202111?wid=728&hei=666&fmt=png-alpha&.v=1635183221000",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-digitalmat-gallery-3-202111?wid=728&hei=666&fmt=png-alpha&.v=1635183221000",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba-digitalmat-gallery-4-202111?wid=728&hei=666&fmt=png-alpha&.v=1635183220000"
    ],
    stoc: 10,
    subcategorie: {
      id: "laptops",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "computers",
        nume: "Computere"
      }
    },
    descriere: "Superîncărcat cu cipurile M2 de ultimă generație. MacBook Air a fost reproiectat în jurul următoarei generații de cipuri Apple, oferind o performanță extraordinară într-un design nou, mai subțire. Are o durată de viață a bateriei de până la 18 ore și vine cu MagSafe, astfel încât atunci când se eliberează, cablul se desprinde, iar MacBook Air nu cade.",
    specificatii: {
      "Procesor": "Apple M2 cu CPU 8‑core și GPU 8‑core",
      "Memorie": "8GB memorie RAM",
      "Stocare": "256GB SSD",
      "Display": "Liquid Retina 13.6 inch (2560 x 1664)",
      "Cameră": "FaceTime HD 1080p",
      "Baterie": "Până la 18 ore de autonomie",
      "Sistem de operare": "macOS Ventura",
      "Greutate": "1.24 kg",
      "Porturi": "2 x Thunderbolt / USB 4, Audio jack 3.5mm, MagSafe 3",
      "Wireless": "Wi-Fi 6 (802.11ax), Bluetooth 5.0"
    },
    stare: "nou"
  },
  {
    id: "2",
    nume: "Laptop Apple MacBook Pro 14\" M2 Pro",
    cod: "MAC-M2-PRO-14",
    pret: 32999,
    pretRedus: 31499,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-gallery1-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1670621031697",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-gallery2-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1671149541171",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp14-spacegray-gallery3-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1671149544497"
    ],
    stoc: 5,
    subcategorie: {
      id: "laptops",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "computers",
        nume: "Computere"
      }
    },
    descriere: "Puternic superîncărcat cu cele mai noi cipuri M2 Pro sau M2 Max, MacBook Pro este mai rapid și mai eficient decât oricând. Oferă performanță excepțională, fie că este conectat sau nu, și acum are o durată de viață a bateriei mai lungă. Împreună cu un ecran Liquid Retina XDR uimitor și toate porturile de care ai nevoie.",
    specificatii: {
      "Procesor": "Apple M2 Pro cu CPU 10‑core și GPU 16‑core",
      "Memorie": "16GB memorie unificată",
      "Stocare": "512GB SSD",
      "Display": "Liquid Retina XDR 14.2 inch (3024 x 1964)",
      "Cameră": "FaceTime HD 1080p",
      "Baterie": "Până la 18 ore de autonomie",
      "Sistem de operare": "macOS Ventura",
      "Greutate": "1.6 kg",
      "Porturi": "3 x Thunderbolt 4, HDMI, Slot SDXC, Audio jack 3.5mm, MagSafe 3",
      "Wireless": "Wi-Fi 6E (802.11ax), Bluetooth 5.3"
    },
    stare: "nou"
  },
  {
    id: "3",
    nume: "Laptop Apple MacBook Pro 16\" M2 Max",
    cod: "MAC-M2-MAX-16",
    pret: 45999,
    pretRedus: null,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-gallery1-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1670621030349",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-gallery2-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1670621032076",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-gallery3-202301?wid=2000&hei=1536&fmt=jpeg&qlt=95&.v=1670621033163"
    ],
    stoc: 3,
    subcategorie: {
      id: "laptops",
      nume: "Laptopuri",
      categoriePrincipala: {
        id: "computers",
        nume: "Computere"
      }
    },
    descriere: "MacBook Pro de 16 inchi cu M2 Max oferă o performanță de neegalat pentru utilizatorii profesioniști. Powered by M2 Max — cipul personal de computer cel mai puternic din lume — noul MacBook Pro depășește semnificativ MacBook Pro anterior, oferind până la 96GB memorie unificată și cu până la 22 de ore de autonomie a bateriei.",
    specificatii: {
      "Procesor": "Apple M2 Max cu CPU 12‑core și GPU 38‑core",
      "Memorie": "32GB memorie unificată",
      "Stocare": "1TB SSD",
      "Display": "Liquid Retina XDR 16.2 inch (3456 x 2234)",
      "Cameră": "FaceTime HD 1080p",
      "Baterie": "Până la 22 ore de autonomie",
      "Sistem de operare": "macOS Ventura",
      "Greutate": "2.16 kg",
      "Porturi": "3 x Thunderbolt 4, HDMI, Slot SDXC, Audio jack 3.5mm, MagSafe 3",
      "Wireless": "Wi-Fi 6E (802.11ax), Bluetooth 5.3"
    },
    stare: "nou"
  },
  {
    id: "4",
    nume: "PC Apple Mac Mini M2",
    cod: "MAC-MINI-M2",
    pret: 18999,
    pretRedus: 17499,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-mini-hero-202301?wid=1254&hei=1132&fmt=jpeg&qlt=90&.v=1670038314708",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mac-mini-ports-202301?wid=1254&hei=1132&fmt=jpeg&qlt=90&.v=1670038356758"
    ],
    stoc: 8,
    subcategorie: {
      id: "desktops",
      nume: "PC-uri",
      categoriePrincipala: {
        id: "computers",
        nume: "Computere"
      }
    },
    descriere: "Mac mini este acum superîncărcat de cipurile M2 și M2 Pro. Având o performanță mai puternică, un set mai mare de conexiuni și capacitățile de ultimă generație pentru fluxuri de lucru ale creatorilor profesioniști — totul într-un design compact incredibil.",
    specificatii: {
      "Procesor": "Apple M2 cu CPU 8‑core și GPU 10‑core",
      "Memorie": "8GB memorie unificată",
      "Stocare": "256GB SSD",
      "Porturi": "2 x Thunderbolt 4, 2 x USB-A, HDMI, Ethernet, Audio jack 3.5mm",
      "Sistem de operare": "macOS Ventura",
      "Dimensiuni": "19.7 cm x 19.7 cm x 3.6 cm",
      "Greutate": "1.18 kg",
      "Wireless": "Wi-Fi 6E (802.11ax), Bluetooth 5.3"
    },
    stare: "nou"
  },
  {
    id: "5",
    nume: "Smartphone Samsung Galaxy S23 Ultra",
    cod: "SAM-S23-ULTRA",
    pret: 21999,
    pretRedus: null,
    imagini: [
      "https://images.samsung.com/is/image/samsung/p6pim/ro/2302/gallery/ro-galaxy-s23-ultra-s918-sm-s918bzggeue-534859389",
      "https://images.samsung.com/is/image/samsung/p6pim/ro/2302/gallery/ro-galaxy-s23-ultra-s918-sm-s918bzggeue-534859374",
      "https://images.samsung.com/is/image/samsung/p6pim/ro/2302/gallery/ro-galaxy-s23-ultra-s918-sm-s918bzggeue-534859375"
    ],
    stoc: 15,
    subcategorie: {
      id: "smartphones",
      nume: "Smartphone-uri",
      categoriePrincipala: {
        id: "phones",
        nume: "Telefoane"
      }
    },
    descriere: "Galaxy S23 Ultra este dotat cu un procesor Snapdragon 8 Gen 2 pentru Galaxy, special optimizat pentru utilizatorii Samsung, și cu o cameră de 200MP care surprinde momentele extraordinare ale vieții tale cu o claritate incredibilă. Acesta este format dintr-o carcasă din Armor Aluminum care este mai durabilă decât predecesorul său și conține materiale reciclate.",
    specificatii: {
      "Procesor": "Snapdragon 8 Gen 2",
      "Memorie": "12GB RAM",
      "Stocare": "256GB",
      "Display": "6.8-inch Dynamic AMOLED 2X, 120Hz",
      "Cameră principală": "200MP (wide) + 10MP (periscope telephoto) + 10MP (telephoto) + 12MP (ultrawide)",
      "Cameră frontală": "12MP",
      "Baterie": "5000mAh",
      "Sistem de operare": "Android 13, One UI 5.1",
      "Rezistență": "IP68 (apă și praf)",
      "S Pen": "Integrat"
    },
    stare: "nou"
  },
  {
    id: "6",
    nume: "Tabletă Apple iPad Pro 12.9\" M2",
    cod: "IPD-M2-PRO-129",
    pret: 15999,
    pretRedus: 14999,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-12-11-select-202210?wid=545&hei=550&fmt=jpeg&qlt=95&.v=1664412210058",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-11-select-cell-spacegray-202210?wid=1024&hei=1032&fmt=jpeg&qlt=90&.v=1664412732116",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-accessories-202210?wid=2010&hei=1168&fmt=jpeg&qlt=90&.v=1664492515212"
    ],
    stoc: 7,
    subcategorie: {
      id: "tablets",
      nume: "Tablete",
      categoriePrincipala: {
        id: "computers",
        nume: "Computere"
      }
    },
    descriere: "iPad Pro. Cu performanță ultrarapidă de la cipul M2, un ecran Liquid Retina XDR uimitor și conexiuni wireless rapide. Adaugă Apple Pencil, Magic Keyboard și aplicații iPadOS puternice. Este experiența tabletei supremă.",
    specificatii: {
      "Procesor": "Apple M2",
      "Memorie": "8GB RAM",
      "Stocare": "256GB",
      "Display": "12.9-inch Liquid Retina XDR",
      "Cameră principală": "12MP wide + 10MP ultrawide",
      "Cameră frontală": "12MP ultrawide",
      "Baterie": "Până la 10 ore",
      "Sistem de operare": "iPadOS 16",
      "Conectivitate": "Wi-Fi 6E, Bluetooth 5.3, USB-C (Thunderbolt / USB 4)",
      "Autentificare": "Face ID"
    },
    stare: "nou"
  },
  {
    id: "7",
    nume: "Căști Apple AirPods Pro 2",
    cod: "APP-AIRPODS-PRO2",
    pret: 4999,
    pretRedus: 4499,
    imagini: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972361",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83_AV1?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803973077",
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83_AV2?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1660803972833"
    ],
    stoc: 20,
    subcategorie: {
      id: "headphones",
      nume: "Căști",
      categoriePrincipala: {
        id: "accessories",
        nume: "Accesorii"
      }
    },
    descriere: "AirPods Pro (a 2-a generație) cu o anulare activă a zgomotului de până la de două ori mai eficientă decât generația anterioară. Mod transparență adaptiv pentru a auzi sunetele din jur, reducând în același timp zgomotele puternice. Audio spațial personalizat care plasează sunetul peste tot în jurul tău.",
    specificatii: {
      "Chip": "Apple H2",
      "Anulare zgomot": "Anulare activă a zgomotului (ANC)",
      "Mod transparență": "Mod transparență adaptiv",
      "Audio": "Audio spațial personalizat cu urmărirea dinamică a capului",
      "Rezistență": "Rezistent la transpirație și apă (IPX4)",
      "Baterie": "Până la 6 ore de ascultare (30 ore cu carcasa)",
      "Încărcare": "USB-C, MagSafe, încărcare wireless Qi",
      "Microfoane": "Microfoane cu detecție vocală și formarea fasciculului",
      "Senzori": "Senzor de forță pentru controlul prin apăsare",
      "Compatibilitate": "iOS, iPadOS, macOS, watchOS"
    },
    stare: "nou"
  },
  {
    id: "8",
    nume: "Smart TV Sony Bravia XR A80L OLED 65\"",
    cod: "SON-XR-A80L-65",
    pret: 19999,
    pretRedus: 18499,
    imagini: [
      "https://s13emagst.akamaized.net/products/53409/53408692/images/res_fd99f83fc6f5dab839e94e51f5bc3ba7.jpg",
      "https://s13emagst.akamaized.net/products/53409/53408692/images/res_c8af39ae29f28d2a95b6cc8c8e21cc59.jpg",
      "https://s13emagst.akamaized.net/products/53409/53408692/images/res_811d3a9a4216f09a7a87adc2eb6cd8e8.jpg"
    ],
    stoc: 5,
    subcategorie: {
      id: "smart-tv",
      nume: "Smart TV",
      categoriePrincipala: {
        id: "electronics",
        nume: "Electronice"
      }
    },
    descriere: "Sony BRAVIA XR A80L OLED TV cu Cognitive Processor XR inteligent ce analizează conținutul pentru a oferi culori și contrast realist. Tehnologia OLED XR Triluminos Pro reproduce miliarde de culori cu nuanțe naturale, iar difuzorul XR Acoustic Surface Audio+ transformă întregul ecran într-un difuzor pentru un sunet perfect sincronizat cu imaginea.",
    specificatii: {
      "Display": "OLED 4K Ultra HD (3840 x 2160)",
      "Diagonală": "65 inch (165 cm)",
      "Procesor": "Cognitive Processor XR",
      "HDR": "Dolby Vision, HDR10, HLG",
      "Refresh rate": "120Hz",
      "Smart TV": "Google TV",
      "Conectivitate": "Wi-Fi, Bluetooth, HDMI 2.1, USB",
      "Audio": "Acoustic Surface Audio+",
      "Control vocal": "Asistent Google, Alexa",
      "Gaming": "HDMI 2.1, VRR, ALLM, 4K/120fps"
    },
    stare: "nou"
  }
];

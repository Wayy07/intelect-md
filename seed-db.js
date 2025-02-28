const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Clean database by applying fresh migrations
    console.log('Applying migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    // 1. Create Admin User

    // 2. Create Main Categories
    console.log('Creating main categories...');

    // const mainCategories = [
    //   {
    //     nume: 'Telefoane și Accesorii',
    //     descriere: 'Telefoane mobile, huse, încărcătoare și alte accesorii pentru telefoane.',
    //     imagine: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1080',
    //   },
    //   {
    //     nume: 'Laptopuri și Computere',
    //     descriere: 'Laptopuri, computere de birou, componente și periferice.',
    //     imagine: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1080',
    //   },
    //   {
    //     nume: 'Audio și Video',
    //     descriere: 'Căști, boxe, televizoare și echipamente de sunet.',
    //     imagine: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1080',
    //   },
    //   {
    //     nume: 'Gadget-uri și Wearables',
    //     descriere: 'Ceasuri inteligente, brățări fitness și alte dispozitive purtabile.',
    //     imagine: 'https://images.unsplash.com/photo-1519698363197-19a66430a572?q=80&w=1080',
    //   },
    // ];

    // const createdCategories = await Promise.all(
    //   mainCategories.map(async (category) => {
    //     const created = await prisma.categoriePrincipala.upsert({
    //       where: { nume: category.nume },
    //       update: {}, // No update if exists
    //       create: category,
    //     });
    //     console.log(`Created main category: ${created.nume} (ID: ${created.id})`);
    //     return created;
    //   })
    // );

    // 3. Create Subcategories
    // console.log('Creating subcategories...');

    // const subcategories = [
    //   // Telefoane și Accesorii subcategories
    //   {
    //     nume: 'Telefoane',
    //     descriere: 'Telefoane mobile de la diferite branduri.',
    //     imagine: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[0].id,
    //   },
    //   {
    //     nume: 'Huse și Carcase',
    //     descriere: 'Protecție pentru telefoanele mobile.',
    //     imagine: 'https://images.unsplash.com/photo-1563013544-08f91909c2fb?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[0].id,
    //   },
    //   {
    //     nume: 'Încărcătoare',
    //     descriere: 'Încărcătoare și cabluri pentru dispozitive mobile.',
    //     imagine: 'https://images.unsplash.com/photo-1583863788434-e62645a1ae86?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[0].id,
    //   },

    //   // Laptopuri și Computere subcategories
    //   {
    //     nume: 'Laptopuri',
    //     descriere: 'Laptopuri pentru diverse necesități.',
    //     imagine: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[1].id,
    //   },
    //   {
    //     nume: 'Computere Desktop',
    //     descriere: 'Computere de birou și PC-uri all-in-one.',
    //     imagine: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[1].id,
    //   },
    //   {
    //     nume: 'Tastaturi',
    //     descriere: 'Tastaturi mecanice și membrane.',
    //     imagine: 'https://images.unsplash.com/photo-1561112078-7d24e04c3407?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[1].id,
    //   },

    //   // Audio și Video subcategories
    //   {
    //     nume: 'Căști',
    //     descriere: 'Căști cu și fără fir pentru muzică și apeluri.',
    //     imagine: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[2].id,
    //   },
    //   {
    //     nume: 'Boxe',
    //     descriere: 'Boxe portabile și de birou.',
    //     imagine: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[2].id,
    //   },
    //   {
    //     nume: 'Televizoare',
    //     descriere: 'Televizoare LED, OLED și Smart TV.',
    //     imagine: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[2].id,
    //   },

    //   // Gadget-uri și Wearables subcategories
    //   {
    //     nume: 'Smartwatch-uri',
    //     descriere: 'Ceasuri inteligente pentru fitness și notificări.',
    //     imagine: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[3].id,
    //   },
    //   {
    //     nume: 'Brățări Fitness',
    //     descriere: 'Brățări pentru monitorizarea activității fizice.',
    //     imagine: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[3].id,
    //   },
    //   {
    //     nume: 'Drone',
    //     descriere: 'Drone pentru fotografie și divertisment.',
    //     imagine: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1080',
    //     categoriePrincipalaId: createdCategories[3].id,
    //   },
    // ];

    // const createdSubcategories = await Promise.all(
    //   subcategories.map(async (subcategory) => {
    //     // Check if subcategory already exists
    //     const existing = await prisma.subcategorie.findFirst({
    //       where: {
    //         nume: subcategory.nume,
    //         categoriePrincipalaId: subcategory.categoriePrincipalaId,
    //       },
    //     });

    //     if (existing) {
    //       console.log(`Subcategory already exists: ${subcategory.nume}`);
    //       return existing;
    //     }

    //     const created = await prisma.subcategorie.create({
    //       data: subcategory,
    //     });
    //     console.log(`Created subcategory: ${created.nume} (ID: ${created.id})`);
    //     return created;
    //   })
    // );

    // 4. Create Products
    console.log('Creating products...');

    // Define products - keep your existing products and add the new ones below
    const productsData = [
      // Keep your existing products here...

      // Additional products (15 new products)

      // Smartphones - subcategory 1
      {
        cod: 'SMG-S23U',
        nume: 'Samsung Galaxy S23 Ultra',
        descriere: 'Samsung Galaxy S23 Ultra cu procesor Snapdragon 8 Gen 2, cameră de 200MP și S Pen încorporat.',
        pret: 1199.99,
        pretRedus: 1099.99,
        stoc: 18,
        stare: 'NOU',
        culoare: 'Phantom Black',
        dimensiuni: JSON.stringify({
          lungime: 163.4,
          latime: 78.1,
          inaltime: 8.9
        }),
        greutate: 233,
        imagini: [
          'https://images.unsplash.com/photo-1678911820864-e5fcb73eb5a2?q=80&w=1080',
          'https://images.unsplash.com/photo-1678911813713-f27a9d80db7b?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'Android 13',
            'Procesor': 'Snapdragon 8 Gen 2',
            'RAM': '12GB'
          },
          'Display': {
            'Diagonala': '6.8 inch',
            'Rezolutie': '3088 x 1440 pixeli',
            'Tip': 'Dynamic AMOLED 2X'
          },
          'Camera': {
            'Principala': '200MP + 12MP + 10MP + 10MP',
            'Selfie': '12MP'
          }
        }),
        subcategorieId: '1', // Telefoane subcategory
      },

      {
        cod: 'XIA-14PRO',
        nume: 'Xiaomi 14 Pro',
        descriere: 'Xiaomi 14 Pro cu procesor Snapdragon 8 Gen 3, cameră Leica și încărcare rapidă de 120W.',
        pret: 899.99,
        pretRedus: 849.99,
        stoc: 22,
        stare: 'NOU',
        culoare: 'Titanium Gray',
        dimensiuni: JSON.stringify({
          lungime: 161.4,
          latime: 74.6,
          inaltime: 8.5
        }),
        greutate: 210,
        imagini: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1080',
          'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'Android 14',
            'Procesor': 'Snapdragon 8 Gen 3',
            'RAM': '16GB'
          },
          'Display': {
            'Diagonala': '6.7 inch',
            'Rezolutie': '3200 x 1440 pixeli',
            'Tip': 'LTPO OLED'
          },
          'Camera': {
            'Principala': '50MP + 50MP + 50MP',
            'Selfie': '32MP'
          }
        }),
        subcategorieId: '1', // Telefoane subcategory
      },

      {
        cod: 'APPL-IPRO17',
        nume: 'Apple iPhone 15 Pro Max',
        descriere: 'iPhone 15 Pro Max cu chip A17 Pro, cameră de 48MP cu zoom optic 5x și design din titan.',
        pret: 1399.99,
        pretRedus: 1299.99,
        stoc: 15,
        stare: 'NOU',
        culoare: 'Natural Titanium',
        dimensiuni: JSON.stringify({
          lungime: 159.9,
          latime: 76.7,
          inaltime: 8.25
        }),
        greutate: 221,
        imagini: [
          'https://images.unsplash.com/photo-1695048133142-1a20484bce71?q=80&w=1080',
          'https://images.unsplash.com/photo-1696419892332-2609365e38c9?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'iOS 17',
            'Procesor': 'A17 Pro',
            'RAM': '8GB'
          },
          'Display': {
            'Diagonala': '6.7 inch',
            'Rezolutie': '2796 x 1290 pixeli',
            'Tip': 'Super Retina XDR OLED'
          },
          'Camera': {
            'Principala': '48MP + 12MP + 12MP',
            'Selfie': '12MP TrueDepth'
          }
        }),
        subcategorieId: '1', // Telefoane subcategory
      },

      // Phone Cases - subcategory 2
      {
        cod: 'PHONE-FLEX',
        nume: 'Husă flexibilă universală pentru telefoane',
        descriere: 'Husă flexibilă cu protecție ridicată la impact, compatibilă cu multiple modele de telefoane de 6-7 inch.',
        pret: 29.99,
        pretRedus: 19.99,
        stoc: 50,
        stare: 'NOU',
        culoare: 'Transparent',
        dimensiuni: JSON.stringify({
          lungime: 160,
          latime: 80,
          inaltime: 10
        }),
        greutate: 0.045,
        imagini: [
          'https://images.unsplash.com/photo-1603313011104-530e91b18033?q=80&w=1080',
          'https://images.unsplash.com/photo-1601593346740-925612772ded?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Material': 'TPU premium',
            'Compatibilitate': 'Multiple modele 6-7 inch',
            'Caracteristici': 'Anti-șoc, Anti-zgârieturi'
          },
          'Protecție': {
            'Rezistență la șocuri': 'Da, Military Grade',
            'Margini ridicate': 'Da, pentru protecția camerei și ecranului'
          }
        }),
        subcategorieId: '2', // Huse și Carcase subcategory
      },

      {
        cod: 'HUSA-MAG15',
        nume: 'Husă cu MagSafe pentru iPhone 15 Series',
        descriere: 'Husă originală cu suport MagSafe, fabricată din silicon premium și cu interior din microfibră.',
        pret: 49.99,
        pretRedus: 39.99,
        stoc: 30,
        stare: 'NOU',
        culoare: 'Midnight Blue',
        dimensiuni: JSON.stringify({
          lungime: 160,
          latime: 78,
          inaltime: 11
        }),
        greutate: 0.06,
        imagini: [
          'https://images.unsplash.com/photo-1586254116161-7a5b67595636?q=80&w=1080',
          'https://images.unsplash.com/photo-1541332246502-f5f6632a2ada?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Material': 'Silicon premium',
            'Compatibilitate': 'iPhone 15, 15 Plus, 15 Pro, 15 Pro Max',
            'Caracteristici': 'MagSafe, interior microfibră'
          },
          'Protecție': {
            'Rezistență la șocuri': 'Da',
            'Rezistență la zgârieturi': 'Da'
          }
        }),
        subcategorieId: '2', // Huse și Carcase subcategory
      },

      // Chargers - subcategory 3
      {
        cod: 'UGREEN-GAN200',
        nume: 'UGREEN Nexode 200W',
        descriere: 'Încărcător GaN UGREEN cu 6 porturi, putere totală 200W, suportă încărcarea simultană a mai multor dispozitive.',
        pret: 129.99,
        pretRedus: 109.99,
        stoc: 20,
        stare: 'NOU',
        culoare: 'Black',
        dimensiuni: JSON.stringify({
          lungime: 10.5,
          latime: 8.3,
          inaltime: 3.3
        }),
        greutate: 0.495,
        imagini: [
          'https://images.unsplash.com/photo-1662947089648-320d9b4132e8?q=80&w=1080',
          'https://images.unsplash.com/photo-1583863788434-e62645a1ae86?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tehnologie': 'GaN III',
            'Putere totală': '200W'
          },
          'Porturi': {
            'USB-C': '4 (100W, 65W, 45W, 30W)',
            'USB-A': '2 (22.5W fiecare)'
          },
          'Protecție': 'Supraîncălzire, supracurent, supratensiune'
        }),
        subcategorieId: '3', // Încărcătoare subcategory
      },

      // Laptops - subcategory 4
      {
        cod: 'MACBOOK-M3PRO',
        nume: 'Apple MacBook Pro 16" M3 Pro',
        descriere: 'MacBook Pro 16" cu chip M3 Pro, 32GB RAM, 1TB SSD și display Liquid Retina XDR.',
        pret: 2999.99,
        pretRedus: 2899.99,
        stoc: 12,
        stare: 'NOU',
        culoare: 'Space Black',
        dimensiuni: JSON.stringify({
          lungime: 355.7,
          latime: 248.1,
          inaltime: 16.8
        }),
        greutate: 2.16,
        imagini: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1080',
          'https://images.unsplash.com/photo-1504707748692-419802cf939d?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Procesor': 'Apple M3 Pro (12-core CPU, 18-core GPU)',
            'RAM': '32GB memorie unificată',
            'Stocare': 'SSD 1TB'
          },
          'Display': {
            'Tip': 'Liquid Retina XDR',
            'Diagonala': '16.2 inch',
            'Rezoluție': '3456 x 2234 pixeli',
            'Luminozitate': '1000 nits (1600 nits peak HDR)'
          },
          'Conectivitate': {
            'Porturi': '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3, Jack 3.5mm',
            'Wireless': 'WiFi 6E, Bluetooth 5.3'
          },
          'Autonomie': 'Până la 22 ore'
        }),
        subcategorieId: '4', // Laptopuri subcategory
      },

      {
        cod: 'FRAMEWORK-13',
        nume: 'Framework Laptop 13 (AMD)',
        descriere: 'Laptop modular Framework 13" cu procesor AMD Ryzen 7 7840U, porturi interschimbabile și design ușor de reparat.',
        pret: 1299.99,
        pretRedus: 1199.99,
        stoc: 10,
        stare: 'NOU',
        culoare: 'Silver',
        dimensiuni: JSON.stringify({
          lungime: 296.5,
          latime: 229.0,
          inaltime: 15.9
        }),
        greutate: 1.35,
        imagini: [
          'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?q=80&w=1080',
          'https://images.unsplash.com/photo-1625842268922-508df2737635?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Procesor': 'AMD Ryzen 7 7840U',
            'RAM': '16GB DDR5 (upgradabil la 64GB)',
            'Stocare': 'SSD 512GB (upgradabil)'
          },
          'Display': {
            'Diagonala': '13.5 inch',
            'Rezoluție': '2256 x 1504 pixeli',
            'Aspect': '3:2'
          },
          'Modularitate': {
            'Porturi': 'Expansiuni interschimbabile',
            'Reparabilitate': 'Scor iFixit 10/10',
            'Upgrade': 'CPU, RAM, Stocare, Baterie, Display'
          }
        }),
        subcategorieId: '4', // Laptopuri subcategory
      },

      // Desktop Computers - subcategory 5
      {
        cod: 'MAC-MINI-M2',
        nume: 'Mac Mini M2 Pro',
        descriere: 'Mac Mini cu chip M2 Pro, 16GB RAM, 512GB SSD și conectivitate extinsă, ideal pentru utilizare desktop.',
        pret: 1299.99,
        pretRedus: 1199.99,
        stoc: 18,
        stare: 'NOU',
        culoare: 'Silver',
        dimensiuni: JSON.stringify({
          lungime: 19.7,
          latime: 19.7,
          inaltime: 3.6
        }),
        greutate: 1.28,
        imagini: [
          'https://images.unsplash.com/photo-1661862173451-43845469b64e?q=80&w=1080',
          'https://images.unsplash.com/photo-1570654335504-9b74a3d2d105?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Procesor': 'Apple M2 Pro (10-core)',
            'RAM': '16GB memorie unificată',
            'Stocare': 'SSD 512GB'
          },
          'Conectivitate': {
            'Thunderbolt': '4 porturi',
            'HDMI': 'Da, 2.0',
            'Ethernet': 'Gigabit (upgradabil la 10GbE)',
            'USB-A': '2 porturi',
            'Audio': 'Jack 3.5mm'
          },
          'Video': {
            'Suport monitoare': 'Până la 3 display-uri',
            'Rezoluție maximă': '8K prin Thunderbolt, 4K prin HDMI'
          }
        }),
        subcategorieId: '5', // Computere Desktop subcategory
      },

      // Keyboards - subcategory 6
      {
        cod: 'LOGITECH-MX',
        nume: 'Logitech MX Mechanical Mini',
        descriere: 'Tastatură mecanică wireless Logitech compactă, cu iluminare inteligentă și autonomie extinsă.',
        pret: 149.99,
        pretRedus: 129.99,
        stoc: 25,
        stare: 'NOU',
        culoare: 'Graphite',
        dimensiuni: JSON.stringify({
          lungime: 312,
          latime: 131,
          inaltime: 26.1
        }),
        greutate: 0.61,
        imagini: [
          'https://images.unsplash.com/photo-1664575599736-c5197c684128?q=80&w=1080',
          'https://images.unsplash.com/photo-1661432539869-7e13de86eb9c?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip': 'Mecanică low-profile',
            'Layout': 'TKL (75%)',
            'Conectivitate': 'Bluetooth, USB-C, Logi Bolt'
          },
          'Caracteristici': {
            'Switch-uri': 'Tactile Quiet',
            'Iluminare': 'LED 6 zone dinamice',
            'Multi-device': 'Conectare la 3 dispozitive'
          },
          'Autonomie': 'Până la 15 zile (10 luni fără iluminare)'
        }),
        subcategorieId: '6', // Tastaturi subcategory
      },

      // Headphones - subcategory 7
      {
        cod: 'SONY-WH1000XM5',
        nume: 'Sony WH-1000XM5',
        descriere: 'Căști premium Sony cu anulare activă a zgomotului, 8 microfoane și procesare AI de sunet.',
        pret: 399.99,
        pretRedus: 349.99,
        stoc: 30,
        stare: 'NOU',
        culoare: 'Silver',
        dimensiuni: JSON.stringify({
          lungime: 190,
          latime: 167,
          inaltime: 80
        }),
        greutate: 0.25,
        imagini: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1080',
          'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip': 'Over-ear',
            'Conectivitate': 'Bluetooth 5.2, Jack 3.5mm',
            'Codec': 'LDAC, AAC, SBC'
          },
          'Audio': {
            'Driver': '30mm, carbon fiber',
            'ANC': 'HD QN1, 8 microfoane',
            'Suport': 'Hi-Res Audio, 360 Reality Audio'
          },
          'Autonomie': 'Până la 30 ore cu ANC',
          'Încărcare': 'USB-C, 3 minute pentru 3 ore redare'
        }),
        subcategorieId: '7', // Căști subcategory
      },

      // Speakers - subcategory 8
      {
        cod: 'JBL-CHARGE5',
        nume: 'JBL Charge 5',
        descriere: 'Boxă portabilă JBL Charge 5 cu sunet puternic, autonomie de 20 ore și funcție powerbank.',
        pret: 179.99,
        pretRedus: 149.99,
        stoc: 40,
        stare: 'NOU',
        culoare: 'Blue',
        dimensiuni: JSON.stringify({
          lungime: 223,
          latime: 97,
          inaltime: 94
        }),
        greutate: 0.96,
        imagini: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1080',
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Putere': '40W RMS',
            'Conectivitate': 'Bluetooth 5.1',
            'Rezistență': 'IP67 (apă și praf)'
          },
          'Audio': {
            'Configurație': 'Difuzor racetrack și tweeter separat',
            'Radiator pasiv': 'Dual',
            'PartyBoost': 'Da'
          },
          'Baterie': {
            'Capacitate': '7500 mAh',
            'Autonomie': 'Până la 20 ore',
            'Powerbank': 'Da, încărcare USB'
          }
        }),
        subcategorieId: '8', // Boxe subcategory
      },

      // TVs - subcategory 9
      {
        cod: 'SONY-BRAVIA-XR65',
        nume: 'Sony BRAVIA XR-65A95L',
        descriere: 'Televizor Sony BRAVIA XR-65A95L OLED cu Cognitive Processor XR, QD-OLED și Google TV.',
        pret: 3499.99,
        pretRedus: 3299.99,
        stoc: 8,
        stare: 'NOU',
        culoare: 'Black',
        dimensiuni: JSON.stringify({
          lungime: 1448,
          latime: 836,
          inaltime: 53
        }),
        greutate: 23.3,
        imagini: [
          'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1080',
          'https://images.unsplash.com/photo-1467293622093-9f15c96be70f?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip ecran': 'QD-OLED',
            'Diagonala': '65 inch (165 cm)',
            'Rezoluție': '4K UHD (3840 x 2160)'
          },
          'Imagine': {
            'Procesor': 'Cognitive Processor XR',
            'Luminozitate': 'XR OLED Contrast Pro',
            'Motion': 'XR Motion Clarity'
          },
          'Smart TV': {
            'Sistem de operare': 'Google TV',
            'Asistent vocal': 'Google Assistant, Amazon Alexa',
            'Aplicații': 'Netflix, Amazon Prime, Disney+, YouTube, etc'
          },
          'Audio': {
            'Sistem': 'Acoustic Surface Audio+',
            'Putere': '60W',
            'Dolby Atmos': 'Da'
          }
        }),
        subcategorieId: '9', // Televizoare subcategory
      },

      // Smartwatches - subcategory 10
      {
        cod: 'GARMIN-EPIX-PRO',
        nume: 'Garmin Epix Pro (Gen 2)',
        descriere: 'Smartwatch Garmin Epix Pro cu ecran AMOLED, cartografiere avansată, multisport și funcții de sănătate premium.',
        pret: 899.99,
        pretRedus: 849.99,
        stoc: 15,
        stare: 'NOU',
        culoare: 'Slate Gray',
        dimensiuni: JSON.stringify({
          diametru: 47,
          grosime: 14.5
        }),
        greutate: 0.076,
        imagini: [
          'https://images.unsplash.com/photo-1600997714665-9dc1ae44f2e9?q=80&w=1080',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Display': 'AMOLED 1.3" (416 x 416)',
            'GPS': 'Multi-band, multisistem',
            'Conectivitate': 'Bluetooth, ANT+, WiFi'
          },
          'Senzori': {
            'Ritm cardiac': 'Gen 4 Elevate',
            'Pulse Ox': 'Da, aclimatizare la altitudine',
            'Altimetru': 'Da, barometric',
            'Lanternă LED': 'Da, integrată'
          },
          'Funcții': {
            'Sport': '30+ profiluri de activități',
            'Navigare': 'Hărți TopoActive, schi, golf',
            'Training': 'Ghid antrenamente, Garmin Coach',
            'Plăți': 'Garmin Pay'
          },
          'Autonomie': {
            'Smartwatch': 'Până la 16 zile',
            'GPS': 'Până la 42 ore'
          }
        }),
        subcategorieId: '10', // Smartwatch-uri subcategory
      },

      // Drones - subcategory 12
      {
        cod: 'MAVIC-3-PRO',
        nume: 'DJI Mavic 3 Pro',
        descriere: 'Dronă DJI Mavic 3 Pro cu sistem triplu de camere Hasselblad, zoom optic 7x și autonomie de zbor de 43 minute.',
        pret: 2499.99,
        pretRedus: 2299.99,
        stoc: 7,
        stare: 'NOU',
        culoare: 'Dark Gray',
        dimensiuni: JSON.stringify({
          lungime: 221,
          latime: 96.3,
          inaltime: 90.3
        }),
        greutate: 0.958,
        imagini: [
          'https://images.unsplash.com/photo-1591401903367-6e851effdc18?q=80&w=1080',
          'https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Autonomie zbor': 'Până la 43 minute',
            'Greutate': '958g',
            'Transmisie': 'O3+, 15km HD video'
          },
          'Camere': {
            'Principal': 'Hasselblad 4/3 CMOS, 20MP',
            'Telephoto': '70mm (7x zoom optic)',
            'Wide': '24mm wide-angle',
            'Video': '5.1K/50fps, 4K/120fps, ProRes 422 HQ'
          },
          'Inteligență': {
            'Evitare obstacole': 'Omnidirecțională APAS 5.0',
            'Urmărire': 'ActiveTrack 5.0',
            'Fotografiere': 'MasterShots, QuickShots, Panorama'
          }
        }),
        subcategorieId: '12', // Drone subcategory
      },
    ];

    for (const productData of productsData) {
      // Check if product already exists
      const existing = await prisma.produs.findUnique({
        where: { cod: productData.cod },
      });

      if (existing) {
        console.log(`Product already exists: ${productData.nume} (${productData.cod})`);
        continue;
      }

      const created = await prisma.produs.create({
        data: productData,
      });
      console.log(`Created product: ${created.nume} (ID: ${created.id})`);
    }

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error during database seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

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
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin101!', 10);


    console.log(`Created admin user with ID: ${adminUser.id}`);

    // 2. Create Main Categories
    console.log('Creating main categories...');

    const mainCategories = [
      {
        nume: 'Telefoane și Accesorii',
        descriere: 'Telefoane mobile, huse, încărcătoare și alte accesorii pentru telefoane.',
        imagine: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1080',
      },
      {
        nume: 'Laptopuri și Computere',
        descriere: 'Laptopuri, computere de birou, componente și periferice.',
        imagine: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1080',
      },
      {
        nume: 'Audio și Video',
        descriere: 'Căști, boxe, televizoare și echipamente de sunet.',
        imagine: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1080',
      },
      {
        nume: 'Gadget-uri și Wearables',
        descriere: 'Ceasuri inteligente, brățări fitness și alte dispozitive purtabile.',
        imagine: 'https://images.unsplash.com/photo-1519698363197-19a66430a572?q=80&w=1080',
      },
    ];

    const createdCategories = await Promise.all(
      mainCategories.map(async (category) => {
        const created = await prisma.categoriePrincipala.upsert({
          where: { nume: category.nume },
          update: {}, // No update if exists
          create: category,
        });
        console.log(`Created main category: ${created.nume} (ID: ${created.id})`);
        return created;
      })
    );

    // 3. Create Subcategories
    console.log('Creating subcategories...');

    const subcategories = [
      // Telefoane și Accesorii subcategories
      {
        nume: 'Telefoane',
        descriere: 'Telefoane mobile de la diferite branduri.',
        imagine: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1080',
        categoriePrincipalaId: createdCategories[0].id,
      },
      {
        nume: 'Huse și Carcase',
        descriere: 'Protecție pentru telefoanele mobile.',
        imagine: 'https://images.unsplash.com/photo-1563013544-08f91909c2fb?q=80&w=1080',
        categoriePrincipalaId: createdCategories[0].id,
      },
      {
        nume: 'Încărcătoare',
        descriere: 'Încărcătoare și cabluri pentru dispozitive mobile.',
        imagine: 'https://images.unsplash.com/photo-1583863788434-e62645a1ae86?q=80&w=1080',
        categoriePrincipalaId: createdCategories[0].id,
      },

      // Laptopuri și Computere subcategories
      {
        nume: 'Laptopuri',
        descriere: 'Laptopuri pentru diverse necesități.',
        imagine: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1080',
        categoriePrincipalaId: createdCategories[1].id,
      },
      {
        nume: 'Computere Desktop',
        descriere: 'Computere de birou și PC-uri all-in-one.',
        imagine: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1080',
        categoriePrincipalaId: createdCategories[1].id,
      },
      {
        nume: 'Tastaturi',
        descriere: 'Tastaturi mecanice și membrane.',
        imagine: 'https://images.unsplash.com/photo-1561112078-7d24e04c3407?q=80&w=1080',
        categoriePrincipalaId: createdCategories[1].id,
      },

      // Audio și Video subcategories
      {
        nume: 'Căști',
        descriere: 'Căști cu și fără fir pentru muzică și apeluri.',
        imagine: 'https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1080',
        categoriePrincipalaId: createdCategories[2].id,
      },
      {
        nume: 'Boxe',
        descriere: 'Boxe portabile și de birou.',
        imagine: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1080',
        categoriePrincipalaId: createdCategories[2].id,
      },
      {
        nume: 'Televizoare',
        descriere: 'Televizoare LED, OLED și Smart TV.',
        imagine: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1080',
        categoriePrincipalaId: createdCategories[2].id,
      },

      // Gadget-uri și Wearables subcategories
      {
        nume: 'Smartwatch-uri',
        descriere: 'Ceasuri inteligente pentru fitness și notificări.',
        imagine: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1080',
        categoriePrincipalaId: createdCategories[3].id,
      },
      {
        nume: 'Brățări Fitness',
        descriere: 'Brățări pentru monitorizarea activității fizice.',
        imagine: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?q=80&w=1080',
        categoriePrincipalaId: createdCategories[3].id,
      },
      {
        nume: 'Drone',
        descriere: 'Drone pentru fotografie și divertisment.',
        imagine: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1080',
        categoriePrincipalaId: createdCategories[3].id,
      },
    ];

    const createdSubcategories = await Promise.all(
      subcategories.map(async (subcategory) => {
        // Check if subcategory already exists
        const existing = await prisma.subcategorie.findFirst({
          where: {
            nume: subcategory.nume,
            categoriePrincipalaId: subcategory.categoriePrincipalaId,
          },
        });

        if (existing) {
          console.log(`Subcategory already exists: ${subcategory.nume}`);
          return existing;
        }

        const created = await prisma.subcategorie.create({
          data: subcategory,
        });
        console.log(`Created subcategory: ${created.nume} (ID: ${created.id})`);
        return created;
      })
    );

    // 4. Create Products
    console.log('Creating products...');

    // Define products
    const productsData = [
      // Telefon
      {
        cod: 'IPH14PRO',
        nume: 'iPhone 14 Pro',
        descriere: 'iPhone 14 Pro cu capacitate de stocare de 256GB, ecran Super Retina XDR și cameră triplă de 48MP.',
        pret: 1299.99,
        pretRedus: 1199.99,
        stoc: 15,
        stare: 'NOU',
        culoare: 'Space Black',
        dimensiuni: JSON.stringify({
          lungime: 147.5,
          latime: 71.5,
          inaltime: 7.85
        }),
        greutate: 206,
        imagini: [
          'https://images.unsplash.com/photo-1663418789254-b8650f5c3e6f?q=80&w=1080',
          'https://images.unsplash.com/photo-1665776785273-2c3c6ceaac5f?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'iOS 16',
            'Procesor': 'Apple A16 Bionic',
            'RAM': '6GB'
          },
          'Display': {
            'Diagonala': '6.1 inch',
            'Rezolutie': '2556 x 1179 pixeli',
            'Tip': 'Super Retina XDR OLED'
          },
          'Memorie': {
            'Capacitate': '256GB',
            'Card SD': 'Nu'
          }
        }),
        subcategorieId: createdSubcategories[0].id, // Telefoane
      },

      // Laptop
      {
        cod: 'MBP16M2',
        nume: 'MacBook Pro 16" M2 Pro',
        descriere: 'MacBook Pro 16 inch cu procesor M2 Pro, 16GB RAM, 512GB SSD și ecran Liquid Retina XDR.',
        pret: 2499.99,
        stoc: 8,
        stare: 'NOU',
        culoare: 'Space Gray',
        dimensiuni: JSON.stringify({
          lungime: 355.7,
          latime: 248.1,
          inaltime: 16.8
        }),
        greutate: 2.15,
        imagini: [
          'https://images.unsplash.com/photo-1617499736404-b0f81302ad3e?q=80&w=1080',
          'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'macOS Ventura',
            'Procesor': 'Apple M2 Pro',
            'RAM': '16GB'
          },
          'Display': {
            'Diagonala': '16.2 inch',
            'Rezolutie': '3456 x 2234 pixeli',
            'Tip': 'Liquid Retina XDR'
          },
          'Memorie': {
            'Tip stocare': 'SSD',
            'Capacitate': '512GB'
          }
        }),
        subcategorieId: createdSubcategories[3].id, // Laptopuri
      },

      // Căști
      {
        cod: 'SNYWH1000',
        nume: 'Sony WH-1000XM5',
        descriere: 'Căști wireless Sony WH-1000XM5 cu anulare a zgomotului, autonomie de 30 de ore și suport pentru Hi-Res Audio.',
        pret: 399.99,
        pretRedus: 349.99,
        stoc: 20,
        stare: 'NOU',
        culoare: 'Black',
        dimensiuni: JSON.stringify({
          lungime: 250,
          latime: 203,
          inaltime: 86
        }),
        greutate: 0.25,
        imagini: [
          'https://images.unsplash.com/photo-1626761191814-a9dc9efd085c?q=80&w=1080',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip': 'Over-ear',
            'Conectivitate': 'Bluetooth 5.2',
            'Autonomie': '30 ore'
          },
          'Audio': {
            'Anularea zgomotului': 'Da',
            'Răspuns în frecvență': '4Hz-40kHz',
            'Microfon': 'Da'
          },
          'Altele': {
            'Greutate': '250g',
            'Fără fir': 'Da'
          }
        }),
        subcategorieId: createdSubcategories[6].id, // Căști
      },

      // Smartwatch
      {
        cod: 'APLWTCH8',
        nume: 'Apple Watch Series 8',
        descriere: 'Apple Watch Series 8 cu GPS, carcasă din aluminiu de 45mm, rezistență la apă și senzor de temperatură.',
        pret: 429.99,
        stoc: 12,
        stare: 'NOU',
        culoare: 'Midnight',
        dimensiuni: JSON.stringify({
          lungime: 45,
          latime: 38,
          inaltime: 10.7
        }),
        greutate: 0.039,
        imagini: [
          'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=1080',
          'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Sistem de operare': 'watchOS 9',
            'Compatibilitate': 'iOS',
            'GPS': 'Da'
          },
          'Display': {
            'Tip': 'LTPO OLED',
            'Dimensiune': '45mm',
            'Always-on': 'Da'
          },
          'Senzori': {
            'Ritm cardiac': 'Da',
            'ECG': 'Da',
            'Oxigen în sânge': 'Da',
            'Temperatură': 'Da'
          }
        }),
        subcategorieId: createdSubcategories[9].id, // Smartwatch-uri
      },

      // Boxe
      {
        cod: 'JBLFLP6',
        nume: 'JBL Flip 6',
        descriere: 'Boxă portabilă JBL Flip 6 cu Bluetooth, rezistență la apă IPX7 și autonomie de 12 ore.',
        pret: 129.99,
        pretRedus: 99.99,
        stoc: 25,
        stare: 'NOU',
        culoare: 'Blue',
        dimensiuni: JSON.stringify({
          lungime: 178,
          latime: 68,
          inaltime: 72
        }),
        greutate: 0.55,
        imagini: [
          'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=1080',
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip': 'Portabilă',
            'Conectivitate': 'Bluetooth 5.1',
            'Autonomie': '12 ore'
          },
          'Audio': {
            'Putere': '20W RMS',
            'Răspuns în frecvență': '65Hz-20kHz'
          },
          'Altele': {
            'Rezistență la apă': 'IPX7',
            'Încărcare': 'USB-C'
          }
        }),
        subcategorieId: createdSubcategories[7].id, // Boxe
      },

      // Tastatură
      {
        cod: 'LGMXKEYS',
        nume: 'Logitech MX Keys',
        descriere: 'Tastatură wireless Logitech MX Keys cu iluminare de fundal, conectivitate multi-dispozitiv și autonomie de până la 10 zile.',
        pret: 119.99,
        stoc: 18,
        stare: 'NOU',
        culoare: 'Graphite',
        dimensiuni: JSON.stringify({
          lungime: 433,
          latime: 132,
          inaltime: 20.5
        }),
        greutate: 0.81,
        imagini: [
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1080',
          'https://images.unsplash.com/photo-1561112384-2f5e998dad7f?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Tip': 'Wireless',
            'Layout': 'QWERTY',
            'Conectivitate': 'Bluetooth/USB Unifying'
          },
          'Caracteristici': {
            'Iluminare': 'Da',
            'Multi-device': 'Da (3 dispozitive)',
            'Autonomie': 'Până la 10 zile'
          },
          'Altele': {
            'Încărcare': 'USB-C',
            'Material': 'Aluminiu'
          }
        }),
        subcategorieId: createdSubcategories[5].id, // Tastaturi
      },

      // Husă telefon
      {
        cod: 'SPGNIPH14',
        nume: 'Spigen Tough Armor pentru iPhone 14 Pro',
        descriere: 'Husă de protecție Spigen Tough Armor pentru iPhone 14 Pro, cu absorbție a șocurilor și suport încorporat.',
        pret: 39.99,
        pretRedus: 29.99,
        stoc: 30,
        stare: 'NOU',
        culoare: 'Black',
        dimensiuni: JSON.stringify({
          lungime: 150,
          latime: 75,
          inaltime: 12
        }),
        greutate: 0.045,
        imagini: [
          'https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?q=80&w=1080',
          'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Compatibilitate': 'iPhone 14 Pro',
            'Material': 'Policarbonat + TPU',
            'Suport': 'Da'
          },
          'Protecție': {
            'Absorbție șocuri': 'Da',
            'Protecție ecran': 'Margini ridicate',
            'Certificare': 'MIL-STD 810G-516.6'
          }
        }),
        subcategorieId: createdSubcategories[1].id, // Huse și Carcase
      },

      // Dronă
      {
        cod: 'DJIMINI3',
        nume: 'DJI Mini 3 Pro',
        descriere: 'Dronă DJI Mini 3 Pro cu cameră 4K, autonomie de zbor de 34 de minute și greutate sub 249g.',
        pret: 749.99,
        pretRedus: 699.99,
        stoc: 7,
        stare: 'NOU',
        culoare: 'Light Grey',
        dimensiuni: JSON.stringify({
          lungime: 171,
          latime: 245,
          inaltime: 62
        }),
        greutate: 0.249,
        imagini: [
          'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=1080',
          'https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=1080'
        ],
        specificatii: JSON.stringify({
          'General': {
            'Greutate': '< 249g',
            'Autonomie de zbor': '34 minute',
            'Distanță de transmisie': '12 km'
          },
          'Cameră': {
            'Rezoluție': '4K/60fps',
            'Senzor': '1/1.3" CMOS',
            'Stabilizare': 'Gimbal pe 3 axe'
          },
          'Inteligență': {
            'Evitare obstacole': 'Da',
            'Urmărire subiect': 'Da',
            'Return to Home': 'Da'
          }
        }),
        subcategorieId: createdSubcategories[11].id, // Drone
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

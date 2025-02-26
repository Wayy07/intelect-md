import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin101!', 10)
  const admin = await prisma.utilizator.create({
    data: {
      email: 'ionmoisei755@gmail.com',
      nume: 'Ion Moisei',
      rol: 'ADMIN',
      tipAuth: 'EMAIL_PAROLA',
      parola: hashedPassword,
    },
  })

  console.log('Admin user created:', admin)

  // Create main categories
  const telefoane = await prisma.categoriePrincipala.create({
    data: {
      nume: 'Telefoane',
      descriere: 'Smartphone-uri și telefoane mobile',
      imagine: 'https://example.com/images/phones.jpg',
    },
  })

  const laptopuri = await prisma.categoriePrincipala.create({
    data: {
      nume: 'Laptopuri',
      descriere: 'Laptopuri și notebook-uri',
      imagine: 'https://example.com/images/laptops.jpg',
    },
  })

  // Create subcategories for phones
  const iphone = await prisma.subcategorie.create({
    data: {
      nume: 'iPhone',
      descriere: 'Telefoane Apple iPhone',
      imagine: 'https://example.com/images/iphone.jpg',
      categoriePrincipalaId: telefoane.id,
    },
  })

  const samsung = await prisma.subcategorie.create({
    data: {
      nume: 'Samsung',
      descriere: 'Telefoane Samsung Galaxy',
      imagine: 'https://example.com/images/samsung.jpg',
      categoriePrincipalaId: telefoane.id,
    },
  })

  // Create subcategories for laptops
  const gaming = await prisma.subcategorie.create({
    data: {
      nume: 'Gaming',
      descriere: 'Laptopuri pentru gaming',
      imagine: 'https://example.com/images/gaming-laptops.jpg',
      categoriePrincipalaId: laptopuri.id,
    },
  })

  // Create some products
  await prisma.produs.create({
    data: {
      cod: 'IPH15PM-256',
      nume: 'iPhone 15 Pro Max',
      descriere: 'iPhone 15 Pro Max - 256GB, Titan Natural',
      pret: 7499.99,
      pretRedus: 7299.99,
      stoc: 10,
      imagini: [
        'https://example.com/images/iphone15pm-1.jpg',
        'https://example.com/images/iphone15pm-2.jpg'
      ],
      specificatii: {
        ecran: '6.7 inch OLED',
        procesor: 'A17 Pro',
        camera: '48MP + 12MP + 12MP',
        baterie: '4422 mAh',
        stocare: '256GB'
      },
      subcategorieId: iphone.id,
    },
  })

  await prisma.produs.create({
    data: {
      cod: 'SS-S24U-512',
      nume: 'Samsung Galaxy S24 Ultra',
      descriere: 'Samsung Galaxy S24 Ultra - 512GB, Titanium Gray',
      pret: 6999.99,
      stoc: 15,
      imagini: [
        'https://example.com/images/s24u-1.jpg',
        'https://example.com/images/s24u-2.jpg'
      ],
      specificatii: {
        ecran: '6.8 inch Dynamic AMOLED 2X',
        procesor: 'Snapdragon 8 Gen 3',
        camera: '200MP + 12MP + 50MP + 10MP',
        baterie: '5000 mAh',
        stocare: '512GB'
      },
      subcategorieId: samsung.id,
    },
  })

  await prisma.produs.create({
    data: {
      cod: 'ROG-STRIX-G16',
      nume: 'ASUS ROG Strix G16',
      descriere: 'ASUS ROG Strix G16 (2024) Gaming Laptop',
      pret: 8999.99,
      pretRedus: 8499.99,
      stoc: 5,
      imagini: [
        'https://example.com/images/rog-strix-1.jpg',
        'https://example.com/images/rog-strix-2.jpg'
      ],
      specificatii: {
        ecran: '16 inch QHD+ 240Hz',
        procesor: 'Intel Core i9-14900HX',
        gpu: 'NVIDIA GeForce RTX 4090',
        ram: '32GB DDR5',
        stocare: '2TB NVMe SSD'
      },
      subcategorieId: gaming.id,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "ro" | "ru";

interface Translations {
  [key: string]: {
    ro: string;
    ru: string;
  };
}

export const translations: Translations = {
  // Header - Top bar
  workingHours: {
    ro: "Luni - Vineri: 9:00 - 18:00",
    ru: "Понедельник - Пятница: 9:00 - 18:00",
    },
    product_count_singular: {
        ro: "Produs",
        ru: "товар",
    },
    checkout_intro:{
        ro: "Introduceți informațiile de mai jos pentru a finaliza comanda",
        ru: "Введите информацию ниже для завершения заказа",
    },
  credit: {
    ro: "Intelect Credit",
    ru: "Intelect Кредит",
    },
  checkout_required_fields:{
    ro: "Câmpuri obligatorii",
    ru: "Обязательные поля",
  },
    checkout_payment: {
        ro: "Metoda de plată",
        ru: "Метод оплаты",
    },

  deliveryHeader: {
    ro: "Livrare",
    ru: "Доставка",
    },
  checkout_select_payment: {
    ro: "Selectează metoda de plată",
    ru: "Выберите метод оплаты",
  },
  searching: {
    ro: "Caută produse...",
    ru: "Поиск товаров...",
  },
  viewAllResults: {
    ro: "Vezi toate rezultatele",
    ru: "Посмотреть все результаты",
  },
  typeTwoChars: {
    ro: "Tastă minim 2 caractere pentru a căuta",
    ru: "Введите минимум 2 символа для поиска",
  },
  // Header - Main
  techStoreHeader: {
    ro: "Magazin de tehnică",
    ru: "Магазин техники",
    },
  checkout_payment_credit: {
    ro: "Credit",
    ru: "Кредит",
    },

  checkout_payment_pickup: {
    ro: "Pickup",
    ru: "Самовывоз",
    },
  checkout_payment_credit_description: {
    ro: "Credit",
    ru: "Кредит",
    },

  garantie_faq: {
    ro: "FAQ",
    ru: "FAQ",
    },
  checkout_delivery_cash_description: {
    ro: "Livrare la domiciliu",
    ru: "Доставка на дом",
    },
  checkout_delivery_cash: {
    ro: "Livrare la domiciliu",
    ru: "Доставка на дом",
    },

  garantie_coverage: {
    ro: "Garantie",
    ru: "Гарантия",
  },
  returnare_faq: {
    ro: "FAQ",
    ru: "FAQ",
    },

  cart_subtotal: {
    ro: "Subtotal",
    ru: "Сумма заказа",
    },

  checkout_first_name_placeholder: {
    ro: "Numele tău",
    ru: "Ваше имя",
    },
  checkout_last_name_placeholder: {
    ro: "Numele tău",
    ru: "Ваше имя",
    },

  checkout_email_placeholder: {
    ro: "Adresa ta de email",
    ru: "Ваш email",
    },
  checkout_phone_placeholder: {
    ro: "Numărul tău de telefon",
    ru: "Ваш номер телефона",
    },

  your_shopping_cart: {
    ro: "Cosul tău de cumpărături",
    ru: "Ваш корзина покупок",
    },

  review_your_items: {
    ro: "Revizieți articolele",
    ru: "Просмотр ваших товаров",
    },
checkout_success: {
    ro: "Comanda a fost finalizată cu succes",
    ru: "Заказ успешно завершен",
    },

  checkout_term: {
    ro: "Luni",
    ru: "Понедельник",
    },

  checkout_order_summary: {
    ro: "Sumarul comenzii",
    ru: "Сводка заказа",
    },

  cart_description: {
    ro: "Descriere",
    ru: "Описание",
    },

  checkout_monthly_payment: {
    ro: "Plată lunară",
    ru: "Ежемесячный платеж",
    },
  thank_you_for_order: {
    ro: "Vă mulțumim pentru comanda",
    ru: "Спасибо за заказ",
    },

  checkout_complete_order: {
    ro: "Finalizează comanda",
    ru: "Завершить заказ",
    },

  checkout_place_order: {
    ro: "Plasează comanda",
    ru: "Разместить заказ",
    },

  checkout_total_credit: {
    ro: "Total credit",
    ru: "Общая сумма кредита",
    },

  checkout_credit_more_info: {
    ro: "Mai multe informații despre credit",
    ru: "Больше информации о кредите",
    },
  checkout_credit_learn_more: {
    ro: "Aflați mai multe",
    ru: "Узнать больше",
    },
  checkout_credit_apply: {
    ro: "Aplică",
    ru: "Применить",
  },
  cart_shipping: {
    ro: "Livrare",
    ru: "Доставка",
  },
  checkout_notes_optional: {
    ro: "Notițe suplimentare (opționale)",
    ru: "Дополнительные заметки (необязательно)",
    },

  checkout_support_hours: {
    ro: "Luni - Vineri: 9:00 - 18:00",
    ru: "Понедельник - Пятница: 9:00 - 18:00",
    },

  checkout_help: {
    ro: "Ajutor",
    ru: "Помощь",
    },

  checkout_additional_notes: {
    ro: "Notițe suplimentare",
    ru: "Дополнительные заметки",
    },
  checkout_address_placeholder: {
    ro: "Adresa",
    ru: "Адрес",
    },
  checkout_city_placeholder: {
    ro: "Oras",
    ru: "Город",
  },
  viewAllProducts: {
    ro: "Vezi toate produsele",
    ru: "Посмотреть все товары",
  },
  returnare_exchange: {
    ro: "Returnare și schimb",
    ru: "Возврат и обмен",
  },
  returnare_process: {
    ro: "Procesul returnării",
    ru: "Процесс возврата",
  },

  catalog: {
    ro: "Catalog",
    ru: "Каталог",
  },
  searchPlaceholder: {
    ro: "Caută produse...",
    ru: "Поиск товаров...",
  },
  product_view_credit_options: {
    ro: "Credit",
    ru: "Кредиты",
  },
  livrare_calculate_shipping: {
    ro: "Calculează costul livrării",
    ru: "Рассчитать стоимость доставки",
  },
  product_available_payment_periods: {
    ro: "Perioade de plată disponibile",
    ru: "Доступные периоды оплаты",
  },
  followUs: {
    ro: "Urmărește-ne",
    ru: "Следуйте за нами",
  },
  contact_subtitle: {
    ro: "Contactați-ne pentru asistență sau pentru a afla mai multe despre produsele și serviciile noastre.",
    ru: "Свяжитесь с нами, чтобы получить помощь или узнать больше о наших продуктах и услугах.",
  },
  contact_our_location: {
    ro: "Locatia noastra",
    ru: "Наше местоположение",
  },
  contact_open_in_maps: {
    ro: "Deschide in Google Maps",
    ru: "Открыть в Google Maps",
  },
  contact_call_us: {
    ro: "Sună-ne",
    ru: "Позвоните нам",
  },
  learn_more: {
    ro: "Aflați mai multe",
    ru: "Узнать больше",
  },
  month: {
    ro: "luna",
    ru: "месяц",
  },
  product_similar_description: {
    ro: "Produse similare",
    ru: "Похожие товары",
  },
  backToTop: {
    ro: "Înapoi sus",
    ru: "Вверх",
  },
  product_credit_options: {
    ro: "Opțiuni de creditare",
    ru: "Опции кредитования",
  },
  product_financing_description: {
    ro: "Descrierea creditării",
    ru: "Описание кредитования",
  },

  laptops: {
    ro: "Laptopuri",
    ru: "Ноутбуки",
  },
  cart_clear: {
    ro: "Golire coș",
    ru: "Очистить корзину",
  },
  // Common UI elements
  seeAll: {
    ro: "Vezi toate",
    ru: "Смотреть все",
  },
  products: {
    ro: "produse",
    ru: "товары",
  },

  // Catalog Filters
  sort_by: {
    ro: "Sortează după",
    ru: "Сортировать по",
  },
  featured: {
    ro: "Recomandate",
    ru: "Рекомендуемые",
  },
  price_low_to_high: {
    ro: "Preț: crescător",
    ru: "Цена: по возрастанию",
  },
  price_high_to_low: {
    ro: "Preț: descrescător",
    ru: "Цена: по убыванию",
  },
  newest: {
    ro: "Cele mai noi",
    ru: "Новинки",
  },
  popularity: {
    ro: "Popularitate",
    ru: "Популярность",
  },
  in_stock_only: {
    ro: "Doar în stoc",
    ru: "Только в наличии",
  },
  price_range: {
    ro: "Interval de preț",
    ru: "Диапазон цен",
  },
  min: {
    ro: "Min",
    ru: "Мин",
  },
  max: {
    ro: "Max",
    ru: "Макс",
  },
  categories: {
    ro: "Categorii",
    ru: "Категории",
  },
  brands: {
    ro: "Mărci",
    ru: "Бренды",
  },
  price_price: {
    ro: "Preț",
    ru: "Цена",
  },
  clear_filters: {
    ro: "Șterge filtrele",
    ru: "Очистить фильтры",
  },
  active_filters: {
    ro: "Filtre active",
    ru: "Активные фильтры",
  },
  clear_all: {
    ro: "Șterge toate",
    ru: "Очистить все",
  },
  filters: {
    ro: "Filtre",
    ru: "Фильтры",
  },
  adjust_filters_description: {
    ro: "Ajustează filtrele pentru a găsi produsele potrivite",
    ru: "Настройте фильтры, чтобы найти подходящие товары",
  },
  apply_filters: {
    ro: "Aplică filtrele",
    ru: "Применить фильтры",
  },
  products_found: {
    ro: "produse găsite",
    ru: "найдено товаров",
  },
  all_products: {
    ro: "Toate produsele",
    ru: "Все товары",
  },
  load_more: {
    ro: "Încarcă mai multe",
    ru: "Загрузить еще",
  },
  no_products_found: {
    ro: "Nu s-au găsit produse",
    ru: "Товары не найдены",
  },
  try_adjusting_filters: {
    ro: "Încearcă să ajustezi filtrele",
    ru: "Попробуйте изменить фильтры",
  },
  clear_all_filters: {
    ro: "Șterge toate filtrele",
    ru: "Очистить все фильтры",
  },
  no_products_description: {
    ro: "Încearcă să ajustezi filtrele sau să cauți un alt produs",
    ru: "Попробуйте изменить фильтры или поискать другой товар",
  },
  view_all_products: {
    ro: "Vezi toate produsele",
    ru: "Посмотреть все товары",
  },
  search_results: {
    ro: "Rezultatele căutării",
    ru: "Результаты поиска",
  },
  in_stock: {
    ro: "În stoc",
    ru: "В наличии",
  },
  out_of_stock: {
    ro: "Stoc epuizat",
    ru: "Нет в наличии",
  },
  added_to_favorites: {
    ro: "Adăugat la favorite",
    ru: "Добавлено в избранное",
  },
  removed_from_favorites: {
    ro: "Eliminat din favorite",
    ru: "Удалено из избранного",
  },

  // User menu
  welcome: {
    ro: "Bine ați venit!",
    ru: "Добро пожаловать!",
  },
  loginToContinue: {
    ro: "Conectați-vă pentru a continua",
    ru: "Войдите, чтобы продолжить",
  },
  signInWithGoogle: {
    ro: "Continuă cu Google",
    ru: "Продолжить с Google",
  },
  signInWithFacebook: {
    ro: "Continuă cu Facebook",
    ru: "Продолжить с Facebook",
  },
  signOut: {
    ro: "Deconectare",
    ru: "Выйти",
  },
  // Categories
  subcategories: {
    ro: "Subcategorii",
    ru: "Подкатегории",
  },
  popularProducts: {
    ro: "Produse populare",
    ru: "Популярные товары",
  },
  seeDetails: {
    ro: "Vezi detalii",
    ru: "Подробнее",
  },
  // Mobile menu
  menu: {
    ro: "Meniu",
    ru: "Меню",
  },
  back: {
    ro: "Înapoi",
    ru: "Назад",
  },
  login: {
    ro: "Autentificare",
    ru: "Войти",
  },
  // Cart Related
  myCart: {
    ro: "Coșul meu",
    ru: "Моя корзина",
  },
  cartEmpty: {
    ro: "Coșul tău este gol",
    ru: "Ваша корзина пуста",
  },
  addProductsFromCatalog: {
    ro: "Adaugă produse din catalogul nostru.",
    ru: "Добавьте товары из нашего каталога.",
  },
  exploreCatalog: {
    ro: "Explorează catalogul",
    ru: "Исследуйте каталог",
  },
  productCode: {
    ro: "Cod: ",
    ru: "Код: ",
  },
  totalPrice: {
    ro: "Total",
    ru: "Итого",
  },
  viewCart: {
    ro: "Vezi coșul",
    ru: "Просмотр корзины",
  },
  checkout: {
    ro: "Finalizează",
    ru: "Оформить заказ",
  },
  completeOrder: {
    ro: "Finalizează comanda",
    ru: "Завершить заказ",
  },
  // Account Related
  myOrders: {
    ro: "Comenzile mele",
    ru: "Мои заказы",
  },
  favorites: {
    ro: "Favorite",
    ru: "Избранное",
  },
  buyInInstallments: {
    ro: "Cumpărare în rate",
    ru: "Покупка в рассрочку",
  },
  // Navigation
  home: {
    ro: "Acasă",
    ru: "Главная",
  },
  cart: {
    ro: "Coș",
    ru: "Корзина",
  },
  account: {
    ro: "Cont",
    ru: "Аккаунт",
  },
  contact: {
    ro: "Contact",
    ru: "Контакты",
  },
  // Search
  search: {
    ro: "Căutare",
    ru: "Поиск",
  },
  noProductsFound: {
    ro: "Nu au fost găsite produse",
    ru: "Товары не найдены",
  },
  // Credit
  zeroInterest: {
    ro: "0% DOBÂNDĂ",
    ru: "0% ПРОЦЕНТОВ",
  },
  monthlyPayment: {
    ro: "Plata în rate lunare",
    ru: "Ежемесячные платежи",
  },
  chooseFinancingPeriod: {
    ro: "Alege perioada de finanțare care ți se potrivește cel mai bine",
    ru: "Выберите наиболее подходящий для вас период финансирования",
  },
  totalCost: {
    ro: "Preț total:",
    ru: "Общая стоимость:",
  },
  paymentPeriod: {
    ro: "Alege perioada de plată:",
    ru: "Выберите период оплаты:",
  },
  recommended: {
    ro: "RECOMANDAT",
    ru: "РЕКОМЕНДУЕМЫЙ",
  },
  months: {
    ro: "luni",
    ru: "месяцев",
  },
  monthlyPayments: {
    ro: "Rate lunare:",
    ru: "Ежемесячные платежи:",
  },
  importantInfo: {
    ro: "Informații importante:",
    ru: "Важная информация:",
  },
  financingAvailable: {
    ro: "Finanțare disponibilă pentru produse de peste 1.000 lei",
    ru: "Финансирование доступно для товаров стоимостью более 1000 лей",
  },
  quickApproval: {
    ro: "Aprobare rapidă, în aceeași zi",
    ru: "Быстрое одобрение в тот же день",
  },
  earlyPayment: {
    ro: "Posibilitatea plății anticipate fără penalități",
    ru: "Возможность досрочного погашения без штрафов",
  },
  seeAllDetails: {
    ro: "Vezi toate detaliile",
    ru: "Посмотреть все детали",
  },
  selectOption: {
    ro: "Selectează o opțiune pentru a continua",
    ru: "Выберите опцию, чтобы продолжить",
  },
  close: {
    ro: "Închide",
    ru: "Закрыть",
  },
  // Announcements
  zeroCreditBuyNow: {
    ro: "0% Credit - Cumpără acum, plătește mai târziu",
    ru: "0% Кредит - Купите сейчас, платите позже",
  },
  installmentsUpTo: {
    ro: "Rate fără dobândă până la 36 de luni",
    ru: "Беспроцентная рассрочка до 36 месяцев",
  },
  // Share
  shareProduct: {
    ro: "Distribuie acest produs",
    ru: "Поделиться этим товаром",
  },
  share: {
    ro: "Distribuie",
    ru: "Поделиться",
  },
  copyLink: {
    ro: "Copiază link",
    ru: "Копировать ссылку",
  },
  linkCopied: {
    ro: "Link copiat!",
    ru: "Ссылка скопирована!",
  },
  // Hero Grid Section
  techForEveryone: {
    ro: "Tehnica pentru toată lumea",
    ru: "Техника для всех",
  },
  discoverProducts: {
    ro: "Descoperă o gamă largă de produse în categoriile noastre populare",
    ru: "Откройте для себя широкий ассортимент товаров в наших популярных категориях",
  },

  // Categories and Subcategories
  subcategory_laptops: {
    ro: "Laptopuri",
    ru: "Ноутбуки",
  },
  subcategory_smartphones: {
    ro: "Smartphone-uri",
    ru: "Смартфоны",
  },
  subcategory_tablets: {
    ro: "Tablete",
    ru: "Планшеты",
  },
  subcategory_tvs: {
    ro: "Televizoare",
    ru: "Телевизоры",
  },
  subcategory_headphones: {
    ro: "Căști",
    ru: "Наушники",
  },
  subcategory_smartwatches: {
    ro: "Smartwatch-uri",
    ru: "Смарт-часы",
  },
  subcategory_consoles: {
    ro: "Console",
    ru: "Игровые консоли",
  },
  subcategory_vacuums: {
    ro: "Aspiratoare",
    ru: "Пылесосы",
  },

  // Category main names
  category_computers: {
    ro: "Computere",
    ru: "Компьютеры",
  },
  category_phones: {
    ro: "Telefoane",
    ru: "Телефоны",
  },
  category_electronics: {
    ro: "Electronice",
    ru: "Электроника",
  },
  category_accessories: {
    ro: "Accesorii",
    ru: "Аксессуары",
  },
  category_gaming: {
    ro: "Gaming",
    ru: "Игры",
  },
  category_appliances: {
    ro: "Electrocasnice",
    ru: "Бытовая техника",
  },

  // Latest Products section
  newProducts: {
    ro: "Produse Noi",
    ru: "Новые товары",
  },
  discoverLatestProducts: {
    ro: "Descoperă cele mai recente produse adăugate în magazin",
    ru: "Откройте для себя самые последние товары, добавленные в магазин",
  },
  seeAllNewProducts: {
    ro: "Vezi toate produsele noi",
    ru: "Посмотреть все новые товары",
  },
  newItems: {
    ro: "Noutăți",
    ru: "Новинки",
  },
  addedToCart: {
    ro: "Adăugat în coș",
    ru: "Добавлено в корзину",
  },
  productAddedToCart: {
    ro: "Produsul a fost adăugat în coșul tău",
    ru: "Товар был добавлен в вашу корзину",
  },
  addedToFavorites: {
    ro: "Adăugat la favorite",
    ru: "Добавлено в избранное",
  },
  productAddedToFavorites: {
    ro: "Produsul a fost adăugat în lista ta de favorite",
    ru: "Товар был добавлен в ваш список избранного",
  },

  // Special Offers section
  specialOffers: {
    ro: "Oferte Speciale",
    ru: "Специальные предложения",
  },
  discoverDiscountedProducts: {
    ro: "Descoperă produsele noastre cu cele mai mari reduceri",
    ru: "Откройте для себя наши товары с самыми большими скидками",
  },
  seeAllOffers: {
    ro: "Vezi toate ofertele",
    ru: "Посмотреть все предложения",
  },
  noOffersAvailable: {
    ro: "Nu există oferte speciale disponibile momentan.",
    ru: "В настоящее время специальных предложений нет.",
  },

  // Advantages section
  ourAdvantages: {
    ro: "Avantajele Noastre",
    ru: "Наши преимущества",
  },
  whyChooseUs: {
    ro: "De ce să alegi Intelect-Market? Descoperă motivele pentru care clienții noștri ne preferă și care ne diferențiază de competiție.",
    ru: "Почему выбирают Intelect-Market? Узнайте причины, по которым наши клиенты предпочитают нас и что отличает нас от конкурентов.",
  },
  fastDelivery: {
    ro: "Livrare Rapidă",
    ru: "Быстрая доставка",
  },
  fastDeliveryDescription: {
    ro: "Livrare rapidă în toată Moldova în 24-48 de ore, direct la ușa ta.",
    ru: "Быстрая доставка по всей Молдове за 24-48 часов, прямо к вашей двери.",
  },
  qualityGuarantee: {
    ro: "Garanție de Calitate",
    ru: "Гарантия качества",
  },
  qualityGuaranteeDescription: {
    ro: "Toate produsele noastre sunt verificate și garantate pentru calitate superioară.",
    ru: "Все наши товары проверены и гарантированно высокого качества.",
  },
  easyReturn: {
    ro: "Returnare Ușoară",
    ru: "Простой возврат",
  },
  easyReturnDescription: {
    ro: "Proces simplu de returnare în 30 de zile dacă nu ești mulțumit de achiziția ta.",
    ru: "Простой процесс возврата в течение 30 дней, если вы не удовлетворены покупкой.",
  },
  satisfiedCustomers: {
    ro: "Peste 2,000 de clienți mulțumiți în ultimul an",
    ru: "Более 2,000 довольных клиентов за последний год",
  },

  // Footer

  support: {
    ro: "Suport",
    ru: "Поддержка",
  },
  delivery: {
    ro: "Livrare",
    ru: "Доставка",
  },
  installmentPurchase: {
    ro: "Cumpărare în rate",
    ru: "Покупка в рассрочку",
  },
  warranty: {
    ro: "Garanție",
    ru: "Гарантия",
  },
  return: {
    ro: "Returnare",
    ru: "Возврат",
  },
  subscribeToNewsletter: {
    ro: "Abonează-te la newsletter",
    ru: "Подпишитесь на рассылку",
  },
  receiveOffersAndNews: {
    ro: "Primește oferte și noutăți direct pe email.",
    ru: "Получайте предложения и новости прямо на электронную почту.",
  },
  yourEmail: {
    ro: "Adresa ta de email",
    ru: "Ваш электронный адрес",
  },
  subscribe: {
    ro: "Abonează-te",
    ru: "Подписаться",
  },
  phone: {
    ro: "Telefon",
    ru: "Телефон",
  },
  email: {
    ro: "Email",
    ru: "Электронная почта",
  },
  address: {
    ro: "Adresă",
    ru: "Адрес",
  },
  storeDescription: {
    ro: "Magazin online de echipamente electrice pentru casă și proiecte industriale. Livrare în toată Moldova și consultanță specializată.",
    ru: "Интернет-магазин электрооборудования для дома и промышленных проектов. Доставка по всей Молдове и специализированная консультация.",
  },
  techStore: {
    ro: "Magazin de tehnică",
    ru: "Магазин техники",
  },
  allRightsReserved: {
    ro: "Toate drepturile rezervate.",
    ru: "Все права защищены.",
  },
  // Credit Page
  creditPageTitle: {
    ro: "Cumpărare în rate",
    ru: "Покупка в рассрочку",
  },
  zeroCreditBadge: {
    ro: "0% dobândă pentru primele 6 luni",
    ru: "0% процентов на первые 6 месяцев",
  },
  creditPageDescription: {
    ro: "Achiziționează produsele dorite acum și plătește în rate lunare confortabile, fără dobândă în primele luni.",
    ru: "Приобретайте желаемые товары сейчас и платите комфортными ежемесячными платежами, без процентов в первые месяцы.",
  },
  exploreProducts: {
    ro: "Explorează produse",
    ru: "Просмотреть товары",
  },
  rateCalculator: {
    ro: "Calculator rate",
    ru: "Калькулятор платежей",
  },
  availableFinancingPeriods: {
    ro: "Perioade de finanțare disponibile",
    ru: "Доступные периоды финансирования",
  },
  chooseFinancingPeriodDescription: {
    ro: "Alege perioada care se potrivește cel mai bine nevoilor și bugetului tău, de la 4 până la 36 de luni. Toate opțiunile vin cu 0% dobândă.",
    ru: "Выберите период, который лучше всего соответствует вашим потребностям и бюджету, от 4 до 36 месяцев. Все варианты предлагаются с 0% процентной ставкой.",
  },
  monthlyRateCalculator: {
    ro: "Calculator rate",
    ru: "Калькулятор платежей",
  },
  calculateMonthlyRateDescription: {
    ro: "Calculează rata lunară în funcție de prețul produsului și perioada de finanțare.",
    ru: "Рассчитайте ежемесячный платеж в зависимости от цены товара и периода финансирования.",
  },
  samplePrice: {
    ro: "Preț exemplu",
    ru: "Пример цены",
  },
  monthlyRates: {
    ro: "Rate lunare:",
    ru: "Ежемесячные платежи:",
  },
  calculationExample: {
    ro: "Exemplu de calcul:",
    ru: "Пример расчета:",
  },
  calculationDescription: {
    ro: "Pentru un produs de {price} MDL în {months} rate, plătești {monthlyPayment} MDL/lună, fără dobândă.",
    ru: "Для товара стоимостью {price} MDL в рассрочку на {months} месяцев, вы платите {monthlyPayment} MDL/месяц, без процентов.",
  },
  howItWorks: {
    ro: "Cum funcționează?",
    ru: "Как это работает?",
  },
  howItWorksDescription: {
    ro: "Procesul de cumpărare în rate este simplu și rapid. Iată pașii pe care trebuie să îi urmezi:",
    ru: "Процесс покупки в рассрочку прост и быстр. Вот шаги, которые вам нужно выполнить:",
  },
  step1Title: {
    ro: "Alege produsele",
    ru: "Выберите товары",
  },
  step1Description: {
    ro: "Adaugă în coș produsele pe care dorești să le achiziționezi. Poți cumpăra în rate orice produs.",
    ru: "Добавьте в корзину товары, которые вы хотите приобрести. Вы можете купить в рассрочку любой товар.",
  },
  step2Title: {
    ro: "Selectează metoda de plată",
    ru: "Выберите способ оплаты",
  },
  step2Description: {
    ro: 'La finalizarea comenzii, selectează opțiunea "Plată în rate" și alege perioada dorită.',
    ru: 'При оформлении заказа выберите вариант "Оплата в рассрочку" и выберите желаемый период.',
  },
  step3Title: {
    ro: "Finalizează comanda",
    ru: "Завершите заказ",
  },
  step3Description: {
    ro: "Completează formularul cu datele necesare și aștepți aprobarea. Vei primi produsele în cel mai scurt timp.",
    ru: "Заполните форму необходимыми данными и дождитесь одобрения. Вы получите товары в кратчайшие сроки.",
  },
  frequentlyAskedQuestions: {
    ro: "Întrebări frecvente",
    ru: "Часто задаваемые вопросы",
  },
  faqDescription: {
    ro: "Găsește răspunsuri la cele mai comune întrebări despre cumpărarea în rate.",
    ru: "Найдите ответы на наиболее распространенные вопросы о покупке в рассрочку.",
  },
  faqQuestion1: {
    ro: "Ce documente îmi trebuie pentru a cumpăra în rate?",
    ru: "Какие документы мне нужны для покупки в рассрочку?",
  },
  faqAnswer1: {
    ro: "Pentru a cumpăra în rate ai nevoie de buletin sau carte de identitate, iar în unele cazuri poate fi necesar și un extras de cont bancar sau o adeverință de salariu.",
    ru: "Для покупки в рассрочку вам понадобится паспорт или удостоверение личности, а в некоторых случаях может потребоваться выписка из банковского счета или справка о зарплате.",
  },
  faqQuestion2: {
    ro: "Este într-adevăr 0% dobândă sau există costuri ascunse?",
    ru: "Действительно ли 0% процентов или есть скрытые расходы?",
  },
  faqAnswer2: {
    ro: "Da, oferim finanțare cu 0% dobândă. Nu există costuri ascunse, comisioane de administrare sau alte taxe. Plătești exact prețul produsului, împărțit în rate egale.",
    ru: "Да, мы предлагаем финансирование с 0% процентов. Нет скрытых затрат, административных сборов или других платежей. Вы платите ровно цену товара, разделенную на равные платежи.",
  },
  faqQuestion3: {
    ro: "Cât durează aprobarea cererii de finanțare?",
    ru: "Сколько времени занимает одобрение заявки на финансирование?",
  },
  faqAnswer3: {
    ro: "În majoritatea cazurilor, aprobarea se face în aceeași zi. După aprobarea finanțării, comanda ta va fi procesată și livrată conform termenilor standard.",
    ru: "В большинстве случаев одобрение происходит в тот же день. После одобрения финансирования ваш заказ будет обработан и доставлен в соответствии со стандартными условиями.",
  },
  faqQuestion4: {
    ro: "Pot plăti anticipat ratele rămase?",
    ru: "Могу ли я досрочно оплатить оставшиеся платежи?",
  },
  faqAnswer4: {
    ro: "Da, poți achita oricând suma rămasă fără penalități sau comisioane suplimentare.",
    ru: "Да, вы можете в любое время оплатить оставшуюся сумму без штрафов или дополнительных комиссий.",
  },
  faqQuestion5: {
    ro: "Există o limită minimă sau maximă pentru cumpărăturile în rate?",
    ru: "Существует ли минимальный или максимальный лимит для покупок в рассрочку?",
  },
  faqAnswer5: {
    ro: "Da, valoarea minimă pentru finanțare este de 1.000 MDL, iar valoarea maximă depinde de eligibilitatea ta financiară și poate ajunge până la 50.000 MDL.",
    ru: "Да, минимальная сумма для финансирования составляет 1.000 MDL, а максимальная сумма зависит от вашей финансовой правомочности и может достигать 50.000 MDL.",
  },
  faqQuestion6: {
    ro: "Ce se întâmplă dacă un produs cumpărat în rate se defectează?",
    ru: "Что происходит, если товар, купленный в рассрочку, ломается?",
  },
  faqAnswer6: {
    ro: "Toate produsele cumpărate în rate beneficiază de aceeași garanție și politică de retur ca produsele achitate integral. Poți solicita reparații în garanție conform politicii standard.",
    ru: "Все товары, приобретенные в рассрочку, имеют такую же гарантию и политику возврата, как и товары, оплаченные полностью. Вы можете запросить гарантийный ремонт в соответствии со стандартной политикой.",
  },
  faqQuestion7: {
    ro: "Care sunt avantajele finanțării pe 36 de luni?",
    ru: "Каковы преимущества финансирования на 36 месяцев?",
  },
  faqAnswer7: {
    ro: "Finanțarea pe 36 de luni oferă cea mai mică rată lunară, făcând produsele premium mai accesibile. Este ideală pentru achiziții de valoare mai mare, cum ar fi electrocasnice premium, sisteme complete sau echipamente profesionale. La fel ca toate celelalte opțiuni, beneficiezi de 0% dobândă pe întreaga perioadă.",
    ru: "Финансирование на 36 месяцев обеспечивает наименьший ежемесячный платеж, делая премиальные товары более доступными. Это идеально подходит для покупок большей стоимости, таких как премиальная бытовая техника, полные системы или профессиональное оборудование. Как и все другие варианты, вы получаете 0% процентов на весь период.",
  },
  readyToBuyInInstallments: {
    ro: "Gata să cumperi în rate?",
    ru: "Готовы купить в рассрочку?",
  },
  readyToBuyDescription: {
    ro: "Explorează catalogul nostru de produse și alege opțiunea de plată în rate la finalizarea comenzii.",
    ru: "Изучите наш каталог товаров и выберите вариант оплаты в рассрочку при оформлении заказа.",
  },
  // Livrare Page Translations
  livrare_page_title: {
    ro: "Livrare rapidă și sigură",
    ru: "Быстрая и безопасная доставка",
  },
  livrare_page_description: {
    ro: "Comandă astăzi și primește produsele tale în cel mai scurt timp posibil, direct la ușa ta.",
    ru: "Закажите сегодня и получите свои товары в кратчайшие сроки прямо у вашей двери.",
  },
  livrare_breadcrumb_home: {
    ro: "Acasă",
    ru: "Главная",
  },
  livrare_breadcrumb_delivery: {
    ro: "Livrare",
    ru: "Доставка",
  },
  livrare_badge: {
    ro: "Livrare în toată Moldova",
    ru: "Доставка по всей Молдове",
  },
  livrare_explore_products: {
    ro: "Explorează produse",
    ru: "Исследовать товары",
  },
  livrare_delivery_calculator: {
    ro: "Calculator livrare",
    ru: "Калькулятор доставки",
  },
  livrare_delivery_options: {
    ro: "Opțiuni de livrare",
    ru: "Варианты доставки",
  },
  livrare_standard_delivery: {
    ro: "Livrare Standard",
    ru: "Стандартная доставка",
  },
  livrare_free: {
    ro: "GRATUIT",
    ru: "БЕСПЛАТНО",
  },
  livrare_delivery_time: {
    ro: "Termen de livrare:",
    ru: "Срок доставки:",
  },
  livrare_chisinau: {
    ro: "Chișinău: 1-2 zile lucrătoare",
    ru: "Кишинёв: 1-2 рабочих дня",
  },
  livrare_urban_areas: {
    ro: "Alte localități urbane: 2-4 zile lucrătoare",
    ru: "Другие городские районы: 2-4 рабочих дня",
  },
  livrare_rural_areas: {
    ro: "Zone rurale: 3-5 zile lucrătoare",
    ru: "Сельская местность: 3-5 рабочих дней",
  },
  livrare_details: {
    ro: "Detalii:",
    ru: "Детали:",
  },
  livrare_standard_description: {
    ro: "Livrarea standard este gratuită pentru toate comenzile, indiferent de valoarea acestora sau de localitatea de livrare.",
    ru: "Стандартная доставка бесплатна для всех заказов, независимо от их стоимости или места доставки.",
  },
  livrare_calculator_title: {
    ro: "Calculator livrare",
    ru: "Калькулятор доставки",
  },
  livrare_calculator_description: {
    ro: "Calculează costul total al comenzii tale, inclusiv livrarea gratuită pentru toate comenzile.",
    ru: "Рассчитайте общую стоимость вашего заказа, включая бесплатную доставку для всех заказов.",
  },
  livrare_select_location: {
    ro: "Selectează localitatea",
    ru: "Выберите населенный пункт",
  },
  livrare_cart_value: {
    ro: "Valoarea coșului (MDL)",
    ru: "Стоимость корзины (MDL)",
  },
  livrare_estimated_delivery_time: {
    ro: "Termen estimat de livrare:",
    ru: "Предполагаемый срок доставки:",
  },
  livrare_processing_time: {
    ro: "Comenzile plasate până la ora 15:00 în zilele lucrătoare vor fi procesate în aceeași zi.",
    ru: "Заказы, размещенные до 15:00 в рабочие дни, будут обработаны в тот же день.",
  },
  livrare_order_summary: {
    ro: "Rezumatul comenzii",
    ru: "Сводка заказа",
  },
  livrare_subtotal: {
    ro: "Subtotal:",
    ru: "Промежуточный итог:",
  },
  livrare_delivery_cost: {
    ro: "Cost livrare:",
    ru: "Стоимость доставки:",
  },
  livrare_total: {
    ro: "Total:",
    ru: "Итого:",
  },
  livrare_buy_now: {
    ro: "Cumpără acum",
    ru: "Купить сейчас",
  },
  livrare_faq_title: {
    ro: "Întrebări frecvente",
    ru: "Часто задаваемые вопросы",
  },
  livrare_faq_description: {
    ro: "Găsește răspunsuri la cele mai comune întrebări despre livrare.",
    ru: "Найдите ответы на самые распространенные вопросы о доставке.",
  },
  livrare_faq_question_1: {
    ro: "Cum funcționează livrarea gratuită?",
    ru: "Как работает бесплатная доставка?",
  },
  livrare_faq_answer_1: {
    ro: "Livrarea este gratuită pentru toate comenzile, indiferent de valoarea acestora sau localitatea de livrare. Timpul de livrare variază în funcție de localitatea de destinație, de la 1-2 zile pentru Chișinău până la 3-5 zile pentru zonele rurale.",
    ru: "Доставка бесплатна для всех заказов, независимо от их стоимости или места доставки. Время доставки варьируется в зависимости от пункта назначения, от 1-2 дней для Кишинева до 3-5 дней для сельской местности.",
  },
  livrare_faq_question_2: {
    ro: "Care sunt termenele de livrare?",
    ru: "Каковы сроки доставки?",
  },
  livrare_faq_answer_2: {
    ro: "Termenele de livrare variază în funcție de localitatea de destinație: pentru Chișinău - 1-2 zile lucrătoare, pentru alte localități urbane - 2-4 zile lucrătoare, iar pentru zonele rurale - 3-5 zile lucrătoare. Comenzile sunt procesate în aceeași zi dacă sunt plasate până la ora 15:00 în zilele lucrătoare.",
    ru: "Сроки доставки варьируются в зависимости от места назначения: для Кишинева - 1-2 рабочих дня, для других городских районов - 2-4 рабочих дня, а для сельской местности - 3-5 рабочих дней. Заказы обрабатываются в тот же день, если они размещены до 15:00 в рабочие дни.",
  },
  livrare_faq_question_3: {
    ro: "Ce se întâmplă dacă nu sunt acasă la livrare?",
    ru: "Что произойдет, если меня не будет дома во время доставки?",
  },
  livrare_faq_answer_3: {
    ro: "Dacă nu ești acasă în momentul livrării, curierul va încerca să te contacteze telefonic. Dacă nu răspunzi, curierul va lăsa un aviz și va încerca livrarea din nou în următoarea zi lucrătoare. După două încercări nereușite, comanda va fi returnată la depozitul nostru și vei fi contactat pentru a stabili o nouă dată de livrare.",
    ru: "Если вас нет дома в момент доставки, курьер попытается связаться с вами по телефону. Если вы не отвечаете, курьер оставит уведомление и попытается доставить заказ снова на следующий рабочий день. После двух неудачных попыток заказ будет возвращен на наш склад, и с вами свяжутся, чтобы установить новую дату доставки.",
  },
  livrare_faq_question_4: {
    ro: "Pot modifica adresa de livrare după plasarea comenzii?",
    ru: "Могу ли я изменить адрес доставки после размещения заказа?",
  },
  livrare_faq_answer_4: {
    ro: "Da, poți modifica adresa de livrare dacă comanda nu a fost încă procesată. Te rugăm să ne contactezi cât mai curând posibil la numărul de telefon +373 78 123 456 sau prin email la info@intelectmd.com cu noua adresă și numărul comenzii tale.",
    ru: "Да, вы можете изменить адрес доставки, если заказ еще не обработан. Пожалуйста, свяжитесь с нами как можно скорее по телефону +373 78 123 456 или по электронной почте info@intelectmd.com с новым адресом и номером вашего заказа.",
  },
  livrare_faq_question_5: {
    ro: "Cum sunt ambalate produsele?",
    ru: "Как упаковываются товары?",
  },
  livrare_faq_answer_5: {
    ro: "Toate produsele noastre sunt ambalate cu grijă pentru a asigura protecția lor în timpul transportului. Folosim materiale de ambalare de calitate, inclusiv folie cu bule, spumă de protecție și cutii rezistente, adaptate la tipul și dimensiunea produselor tale.",
    ru: "Все наши товары тщательно упакованы для обеспечения их защиты во время транспортировки. Мы используем качественные упаковочные материалы, включая пузырчатую пленку, защитную пену и прочные коробки, адаптированные к типу и размеру ваших товаров.",
  },
  livrare_faq_question_6: {
    ro: "Ce trebuie să fac în cazul în care produsul ajunge deteriorat?",
    ru: "Что делать, если товар прибыл поврежденным?",
  },
  livrare_faq_answer_6: {
    ro: "În cazul în care produsul ajunge deteriorat, te rugăm să refuzi primirea sau să notezi pe avizul de livrare orice deteriorare vizibilă a ambalajului. Contactează-ne imediat la +373 78 123 456 sau la info@intelectmd.com, incluzând numărul comenzii și fotografii ale produsului deteriorat. Vom rezolva situația cât mai repede posibil, oferindu-ți un produs de schimb sau rambursarea banilor.",
    ru: "Если товар прибыл поврежденным, пожалуйста, откажитесь от получения или отметьте на уведомлении о доставке любые видимые повреждения упаковки. Немедленно свяжитесь с нами по телефону +373 78 123 456 или по адресу info@intelectmd.com, указав номер заказа и приложив фотографии поврежденного товара. Мы решим ситуацию как можно быстрее, предложив вам замену товара или возврат денег.",
  },
  livrare_cta_title: {
    ro: "Gata să comanzi?",
    ru: "Готовы заказать?",
  },
  livrare_cta_description: {
    ro: "Explorează catalogul nostru de produse și profită de livrare gratuită pentru toate comenzile!",
    ru: "Изучите наш каталог товаров и воспользуйтесь бесплатной доставкой для всех заказов!",
  },
  // Warranty Page Translations
  garantie_breadcrumb_home: {
    ro: "Acasă",
    ru: "Главная",
  },
  garantie_breadcrumb_warranty: {
    ro: "Garanție",
    ru: "Гарантия",
  },
  garantie_badge: {
    ro: "Protecție garantată",
    ru: "Гарантированная защита",
  },
  garantie_page_title: {
    ro: "Servicii de garanție",
    ru: "Гарантийные услуги",
  },
  garantie_page_description: {
    ro: "Cumpără cu încredere - toate produsele noastre vin cu garanție extinsă și suport tehnic dedicat.",
    ru: "Покупайте с уверенностью - все наши продукты поставляются с расширенной гарантией и специализированной технической поддержкой.",
  },
  garantie_explore_products: {
    ro: "Explorează produse",
    ru: "Исследовать товары",
  },
  garantie_warranty_periods: {
    ro: "Perioade de garanție",
    ru: "Гарантийные сроки",
  },
  garantie_periods_description: {
    ro: "Toate produsele beneficiază de garanție standard de 24 de luni conform legislației în vigoare.",
    ru: "Все товары имеют стандартную гарантию 24 месяца в соответствии с действующим законодательством.",
  },
  garantie_table_caption: {
    ro: "Toate produsele noi beneficiază de garanție standard conform legislației în vigoare.",
    ru: "Все новые товары имеют стандартную гарантию в соответствии с действующим законодательством.",
  },
  garantie_product_category: {
    ro: "Categorie Produse",
    ru: "Категория товаров",
  },
  garantie_warranty_period: {
    ro: "Perioada de Garanție",
    ru: "Гарантийный срок",
  },
  garantie_description: {
    ro: "Descriere",
    ru: "Описание",
  },
  garantie_laptops_computers: {
    ro: "Laptopuri și Computere",
    ru: "Ноутбуки и компьютеры",
  },
  garantie_phones_tablets: {
    ro: "Telefoane și Tablete",
    ru: "Телефоны и планшеты",
  },
  garantie_tvs: {
    ro: "Televizoare",
    ru: "Телевизоры",
  },
  garantie_small_electronics: {
    ro: "Electronice mici",
    ru: "Мелкая электроника",
  },
  garantie_large_appliances: {
    ro: "Electrocasnice mari",
    ru: "Крупная бытовая техника",
  },
  garantie_standard_warranty: {
    ro: "12 luni",
    ru: "12 месяцев",
  },
  garantie_manufacturer_warranty: {
    ro: "Garanție standard oferită de producător",
    ru: "Стандартная гарантия от производителя",
  },
  garantie_about_warranty: {
    ro: "Despre garanție",
    ru: "О гарантии",
  },
  garantie_about_warranty_description: {
    ro: "Garanția standard este oferită automat pentru toate produsele achiziționate. Nu este necesară înregistrarea sau solicitarea separată a acesteia.",
    ru: "Стандартная гарантия автоматически предоставляется на все приобретенные товары. Не требуется отдельная регистрация или запрос.",
  },
  garantie_what_covers: {
    ro: "Ce acoperă garanția",
    ru: "Что покрывает гарантия",
  },
  garantie_covers_description: {
    ro: "Garanția noastră oferă protecție pentru o gamă largă de probleme care pot apărea la produsele achiziționate.",
    ru: "Наша гарантия обеспечивает защиту от широкого спектра проблем, которые могут возникнуть в приобретенных товарах.",
  },
  garantie_covered: {
    ro: "Acoperit de garanție",
    ru: "Покрывается гарантией",
  },
  garantie_not_covered: {
    ro: "Neacoperit de garanție",
    ru: "Не покрывается гарантией",
  },
  garantie_manufacturing_defects: {
    ro: "Defecte de fabricație",
    ru: "Производственные дефекты",
  },
  garantie_defective_components: {
    ro: "Componente defecte",
    ru: "Дефектные компоненты",
  },
  garantie_preinstalled_software: {
    ro: "Probleme de software preinstalat",
    ru: "Проблемы с предустановленным программным обеспечением",
  },
  garantie_screen_defects: {
    ro: "Defecțiuni ale ecranului (în condiții normale de utilizare)",
    ru: "Дефекты экрана (при нормальных условиях использования)",
  },
  garantie_battery_issues: {
    ro: "Probleme cu bateria (scădere de performanță peste limitele normale)",
    ru: "Проблемы с батареей (снижение производительности за пределами нормы)",
  },
  garantie_functional_errors: {
    ro: "Erori de funcționare",
    ru: "Ошибки функционирования",
  },
  garantie_physical_damage: {
    ro: "Daune fizice cauzate de utilizator (spargere, lovire, lichide vărsate)",
    ru: "Физические повреждения, вызванные пользователем (разбитие, удары, пролитые жидкости)",
  },
  garantie_normal_wear: {
    ro: "Uzura normală a produsului",
    ru: "Нормальный износ продукта",
  },
  garantie_incorrect_installation: {
    ro: "Instalarea incorectă sau modificări neautorizate",
    ru: "Неправильная установка или несанкционированные модификации",
  },
  garantie_environmental_damage: {
    ro: "Daune cauzate de condiții de mediu extreme",
    ru: "Повреждения, вызванные экстремальными условиями окружающей среды",
  },
  garantie_user_software: {
    ro: "Probleme cu software-ul sau aplicațiile instalate de utilizator",
    ru: "Проблемы с программным обеспечением или приложениями, установленными пользователем",
  },
  garantie_commercial_use: {
    ro: "Utilizare comercială a produselor destinate uzului casnic",
    ru: "Коммерческое использование продуктов, предназначенных для домашнего использования",
  },
  garantie_authorized_service: {
    ro: "Service autorizat",
    ru: "Авторизованный сервис",
  },
  garantie_service_description: {
    ro: "Pentru service în perioada de garanție, te rugăm să aduci produsul la centrul nostru de service, împreună cu factura sau bonul fiscal care dovedește achiziția.",
    ru: "Для гарантийного обслуживания, пожалуйста, принесите товар в наш сервисный центр вместе с чеком или счетом-фактурой, подтверждающим покупку.",
  },
  garantie_faq_title: {
    ro: "Întrebări frecvente",
    ru: "Часто задаваемые вопросы",
  },
  garantie_faq_description: {
    ro: "Găsește răspunsuri la cele mai comune întrebări despre serviciile noastre de garanție.",
    ru: "Найдите ответы на наиболее распространенные вопросы о наших гарантийных услугах.",
  },
  garantie_faq_question_1: {
    ro: "Ce acoperă garanția standard?",
    ru: "Что покрывает стандартная гарантия?",
  },
  garantie_faq_answer_1: {
    ro: "Garanția standard acoperă defectele de fabricație, probleme tehnice care nu sunt cauzate de utilizator și asigură că produsul funcționează conform specificațiilor producătorului. Aceasta include piese defecte, probleme de software preinstalat și alte defecțiuni care apar în condiții normale de utilizare.",
    ru: "Стандартная гарантия покрывает производственные дефекты, технические проблемы, не вызванные пользователем, и обеспечивает работу продукта в соответствии со спецификациями производителя. Это включает дефектные детали, проблемы с предустановленным программным обеспечением и другие неисправности, возникающие при нормальных условиях использования.",
  },
  garantie_faq_question_2: {
    ro: "Cum pot solicita service în garanție?",
    ru: "Как запросить гарантийное обслуживание?",
  },
  garantie_faq_answer_2: {
    ro: "Pentru a solicita service în garanție, poți aduce produsul în orice magazin Intelect sau poți completa formularul de service online. Vei avea nevoie de dovada achiziției (factură sau bon fiscal) și de numărul de serie al produsului. După verificarea documentelor, vei primi un număr de înregistrare pentru urmărirea statusului reparației.",
    ru: "Чтобы запросить гарантийное обслуживание, вы можете принести товар в любой магазин Intelect или заполнить онлайн-форму обслуживания. Вам понадобится доказательство покупки (счет-фактура или чек) и серийный номер товара. После проверки документов вы получите регистрационный номер для отслеживания статуса ремонта.",
  },
  garantie_faq_question_3: {
    ro: "Care este durata standard a procesului de reparație?",
    ru: "Какова стандартная продолжительность процесса ремонта?",
  },
  garantie_faq_answer_3: {
    ro: "Durata standard pentru reparații în garanție este de 5-15 zile lucrătoare, în funcție de tipul defecțiunii și disponibilitatea pieselor de schimb. Pentru anumite categorii de produse oferim service express, cu reparație în 24-48 de ore. Vei fi informat despre statusul reparației pe email sau prin SMS.",
    ru: "Стандартный срок гарантийного ремонта составляет 5-15 рабочих дней, в зависимости от типа неисправности и наличия запасных частей. Для определенных категорий товаров мы предлагаем экспресс-обслуживание с ремонтом в течение 24-48 часов. Вы будете проинформированы о статусе ремонта по электронной почте или СМС.",
  },
  garantie_faq_question_4: {
    ro: "Ce se întâmplă dacă produsul nu poate fi reparat?",
    ru: "Что происходит, если товар не может быть отремонтирован?",
  },
  garantie_faq_answer_4: {
    ro: "Dacă produsul nu poate fi reparat sau reparația nu este fezabilă, îți vom oferi un produs identic sau similar. Dacă nu avem în stoc un produs identic sau similar, vei primi rambursarea integrală a sumei achitate pentru produs.",
    ru: "Если товар не может быть отремонтирован или ремонт нецелесообразен, мы предложим вам идентичный или аналогичный товар. Если у нас нет в наличии идентичного или аналогичного товара, вы получите полное возмещение суммы, уплаченной за товар.",
  },
  garantie_faq_question_5: {
    ro: "Garanția se extinde după reparație?",
    ru: "Продлевается ли гарантия после ремонта?",
  },
  garantie_faq_answer_5: {
    ro: "Da, după reparația în garanție, perioada de garanție se prelungește cu perioada în care produsul a fost în service. Pentru componentele înlocuite, se acordă o nouă perioadă de garanție de 90 de zile sau până la expirarea garanției produsului, care dintre ele este mai lungă.",
    ru: "Да, после гарантийного ремонта гарантийный срок продлевается на период, в течение которого товар находился в сервисе. На замененные компоненты предоставляется новый гарантийный срок 90 дней или до истечения гарантии на товар, в зависимости от того, что дольше.",
  },
  garantie_faq_question_6: {
    ro: "Pot returna un produs cumpărat online dacă nu îmi place?",
    ru: "Могу ли я вернуть товар, купленный онлайн, если он мне не нравится?",
  },
  garantie_faq_answer_6: {
    ro: "Da, pentru produsele cumpărate online, poți exercita dreptul de returnare în termen de 14 zile calendaristice de la primirea produsului, fără a fi nevoit să justifici decizia de returnare. Produsul trebuie să fie în starea originală, complet și în ambalajul original. Această politică de returnare este separată de garanția produsului.",
    ru: "Да, для товаров, купленных онлайн, вы можете воспользоваться правом на возврат в течение 14 календарных дней с момента получения товара, без необходимости обосновывать решение о возврате. Товар должен быть в исходном состоянии, полным и в оригинальной упаковке. Эта политика возврата отдельна от гарантии на товар.",
  },
  garantie_cta_title: {
    ro: "Produse cu garanție extinsă",
    ru: "Товары с расширенной гарантией",
  },
  garantie_cta_description: {
    ro: "Toate produsele noastre vin cu garanție extinsă. Explorează catalogul nostru și beneficiază de protecție completă pentru achizițiile tale.",
    ru: "Все наши товары поставляются с расширенной гарантией. Исследуйте наш каталог и получите полную защиту для ваших покупок.",
  },
  // Return Policy Page Translations
  returnare_breadcrumb_home: {
    ro: "Acasă",
    ru: "Главная",
  },
  returnare_breadcrumb_return: {
    ro: "Politica de returnare",
    ru: "Политика возврата",
  },
  returnare_badge: {
    ro: "30 de zile garantate",
    ru: "30 дней гарантированно",
  },
  returnare_page_title: {
    ro: "Politica de returnare",
    ru: "Политика возврата",
  },
  returnare_page_description: {
    ro: "Suntem încrezători în calitatea produselor noastre și vă oferim o perioadă de 30 de zile pentru a le testa și a vă asigura că sunt potrivite pentru nevoile dumneavoastră.",
    ru: "Мы уверены в качестве наших товаров и предоставляем вам 30 дней, чтобы протестировать и убедиться, что они подходят для ваших нужд.",
  },
  returnare_explore_products: {
    ro: "Explorează produse",
    ru: "Исследовать товары",
  },
  returnare_conditions_title: {
    ro: "Condiții de returnare",
    ru: "Условия возврата",
  },
  returnare_conditions_description: {
    ro: "Toate produsele beneficiază de o perioadă de returnare de 30 de zile, cu condiții specifice în funcție de tipul produsului.",
    ru: "Все товары имеют 30-дневный период возврата с определенными условиями в зависимости от типа товара.",
  },
  returnare_product_type: {
    ro: "Tip produs",
    ru: "Тип товара",
  },
  returnare_period: {
    ro: "Perioada",
    ru: "Период",
  },
  returnare_options: {
    ro: "Opțiuni",
    ru: "Варианты",
  },
  returnare_conditions: {
    ro: "Condiții",
    ru: "Условия",
  },
  returnare_new_products: {
    ro: "Produse noi",
    ru: "Новые товары",
  },
  returnare_refurbished_products: {
    ro: "Produse reconditionate",
    ru: "Восстановленные товары",
  },
  returnare_used_products: {
    ro: "Produse la mâna a doua",
    ru: "Товары б/у",
  },
  returnare_30_days: {
    ro: "30 zile",
    ru: "30 дней",
  },
  returnare_full_refund_exchange: {
    ro: "Rambursare completă sau schimb cu alt produs",
    ru: "Полное возмещение или обмен на другой товар",
  },
  returnare_new_condition: {
    ro: "Produsul trebuie să fie în starea originală, fără semne de utilizare, cu toate accesoriile și ambalajul original",
    ru: "Товар должен быть в исходном состоянии, без следов использования, со всеми аксессуарами и оригинальной упаковкой",
  },
  returnare_used_condition: {
    ro: "Produsul trebuie să fie în starea în care a fost livrat, fără deteriorări suplimentare",
    ru: "Товар должен быть в том состоянии, в котором он был доставлен, без дополнительных повреждений",
  },
  returnare_note_important: {
    ro: "Notă importantă:",
    ru: "Важное примечание:",
  },
  returnare_note_description: {
    ro: "Perioada de returnare începe de la data primirii produsului. Pentru produsele achiziționate online și ridicate din magazin, perioada de returnare începe de la data ridicării. Pentru orice returnare sau schimb, este necesar să prezentați documentul de achiziție (factură, bon fiscal).",
    ru: "Период возврата начинается с даты получения товара. Для товаров, купленных онлайн и полученных в магазине, период возврата начинается с даты получения. Для любого возврата или обмена необходимо предъявить документ о покупке (счет-фактуру, кассовый чек).",
  },
  returnare_process_title: {
    ro: "Procesul de returnare",
    ru: "Процесс возврата",
  },
  returnare_process_description: {
    ro: "Procesul nostru de returnare este simplu și transparent. Urmează acești pași pentru a returna un produs.",
    ru: "Наш процесс возврата прост и прозрачен. Следуйте этим шагам, чтобы вернуть товар.",
  },
  returnare_step1_title: {
    ro: "Completează formularul online",
    ru: "Заполните онлайн-форму",
  },
  returnare_step1_description: {
    ro: 'Accesează contul tău și completează formularul de returnare online, disponibil în secțiunea "Comenzile mele".',
    ru: 'Войдите в свою учетную запись и заполните онлайн-форму возврата, доступную в разделе "Мои заказы".',
  },
  returnare_step2_title: {
    ro: "Primește eticheta de returnare",
    ru: "Получите этикетку возврата",
  },
  returnare_step2_description: {
    ro: "După aprobarea cererii, vei primi prin email o etichetă de returnare și instrucțiuni specifice.",
    ru: "После одобрения заявки вы получите по электронной почте этикетку возврата и конкретные инструкции.",
  },
  returnare_step3_title: {
    ro: "Ambalează produsul",
    ru: "Упакуйте товар",
  },
  returnare_step3_description: {
    ro: "Ambalează produsul în ambalajul original, împreună cu toate accesoriile și documentele primite.",
    ru: "Упакуйте товар в оригинальную упаковку вместе со всеми полученными аксессуарами и документами.",
  },
  returnare_step4_title: {
    ro: "Returnează produsul",
    ru: "Верните товар",
  },
  returnare_step4_description: {
    ro: "Aduce produsul la magazinul nostru sau utilizează serviciul de curierat recomandat de noi.",
    ru: "Принесите товар в наш магазин или воспользуйтесь рекомендованной нами курьерской службой.",
  },
  returnare_step5_title: {
    ro: "Verificarea produsului",
    ru: "Проверка товара",
  },
  returnare_step5_description: {
    ro: "Vom verifica produsul pentru a ne asigura că respectă condițiile de returnare.",
    ru: "Мы проверим товар, чтобы убедиться, что он соответствует условиям возврата.",
  },
  returnare_step6_title: {
    ro: "Finalizarea procesului",
    ru: "Завершение процесса",
  },
  returnare_step6_description: {
    ro: "După verificare, vom procesa rambursarea sau schimbul conform opțiunii alese.",
    ru: "После проверки мы обработаем возврат или обмен в соответствии с выбранным вариантом.",
  },
  returnare_exchange_title: {
    ro: "Schimb pentru produse la mâna a doua",
    ru: "Обмен бывших в употреблении товаров",
  },
  returnare_exchange_description: {
    ro: "Pentru produsele la mâna a doua, oferim posibilitatea de a le schimba cu alte produse din magazinul nostru. Iată cum funcționează acest proces:",
    ru: "Для товаров б/у мы предлагаем возможность обменять их на другие товары из нашего магазина. Вот как работает этот процесс:",
  },
  returnare_evaluation_title: {
    ro: "Evaluarea produsului returnat",
    ru: "Оценка возвращаемого товара",
  },
  returnare_evaluation_description: {
    ro: "Produsul la mâna a doua va fi evaluat de specialiștii noștri pentru a verifica starea acestuia și pentru a confirma că nu prezintă deteriorări suplimentare față de momentul achiziției.",
    ru: "Бывший в употреблении товар будет оценен нашими специалистами для проверки его состояния и подтверждения того, что он не имеет дополнительных повреждений по сравнению с моментом покупки.",
  },
  returnare_new_product_title: {
    ro: "Alegerea unui nou produs",
    ru: "Выбор нового товара",
  },
  returnare_new_product_description: {
    ro: "După evaluare, poți alege orice alt produs din magazinul nostru, indiferent dacă este nou, recondiționat sau la mâna a doua.",
    ru: "После оценки вы можете выбрать любой другой товар из нашего магазина, независимо от того, новый он, восстановленный или бывший в употреблении.",
  },
  returnare_price_diff_title: {
    ro: "Calcularea diferenței de preț",
    ru: "Расчет разницы в цене",
  },
  returnare_price_diff_description: {
    ro: "Dacă produsul nou ales are un preț mai mare decât cel returnat, va trebui să achiți diferența. Dacă are un preț mai mic, diferența nu se returnează.",
    ru: "Если новый выбранный товар имеет более высокую цену, чем возвращаемый, вы должны будете оплатить разницу. Если цена ниже, разница не возвращается.",
  },
  returnare_exchange_completion_title: {
    ro: "Finalizarea schimbului",
    ru: "Завершение обмена",
  },
  returnare_exchange_completion_description: {
    ro: "După achitarea diferenței (dacă este cazul), vei primi noul produs ales, împreună cu toate documentele și accesoriile aferente.",
    ru: "После оплаты разницы (если применимо) вы получите выбранный новый товар со всеми соответствующими документами и аксессуарами.",
  },
  returnare_faq_title: {
    ro: "Întrebări frecvente",
    ru: "Часто задаваемые вопросы",
  },
  returnare_faq_description: {
    ro: "Găsește răspunsuri la cele mai comune întrebări despre politica noastră de returnare.",
    ru: "Найдите ответы на наиболее распространенные вопросы о нашей политике возврата.",
  },
  returnare_faq_question_1: {
    ro: "Pot returna un produs dacă l-am folosit?",
    ru: "Могу ли я вернуть товар, если я его использовал?",
  },
  returnare_faq_answer_1: {
    ro: "Pentru produsele noi, acestea trebuie să fie în starea originală, fără semne de utilizare. Pentru produsele recondiționate sau la mâna a doua, acestea trebuie să fie în aceeași stare în care au fost livrate, fără deteriorări suplimentare.",
    ru: "Для новых товаров они должны быть в исходном состоянии, без следов использования. Для восстановленных или бывших в употреблении товаров они должны быть в том же состоянии, в котором были доставлены, без дополнительных повреждений.",
  },
  returnare_faq_question_2: {
    ro: "Cine plătește pentru transportul produsului returnat?",
    ru: "Кто оплачивает транспортировку возвращаемого товара?",
  },
  returnare_faq_answer_2: {
    ro: "În general, clientul suportă costurile de transport pentru returnarea produsului. În cazul în care produsul prezintă defecte de fabricație sau nu corespunde descrierii, noi vom acoperi costurile de transport.",
    ru: "Как правило, клиент несет транспортные расходы по возврату товара. Если товар имеет производственные дефекты или не соответствует описанию, мы покроем транспортные расходы.",
  },
  returnare_faq_question_3: {
    ro: "Cât durează procesarea unei returnări?",
    ru: "Как долго обрабатывается возврат?",
  },
  returnare_faq_answer_3: {
    ro: "După ce primim produsul returnat, procesul de verificare durează 1-3 zile lucrătoare. Rambursarea se efectuează în termen de 3-5 zile lucrătoare după aprobarea returnării.",
    ru: "После получения возвращаемого товара процесс проверки занимает 1-3 рабочих дня. Возмещение производится в течение 3-5 рабочих дней после одобрения возврата.",
  },
  returnare_faq_question_4: {
    ro: "Pot returna un produs cumpărat în rate?",
    ru: "Могу ли я вернуть товар, купленный в рассрочку?",
  },
  returnare_faq_answer_4: {
    ro: "Da, poți returna un produs cumpărat în rate în aceleași condiții ca pentru orice alt produs. Rambursarea se va face către compania de creditare, iar contractul de credit va fi anulat.",
    ru: "Да, вы можете вернуть товар, купленный в рассрочку, на тех же условиях, что и любой другой товар. Возмещение будет произведено кредитной компании, а кредитный договор будет аннулирован.",
  },
  returnare_faq_question_5: {
    ro: "Ce se întâmplă dacă produsul se defectează în perioada de returnare?",
    ru: "Что происходит, если товар ломается в период возврата?",
  },
  returnare_faq_answer_5: {
    ro: "Dacă produsul se defectează în perioada de returnare din cauza unui defect de fabricație, poți opta pentru reparație în garanție, înlocuire sau returnare cu rambursare completă.",
    ru: "Если товар ломается в период возврата из-за производственного дефекта, вы можете выбрать гарантийный ремонт, замену или возврат с полным возмещением.",
  },
  returnare_cta_title: {
    ro: "Cumpără cu încredere",
    ru: "Покупайте с уверенностью",
  },
  returnare_cta_description: {
    ro: "Oferim 30 de zile garantate pentru returnare pentru toate produsele noastre. Explorează catalogul nostru și bucură-te de achiziții fără griji.",
    ru: "Мы предлагаем 30 дней гарантированного возврата для всех наших товаров. Исследуйте наш каталог и наслаждайтесь беззаботными покупками.",
  },
  // Product Page Translations
  product_error_title: {
    ro: "Eroare!",
    ru: "Ошибка!",
  },
  product_not_found: {
    ro: "Produsul nu a fost găsit",
    ru: "Товар не найден",
  },
  product_back_button: {
    ro: "Înapoi",
    ru: "Назад",
  },
  product_breadcrumb_home: {
    ro: "Acasă",
    ru: "Главная",
  },
  product_code: {
    ro: "Cod produs:",
    ru: "Код товара:",
  },
  product_in_stock: {
    ro: "În stoc",
    ru: "В наличии",
  },
  product_available: {
    ro: "disponibile",
    ru: "доступно",
  },
  product_out_of_stock: {
    ro: "Stoc epuizat",
    ru: "Нет в наличии",
  },
  product_delivery_time: {
    ro: "Livrare în 1-3 zile lucrătoare",
    ru: "Доставка в течение 1-3 рабочих дней",
  },
  product_add_to_cart: {
    ro: "Adaugă în coș",
    ru: "Добавить в корзину",
  },
  product_buy_in_installments: {
    ro: "Cumpără în rate",
    ru: "Купить в рассрочку",
  },
  product_installment_payment: {
    ro: "Plata în rate lunare",
    ru: "Оплата ежемесячными платежами",
  },
  product_choose_financing_period: {
    ro: "Alege perioada de finanțare care ți se potrivește cel mai bine",
    ru: "Выберите период финансирования, который лучше всего вам подходит",
  },
  product_zero_interest: {
    ro: "0% DOBÂNDĂ",
    ru: "0% ПРОЦЕНТОВ",
  },
  product_total_price: {
    ro: "Preț total:",
    ru: "Общая цена:",
  },
  product_choose_payment_period: {
    ro: "Alege perioada de plată:",
    ru: "Выберите период оплаты:",
  },
  product_recommended: {
    ro: "RECOMANDAT",
    ru: "РЕКОМЕНДУЕМЫЙ",
  },
  product_months: {
    ro: "luni",
    ru: "месяцев",
  },
  product_zero_interest_label: {
    ro: "0% dobândă",
    ru: "0% процентов",
  },
  product_monthly_payments: {
    ro: "Rate lunare:",
    ru: "Ежемесячные платежи:",
  },
  product_important_info: {
    ro: "Informații importante:",
    ru: "Важная информация:",
  },
  product_financing_minimum: {
    ro: "Finanțare disponibilă pentru produse de peste 1.000 lei",
    ru: "Финансирование доступно для товаров стоимостью более 1.000 лей",
  },
  product_quick_approval: {
    ro: "Aprobare rapidă, în aceeași zi",
    ru: "Быстрое одобрение в тот же день",
  },
  product_early_payment: {
    ro: "Posibilitatea plății anticipate fără penalități",
    ru: "Возможность досрочного погашения без штрафов",
  },
  product_see_all_details: {
    ro: "Vezi toate detaliile",
    ru: "Посмотреть все детали",
  },
  product_select_option: {
    ro: "Selectează o opțiune pentru a continua",
    ru: "Выберите опцию, чтобы продолжить",
  },
  product_close: {
    ro: "Închide",
    ru: "Закрыть",
  },
  product_product_added: {
    ro: "Produs adăugat în coș",
    ru: "Товар добавлен в корзину",
  },
  product_with_payment: {
    ro: "cu plata în",
    ru: "с оплатой в",
  },
  product_installments_of: {
    ro: "rate de",
    ru: "платежей по",
  },
  product_per_month: {
    ro: "lei/lună",
    ru: "лей/месяц",
  },
  product_share_product: {
    ro: "Distribuie acest produs",
    ru: "Поделиться этим товаром",
  },
  product_share: {
    ro: "Distribuie",
    ru: "Поделиться",
  },
  product_copy_link: {
    ro: "Copiază link",
    ru: "Копировать ссылку",
  },
  product_link_copied: {
    ro: "Link copiat!",
    ru: "Ссылка скопирована!",
  },
  product_about_product: {
    ro: "Despre acest produs:",
    ru: "Об этом товаре:",
  },
  product_specifications: {
    ro: "Specificații",
    ru: "Технические характеристики",
  },
  product_no_specifications: {
    ro: "Nu există specificații disponibile pentru acest produs.",
    ru: "Для этого товара нет доступных технических характеристик.",
  },
  product_similar_products: {
    ro: "Produse similare",
    ru: "Похожие товары",
  },
  product_no_image: {
    ro: "Fără imagine",
    ru: "Нет изображения",
  },

  // Contact Page Translations
  contact_page_title: {
    ro: "Contactează-ne",
    ru: "Связаться с нами",
  },
  contact_page_description: {
    ro: "Suntem aici pentru a te ajuta cu orice întrebare. Contactează-ne prin metodele preferate sau vizitează-ne la showroom.",
    ru: "Мы здесь, чтобы помочь вам с любыми вопросами. Свяжитесь с нами удобным для вас способом или посетите наш шоурум.",
  },
  contact_location_title: {
    ro: "Locația noastră",
    ru: "Наше местоположение",
  },
  contact_location_subtitle: {
    ro: "Vizitează-ne la showroomul nostru",
    ru: "Посетите наш шоурум",
  },
  contact_address_label: {
    ro: "Adresă",
    ru: "Адрес",
  },
  contact_address: {
    ro: "Strada Calea Orheiului 37\nChișinău, Moldova",
    ru: "Улица Каля Орхеюлуй 37\nКишинев, Молдова",
  },
  contact_schedule_label: {
    ro: "Program",
    ru: "График работы",
  },
  contact_monday_friday: {
    ro: "Luni - Vineri:",
    ru: "Понедельник - Пятница:",
  },
  contact_saturday: {
    ro: "Sâmbătă:",
    ru: "Суббота:",
  },
  contact_sunday: {
    ro: "Duminică:",
    ru: "Воскресенье:",
  },
  contact_closed: {
    ro: "Închis",
    ru: "Закрыто",
  },
  contact_us_label: {
    ro: "Contactează-ne",
    ru: "Свяжитесь с нами",
  },
  contact_phone: {
    ro: "Telefon:",
    ru: "Телефон:",
  },
  contact_email: {
    ro: "Email:",
    ru: "Электронная почта:",
  },
  contact_open_google_maps: {
    ro: "Deschide în Google Maps",
    ru: "Открыть в Google Maps",
  },
  contact_resources_title: {
    ro: "Resurse utile",
    ru: "Полезные ресурсы",
  },
  contact_resources_description: {
    ro: "Informații utile despre serviciile noastre",
    ru: "Полезная информация о наших услугах",
  },
  contact_delivery_title: {
    ro: "Livrare",
    ru: "Доставка",
  },
  contact_delivery_subtitle: {
    ro: "Informații despre livrare",
    ru: "Информация о доставке",
  },
  contact_delivery_description: {
    ro: "Află mai multe despre opțiunile de livrare disponibile și termenele de livrare pentru produsele noastre.",
    ru: "Узнайте больше о доступных вариантах доставки и сроках доставки наших товаров.",
  },
  contact_warranty_title: {
    ro: "Garanție",
    ru: "Гарантия",
  },
  contact_warranty_subtitle: {
    ro: "Politica de garanție",
    ru: "Гарантийная политика",
  },
  contact_warranty_description: {
    ro: "Informații detaliate despre garanțiile oferite pentru produsele comercializate de noi.",
    ru: "Подробная информация о гарантиях, предоставляемых на продаваемые нами товары.",
  },
  contact_return_title: {
    ro: "Returnare",
    ru: "Возврат",
  },
  contact_return_subtitle: {
    ro: "Politica de returnare",
    ru: "Политика возврата",
  },
  contact_return_description: {
    ro: "Tot ce trebuie să știi despre procedura de returnare a produselor și condițiile aplicabile.",
    ru: "Всё, что вам нужно знать о процедуре возврата товаров и применимых условиях.",
  },
  contact_cta_title: {
    ro: "Explorează produsele noastre",
    ru: "Исследуйте наши товары",
  },
  contact_cta_description: {
    ro: "Ești în căutarea unor produse electronice de calitate sau ai întrebări despre ofertele noastre? Navighează prin catalogul nostru online sau vino să ne vizitezi în showroom.",
    ru: "Ищете качественную электронику или у вас есть вопросы о наших предложениях? Просмотрите наш онлайн-каталог или приходите посетить наш шоурум.",
  },
  contact_explore_catalog: {
    ro: "Explorează catalogul",
    ru: "Просмотреть каталог",
  },
  contact_call_now: {
    ro: "Sună acum",
    ru: "Позвонить сейчас",
  },
  // Catalog Page Translations
  catalog_all_products: {
    ro: "Toate produsele",
    ru: "Все товары",
  },
  catalog_loading: {
    ro: "Se încarcă categoriile...",
    ru: "Загрузка категорий...",
  },
  catalog_search_placeholder: {
    ro: "Caută produse...",
    ru: "Поиск товаров...",
  },
  catalog_search_button: {
    ro: "Caută",
    ru: "Поиск",
  },
  catalog_active_filters: {
    ro: "Filtre active:",
    ru: "Активные фильтры:",
  },
  catalog_filter_by_price: {
    ro: "Filtru preț",
    ru: "Фильтр по цене",
  },
  catalog_sort_by: {
    ro: "Sortează după",
    ru: "Сортировать по",
  },
  catalog_view_mode: {
    ro: "Mod de vizualizare",
    ru: "Режим просмотра",
  },
  catalog_filter_products: {
    ro: "Filtrează produsele",
    ru: "Фильтровать товары",
  },
  catalog_filters: {
    ro: "Filtre",
    ru: "Фильтры",
  },
  catalog_reset_all: {
    ro: "Resetează toate",
    ru: "Сбросить все",
  },
  catalog_reset_filters: {
    ro: "Resetează filtrele",
    ru: "Сбросить фильтры",
  },
  catalog_categories: {
    ro: "Categorii",
    ru: "Категории",
  },
  catalog_price: {
    ro: "Preț",
    ru: "Цена",
  },
  catalog_min_price: {
    ro: "Preț minim",
    ru: "Минимальная цена",
  },
  catalog_max_price: {
    ro: "Preț maxim",
    ru: "Максимальная цена",
  },
  catalog_apply_filter: {
    ro: "Aplică filtru",
    ru: "Применить фильтр",
  },
  catalog_apply_filters: {
    ro: "Aplică filtre",
    ru: "Применить фильтры",
  },
  catalog_sorting: {
    ro: "Sortare",
    ru: "Сортировка",
  },
  catalog_sort_recommended: {
    ro: "Recomandate",
    ru: "Рекомендуемые",
  },
  catalog_sort_price_asc: {
    ro: "Preț: crescător",
    ru: "Цена: по возрастанию",
  },
  catalog_sort_price_desc: {
    ro: "Preț: descrescător",
    ru: "Цена: по убыванию",
  },
  catalog_sort_name_asc: {
    ro: "Nume: A-Z",
    ru: "Имя: А-Я",
  },
  catalog_sort_name_desc: {
    ro: "Nume: Z-A",
    ru: "Имя: Я-А",
  },
  catalog_in_stock_only: {
    ro: "Doar produse în stoc",
    ru: "Только товары в наличии",
  },
  catalog_on_sale: {
    ro: "Produse cu reducere",
    ru: "Товары со скидкой",
  },
  catalog_free_shipping: {
    ro: "Livrare gratuită",
    ru: "Бесплатная доставка",
  },
  catalog_load_more: {
    ro: "Încarcă încă 10 produse",
    ru: "Загрузить еще 10 товаров",
  },
  catalog_no_products_found: {
    ro: "Nu au fost găsite produse care să corespundă filtrelor selectate",
    ru: "Не найдено товаров, соответствующих выбранным фильтрам",
  },
  catalog_try_different_filters: {
    ro: "Încercați criterii de filtrare diferite sau",
    ru: "Попробуйте другие критерии фильтрации или",
  },
  catalog_clear_all_filters: {
    ro: "ștergeți toate filtrele",
    ru: "очистите все фильтры",
  },
  catalog_total_products: {
    ro: "produse găsite",
    ru: "найдено товаров",
  },
  catalog_min: {
    ro: "Min:",
    ru: "Мин:",
  },
  catalog_max: {
    ro: "Max:",
    ru: "Макс:",
  },
  catalog_previous: {
    ro: "Anterior",
    ru: "Предыдущий",
  },
  catalog_next: {
    ro: "Următor",
    ru: "Следующий",
  },
  // Cart Page Translations
  cart_title: {
    ro: "Coșul meu",
    ru: "Моя корзина",
  },
  cart_continue_shopping: {
    ro: "Continuă cumpărăturile",
    ru: "Продолжить покупки",
  },
  cart_empty: {
    ro: "Coșul tău este gol",
    ru: "Ваша корзина пуста",
  },
  cart_empty_description: {
    ro: "Nu ai niciun produs în coș. Explorează catalogul nostru pentru a găsi produsele de care ai nevoie.",
    ru: "В вашей корзине нет товаров. Изучите наш каталог, чтобы найти нужные вам товары.",
  },
  cart_explore_catalog: {
    ro: "Explorează catalogul",
    ru: "Просмотреть каталог",
  },
  cart_product_code: {
    ro: "Cod",
    ru: "Код",
  },
  cart_quantity: {
    ro: "Cantitate",
    ru: "Количество",
  },
  cart_order_summary: {
    ro: "Sumar comandă",
    ru: "Сводка заказа",
  },
  cart_products: {
    ro: "Produse",
    ru: "Товары",
  },
  cart_delivery: {
    ro: "Livrare",
    ru: "Доставка",
  },
  cart_free: {
    ro: "Gratuită",
    ru: "Бесплатно",
  },
  cart_total: {
    ro: "Total",
    ru: "Итого",
  },
  cart_checkout: {
    ro: "Finalizează comanda",
    ru: "Оформить заказ",
  },
  cart_processing: {
    ro: "Se procesează...",
    ru: "Обработка...",
  },
  cart_free_delivery: {
    ro: "Livrare gratuită pentru toate comenzile",
    ru: "Бесплатная доставка для всех заказов",
  },
  cart_payment_options: {
    ro: "Plată la livrare sau ridicare din magazin",
    ru: "Оплата при доставке или самовывоз из магазина",
  },
  cart_monthly_payment: {
    ro: "rate x",
    ru: "платежи x",
  },
  cart_per_month: {
    ro: "pe lună",
    ru: "в месяц",
  },
  cart_add_to_cart: {
    ro: "Adaugă în coș",
    ru: "Добавить в корзину",
  },
  cart_added_title: {
    ro: "Adăugat în coș",
    ru: "Добавлено в корзину",
  },
  cart_added_description: {
    ro: "Produsul a fost adăugat în coșul tău",
    ru: "Товар был добавлен в вашу корзину",
  },
  favorites_added_title: {
    ro: "Adăugat la favorite",
    ru: "Добавлено в избранное",
  },
  favorites_removed_title: {
    ro: "Eliminat din favorite",
    ru: "Удалено из избранного",
  },
  favorites_added_description: {
    ro: "Produsul a fost adăugat în lista ta de favorite",
    ru: "Товар был добавлен в ваш список избранного",
  },
  favorites_removed_description: {
    ro: "Produsul a fost eliminat din lista ta de favorite",
    ru: "Товар был удален из вашего списка избранного",
  },
  // Checkout Page Translations
  checkout_title: {
    ro: "Finalizare comandă",
    ru: "Оформление заказа",
  },
  checkout_subtitle: {
    ro: "Completează datele de mai jos pentru a finaliza comanda",
    ru: "Заполните данные ниже для оформления заказа",
  },
  checkout_personal_info: {
    ro: "Informații personale",
    ru: "Личная информация",
  },
  checkout_first_name: {
    ro: "Prenume",
    ru: "Имя",
  },
  checkout_last_name: {
    ro: "Nume",
    ru: "Фамилия",
  },
  checkout_email: {
    ro: "Email",
    ru: "Электронная почта",
  },
  checkout_phone: {
    ro: "Telefon",
    ru: "Телефон",
  },
  checkout_delivery_address: {
    ro: "Adresa de livrare",
    ru: "Адрес доставки",
  },
  checkout_address: {
    ro: "Adresa",
    ru: "Адрес",
  },
  checkout_city: {
    ro: "Orașul",
    ru: "Город",
  },
  checkout_store_pickup: {
    ro: "Ridicare din magazin",
    ru: "Самовывоз из магазина",
  },
  checkout_credit_request: {
    ro: "Solicitare credit",
    ru: "Запрос на кредит",
  },
  checkout_intelect_store: {
    ro: "Intelect Store",
    ru: "Intelect Store",
  },
  checkout_credit_zero: {
    ro: "Solicitare Credit 0%",
    ru: "Запрос на кредит 0%",
  },
  checkout_store_address: {
    ro: "Adresa: Strada Calea Orheiului 37, MD-2059, Chișinău",
    ru: "Адрес: улица Каля Орхеюлуй 37, MD-2059, Кишинёв",
  },
  checkout_store_hours: {
    ro: "Program: Luni-Vineri 9:00-18:00, Sâmbătă 10:00-16:00",
    ru: "Часы работы: Понедельник-Пятница 9:00-18:00, Суббота 10:00-16:00",
  },
  checkout_credit_contact: {
    ro: "Un reprezentant te va contacta pentru a finaliza procesul de creditare după plasarea comenzii.",
    ru: "Представитель свяжется с вами для завершения процесса кредитования после размещения заказа.",
  },
  // Additional Checkout Page Translations
  checkout_instructions: {
    ro: "Completează datele de mai jos pentru a finaliza comanda",
    ru: "Заполните данные ниже для оформления заказа",
  },
  checkout_pickup: {
    ro: "Ridicare din magazin",
    ru: "Самовывоз из магазина",
  },
  checkout_credit: {
    ro: "Solicitare credit",
    ru: "Запрос на кредит",
  },
  checkout_pickup_info: {
    ro: "Intelect Store",
    ru: "Intelect Store",
  },
  checkout_credit_info: {
    ro: "Solicitare Credit 0%",
    ru: "Запрос на кредит 0%",
  },
  checkout_pickup_address: {
    ro: "Adresa: Strada Calea Orheiului 37, MD-2059, Chișinău",
    ru: "Адрес: улица Каля Орхеюлуй 37, MD-2059, Кишинёв",
  },
  checkout_pickup_hours: {
    ro: "Program: Luni-Vineri 9:00-18:00, Sâmbătă 10:00-16:00",
    ru: "Часы работы: Понедельник-Пятница 9:00-18:00, Суббота 10:00-16:00",
  },
  checkout_cash: {
    ro: "Numerar la livrare",
    ru: "Оплата при доставке",
  },
  checkout_cash_description: {
    ro: "Plătești când primești produsele",
    ru: "Оплата при получении товаров",
  },
  checkout_pickup_description: {
    ro: "Ridici produsele direct din magazinul nostru",
    ru: "Заберите товары прямо из нашего магазина",
  },
  checkout_select_period: {
    ro: "Selectează perioada de finanțare:",
    ru: "Выберите период финансирования:",
  },
  checkout_credit_description: {
    ro: "Plătești rate egale fără dobândă.",
    ru: "Платите равными платежами без процентов.",
  },
  checkout_total_order: {
    ro: "Total comandă",
    ru: "Итого заказа",
  },
  checkout_complete: {
    ro: "Finalizează comanda",
    ru: "Завершить заказ",
  },
  checkout_processing: {
    ro: "Procesare comandă...",
    ru: "Оформление заказа...",
  },
  checkout_shipping: {
    ro: "Livrare",
    ru: "Доставка",
  },
  checkout_total: {
    ro: "Total",
    ru: "Итого",
  },
  checkout_free_shipping: {
    ro: "Livrare gratuită pentru toate comenzile",
    ru: "Бесплатная доставка для всех заказов",
  },
  checkout_quality_guarantee: {
    ro: "Garanție de calitate pentru toate produsele",
    ru: "Гарантия качества на все товары",
  },
  checkout_next_steps: {
    ro: "Pașii următori",
    ru: "Следующие шаги",
  },
  checkout_contact_info: {
    ro: "Dacă ai întrebări sau nelămuriri, contactează-ne la +373 60 175 111",
    ru: "Если у вас есть вопросы, свяжитесь с нами по телефону +373 60 175 111",
  },
  checkout_quantity: {
    ro: "Cantitate",
    ru: "Количество",
  },
  checkout_empty_cart_message: {
    ro: "Nu poți finaliza comanda fără produse în coș. Te rugăm să adaugi produse înainte de a continua.",
    ru: "Вы не можете оформить заказ без товаров в корзине. Пожалуйста, добавьте товары перед продолжением.",
  },
  confirmation_order_date: {
    ro: "Data",
    ru: "Дата",
  },
  confirmation_customer_info: {
    ro: "Detalii contact",
    ru: "Контактная информация",
  },
  confirmation_ordered_products: {
    ro: "Produse comandate",
    ru: "Заказанные товары",
  },
  confirmation_email_notification: {
    ro: "Email de confirmare comandă",
    ru: "Подтверждение заказа по электронной почте",
  },
  confirmation_email_sent: {
    ro: "Un email cu detaliile comenzii a fost trimis la adresa",
    ru: "Электронное письмо с деталями заказа было отправлено на адрес",
  },
  confirmation_credit_request_registered: {
    ro: "Cerere de credit înregistrată",
    ru: "Заявка на кредит зарегистрирована",
  },
  confirmation_order_registered_title: {
    ro: "Comandă înregistrată",
    ru: "Заказ зарегистрирован",
  },
  confirmation_order_registered: {
    ro: "comenzii",
    ru: "заказа",
  },
  confirmation_notification: {
    ro: "Veți fi notificat prin email despre statusul comenzii.",
    ru: "Вы получите уведомление о статусе заказа по электронной почте.",
  },
  confirmation_order_number_label: {
    ro: "Număr comandă",
    ru: "Номер заказа",
  },
  confirmation_payment_method: {
    ro: "Metoda de plată",
    ru: "Способ оплаты",
  },
  confirmation_about_credit: {
    ro: "Despre creditul tău",
    ru: "О вашем кредите",
  },
  confirmation_credit_contact: {
    ro: "Specialistul nostru de credit vă va contacta în scurt timp pentru a continua procesul de finanțare.",
    ru: "Наш кредитный специалист свяжется с вами в ближайшее время, чтобы продолжить процесс финансирования.",
  },
  confirmation_after_credit_approval: {
    ro: "După aprobarea creditului, veți fi contactat pentru a semna contractul",
    ru: "После одобрения кредита с вами свяжутся для подписания договора",
  },
  confirmation_credit_contract: {
    ro: "Livrarea produselor se va face după semnarea contractului de credit",
    ru: "Доставка товаров будет осуществляться после подписания кредитного договора",
  },
  confirmation_credit_info: {
    ro: "Află mai multe despre credit",
    ru: "Узнать больше о кредите",
  },
  confirmation_delivery_pickup: {
    ro: "Ridicare din magazin",
    ru: "Самовывоз из магазина",
  },
  confirmation_store_address: {
    ro: "Adresa magazinului",
    ru: "Адрес магазина",
  },
  confirmation_store_hours: {
    ro: "Program de lucru",
    ru: "Часы работы",
  },
  confirmation_monday_friday: {
    ro: "Luni - Vineri: 9:00 - 18:00",
    ru: "Понедельник - Пятница: 9:00 - 18:00",
  },
  confirmation_saturday: {
    ro: "Sâmbătă: 10:00 - 15:00",
    ru: "Суббота: 10:00 - 15:00",
  },
  confirmation_sunday: {
    ro: "Duminică: Închis",
    ru: "Воскресенье: Закрыто",
  },
  confirmation_order_number: {
    ro: "Prezentați numărul comenzii la ridicarea produselor",
    ru: "Укажите номер заказа при получении товаров",
  },
  confirmation_delivery_address: {
    ro: "Livrare la adresa indicată",
    ru: "Доставка по указанному адресу",
  },
  confirmation_delivery_info: {
    ro: "Comanda dvs. va fi livrată la adresa indicată în maxim 1-3 zile lucrătoare.",
    ru: "Ваш заказ будет доставлен по указанному адресу в течение 1-3 рабочих дней.",
  },
  confirmation_delivery_address_label: {
    ro: "Adresa de livrare",
    ru: "Адрес доставки",
  },
  confirmation_delivery_time: {
    ro: "Timp de livrare",
    ru: "Время доставки",
  },
  confirmation_working_days: {
    ro: "1-3 zile lucrătoare",
    ru: "1-3 рабочих дня",
  },
  confirmation_cash_payment: {
    ro: "Plata se va efectua la livrare, în numerar sau prin card bancar",
    ru: "Оплата производится при доставке наличными или банковской картой",
  },
  confirmation_continue_shopping: {
    ro: "Continuă cumpărăturile",
    ru: "Продолжить покупки",
  },
  confirmation_back_to_home: {
    ro: "Înapoi la pagina principală",
    ru: "Вернуться на главную страницу",
  },
  confirmation_total_products: {
    ro: "Total produse",
    ru: "Всего товаров",
  },
  // Form validation errors
  checkout_error_firstname_required: {
    ro: "Prenumele este obligatoriu",
    ru: "Имя обязательно",
  },
  checkout_error_lastname_required: {
    ro: "Numele este obligatoriu",
    ru: "Фамилия обязательна",
  },
  checkout_error_email_required: {
    ro: "Email-ul este obligatoriu",
    ru: "Электронная почта обязательна",
  },
  checkout_error_phone_required: {
    ro: "Telefonul este obligatoriu",
    ru: "Телефон обязателен",
  },
  checkout_error_address_required: {
    ro: "Adresa este obligatorie",
    ru: "Адрес обязателен",
  },
  checkout_error_city_required: {
    ro: "Orașul este obligatoriu",
    ru: "Город обязателен",
  },
  checkout_error_email_invalid: {
    ro: "Adresa de email nu este validă",
    ru: "Неверный формат электронной почты",
    },
  showing: {
    ro: "Afișând",
    ru: "Показываем",
  },
  random_products: {
    ro: "produse aleatorii",
    ru: "случайные товары",
  },
  adding_to_cart: {
    ro: "Se adaugă în coș...",
    ru: "Добавляется в корзину...",
  },

  checkout_error_phone_invalid: {
    ro: "Numărul de telefon nu este valid",
    ru: "Неверный формат телефона",
  },
  checkout_error_incomplete_form: {
    ro: "Formular incomplet",
    ru: "Неполная форма",
  },
  checkout_error_complete_required_fields: {
    ro: "Te rugăm să completezi toate câmpurile obligatorii",
    ru: "Пожалуйста, заполните все обязательные поля",
  },
  checkout_pickup_placeholder: {
    ro: "Ridicare din magazin",
    ru: "Самовывоз из магазина",
  },
  checkout_city_chisinau: {
    ro: "Chișinău",
    ru: "Кишинёв",
  },
  checkout_term_months: {
    ro: "{term} luni",
    ru: "{term} месяцев",
  },
  checkout_notes_placeholder: {
    ro: "Adaugă notițe pentru comanda ta",
    ru: "Добавьте примечания к вашему заказу",
  },

  checkout_back_to_cart: {
    ro: "Înapoi la coș",
    ru: "Вернуться в корзину",
  },
  checkout_notes: {
    ro: "Note",
    ru: "Примечания",
  },
  checkout_period: {
    ro: "Perioada",
    ru: "Период",
  },
  checkout_monthly_rate: {
    ro: "Rata lunară",
    ru: "Ежемесячный платеж",
  },
  checkout_subtotal: {
    ro: "Subtotal",
    ru: "Промежуточный итог",
  },
  checkout_months: {
    ro: "luni",
    ru: "месяцев",
  },
  // Adding missing checkout keys
  checkout_products: {
    ro: "produse",
    ru: "товары",
  },
  checkout_view_details: {
    ro: "Vezi detalii",
    ru: "Посмотреть детали",
  },
  item: {
    ro: "produs",
    ru: "товар",
  },
  items: {
    ro: "produse",
    ru: "товары",
  },
  preview_product: {
    ro: "Previzualizare",
    ru: "Предпросмотр",
  },
  popular_brands: {
    ro: "Magazin de electronice și electrocasnice",
    ru: "Магазин электроники и бытовой техники",
  },
  // Shopping cart page messages

  // Category and subcategory translations
  popular_categories: {
    ro: "CATEGORII POPULARE",
    ru: "ПОПУЛЯРНЫЕ КАТЕГОРИИ",
  },
  add_to_cart: {
    ro: "Adaugă în coș",
    ru: "Добавить в корзину",
  },
  adding: {
    ro: "Se adaugă în coș...",
    ru: "Добавляется в корзину...",
  },
  // Main categories from mock-data.tsx

  smartphones: {
    ro: "Smartphone-uri",
    ru: "Смартфоны",
  },
  tablets: {
    ro: "Tablete",
    ru: "Планшеты",
  },
  tvs: {
    ro: "Televizoare",
    ru: "Телевизоры",
  },
  headphones: {
    ro: "Căști",
    ru: "Наушники",
  },
  smartwatches: {
    ro: "Smartwatch-uri",
    ru: "Смарт-часы",
  },
  consoles: {
    ro: "Console",
    ru: "Игровые консоли",
  },
  vacuums: {
    ro: "Aspiratoare",
    ru: "Пылесосы",
  },

  // Subcategories from main categories
  // Laptop subcategories
  notebooks: {
    ro: "Notebook-uri",
    ru: "Ноутбуки",
  },
  gaming: {
    ro: "Gaming",
    ru: "Игровые",
  },
  ultrabooks: {
    ro: "Ultrabook-uri",
    ru: "Ультрабуки",
  },
  business: {
    ro: "Business",
    ru: "Бизнес",
  },
  apple: {
    ro: "Apple MacBook",
    ru: "Apple MacBook",
  },

  // Smartphone subcategories
  iphone: {
    ro: "iPhone",
    ru: "iPhone",
  },
  samsung: {
    ro: "Samsung",
    ru: "Samsung",
  },
  xiaomi: {
    ro: "Xiaomi",
    ru: "Xiaomi",
  },
  huawei: {
    ro: "Huawei",
    ru: "Huawei",
  },
  budget: {
    ro: "Buget",
    ru: "Бюджетные",
  },

  // Tablet subcategories
  ipad: {
    ro: "iPad",
    ru: "iPad",
  },
  android: {
    ro: "Android",
    ru: "Android",
  },
  windows: {
    ro: "Windows",
    ru: "Windows",
  },

  // TV subcategories
  smart: {
    ro: "Smart TV",
    ru: "Smart TV",
  },
  "4k": {
    ro: "4K Ultra HD",
    ru: "4K Ultra HD",
  },
  oled: {
    ro: "OLED",
    ru: "OLED",
  },
  qled: {
    ro: "QLED",
    ru: "QLED",
  },

  // Headphone subcategories
  wireless: {
    ro: "Wireless",
    ru: "Беспроводные",
  },
  earbuds: {
    ro: "Earbuds",
    ru: "Наушники-вкладыши",
  },
  "gaming-headsets": {
    ro: "Gaming",
    ru: "Игровые",
  },
  "noise-cancelling": {
    ro: "Anulare zgomot",
    ru: "С шумоподавлением",
  },

  // Smartwatch subcategories
  "apple-watch": {
    ro: "Apple Watch",
    ru: "Apple Watch",
  },
  "samsung-watch": {
    ro: "Samsung Watch",
    ru: "Samsung Watch",
  },
  fitness: {
    ro: "Fitness",
    ru: "Фитнес",
  },

  // Console subcategories
  playstation: {
    ro: "PlayStation",
    ru: "PlayStation",
  },
  xbox: {
    ro: "Xbox",
    ru: "Xbox",
  },
  nintendo: {
    ro: "Nintendo",
    ru: "Nintendo",
  },
  accessories: {
    ro: "Accesorii",
    ru: "Аксессуары",
  },

  // Vacuum subcategories
  robot: {
    ro: "Roboți",
    ru: "Роботы-пылесосы",
  },
  handheld: {
    ro: "Portabile",
    ru: "Портативные",
  },
  upright: {
    ro: "Verticale",
    ru: "Вертикальные",
  },

  // Category keys from mockGridSubcategories

  category_tablets: {
    ro: "Tablete",
    ru: "Планшеты",
  },

  subcategory_washingmachines: {
    ro: "Mașini de spălat",
    ru: "Стиральные машины",
  },
  subcategory_dryers: {
    ro: "Uscătoare",
    ru: "Сушильные машины",
  },
  subcategory_phonecase: {
    ro: "Huse telefon",
    ru: "Чехлы для телефонов",
  },

  subcategory_smartwatch: {
    ro: "Smartwatch",
    ru: "Умные часы",
  },
  subcategory_fridges: {
    ro: "Frigidere",
    ru: "Холодильники",
  },
  subcategory_monitors: {
    ro: "Monitoare",
    ru: "Мониторы",
  },
  subcategory_speakers: {
    ro: "Boxe Bluetooth",
    ru: "Bluetooth колонки",
  },
  subcategory_chargers: {
    ro: "Încărcătoare",
    ru: "Зарядные устройства",
  },
  subcategory_gaming: {
    ro: "Console gaming",
    ru: "Игровые консоли",
  },
  subcategory_routers: {
    ro: "Routere",
    ru: "Роутеры",
  },

  // Add missing category translations
  category_laptops: {
    ro: "Laptopuri",
    ru: "Ноутбуки",
  },
  category_smartphones: {
    ro: "Smartphone-uri",
    ru: "Смартфоны",
  },
  category_tvs: {
    ro: "Televizoare",
    ru: "Телевизоры",
  },
  category_headphones: {
    ro: "Căști",
    ru: "Наушники",
  },
  category_smartwatches: {
    ro: "Smartwatch-uri",
    ru: "Смарт-часы",
  },
  category_consoles: {
    ro: "Console",
    ru: "Консоли",
  },
  category_vacuums: {
    ro: "Aspiratoare",
    ru: "Пылесосы",
  },

  // Add missing subcategory translations
  subcategory_notebooks: {
    ro: "Notebook-uri",
    ru: "Ноутбуки",
  },
  subcategory_ultrabooks: {
    ro: "Ultrabook-uri",
    ru: "Ультрабуки",
  },
  subcategory_business: {
    ro: "Business",
    ru: "Бизнес",
  },
  subcategory_apple_macbook: {
    ro: "Apple MacBook",
    ru: "Apple MacBook",
  },
  subcategory_iphone: {
    ro: "iPhone",
    ru: "iPhone",
  },
  subcategory_samsung: {
    ro: "Samsung",
    ru: "Samsung",
  },
  subcategory_xiaomi: {
    ro: "Xiaomi",
    ru: "Xiaomi",
  },

  subcategory_huawei: {
    ro: "Huawei",
    ru: "Huawei",
  },
  quick_view: {
    ro: "Vezi detalii",
    ru: "Посмотреть детали",
  },
  subcategory_budget: {
    ro: "Buget",
    ru: "Бюджетные",
  },
  subcategory_ipad: {
    ro: "iPad",
    ru: "iPad",
  },
  subcategory_android_tablets: {
    ro: "Android",
    ru: "Android",
  },
  subcategory_windows_tablets: {
    ro: "Windows",
    ru: "Windows",
  },
  subcategory_smart_tv: {
    ro: "Smart TV",
    ru: "Smart TV",
  },
  subcategory_4k: {
    ro: "4K Ultra HD",
    ru: "4K Ultra HD",
  },
  subcategory_oled: {
    ro: "OLED",
    ru: "OLED",
  },
  subcategory_qled: {
    ro: "QLED",
    ru: "QLED",
  },
  subcategory_wireless: {
    ro: "Wireless",
    ru: "Беспроводные",
  },
  subcategory_earbuds: {
    ro: "Earbuds",
    ru: "Наушники-вкладыши",
  },
  subcategory_gaming_headsets: {
    ro: "Gaming",
    ru: "Игровые",
  },
  subcategory_noise_cancelling: {
    ro: "Anulare zgomot",
    ru: "Шумоподавление",
  },
  subcategory_apple_watch: {
    ro: "Apple Watch",
    ru: "Apple Watch",
  },
  subcategory_samsung_watch: {
    ro: "Samsung Watch",
    ru: "Samsung Watch",
  },
  subcategory_fitness: {
    ro: "Fitness",
    ru: "Фитнес",
  },
  subcategory_playstation: {
    ro: "PlayStation",
    ru: "PlayStation",
  },
  subcategory_xbox: {
    ro: "Xbox",
    ru: "Xbox",
  },
  subcategory_nintendo: {
    ro: "Nintendo",
    ru: "Nintendo",
  },
  subcategory_console_accessories: {
    ro: "Accesorii",
    ru: "Аксессуары",
  },
  subcategory_robot_vacuums: {
    ro: "Roboți",
    ru: "Роботы-пылесосы",
  },
  subcategory_handheld_vacuums: {
    ro: "Portabile",
    ru: "Портативные",
  },
  subcategory_upright_vacuums: {
    ro: "Verticale",
    ru: "Вертикальные",
  },
  pagination_previous: {
    ro: "Precedent",
    ru: "Предыдущий",
  },
  pagination_next: {
    ro: "Următor",
    ru: "Следующий",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ro");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "ro" || savedLang === "ru")) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

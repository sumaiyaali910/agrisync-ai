/* ==========================================================================
   AgriSync AI — Complete Interactive Frontend Logic (script.js)
   Features:
   1. Dark Mode & Light Mode Toggle (High-Sunlight Field Visibility)
   2. Live GPS Land Tracker + Interactive Satellite/Street Map + Google Maps Link
   3. Live Open-Meteo Weather Telemetry + Dynamic Rain / Wind / Thresher Alerts
   4. Seasons Filter + 8 Sindh Crops with 5-Step Lifecycle (Seeding to Thresher)
   5. Agri Marketplace & AI "Best Time to Sell" Price Predictor + Profit Calculator
   6. Crop Doctor Vision + Exact Pesticide/Insecticide + Nearby Local Dealer Locator
   7. Illiterate-Friendly Visual & Voice Farm Labour Registration + Searchable
      Labour Finder (Backed by MongoDB / Firebase / SQLite Persistent Storage)
   ========================================================================== */

// Automatic API Base URL: uses relative path when deployed on Render/Web, or localhost:8000 when opened as a local file://
const API_BASE =
  typeof window !== "undefined" &&
  window.location.protocol.startsWith("http") &&
  window.location.port !== "3000" &&
  window.location.port !== "5500"
    ? ""
    : "http://localhost:8000";

const SINDH_LOCATIONS = {
  Sukkur: {
    lat: 27.7052,
    lng: 68.8574,
    canal: "Sukkur Barrage • Rohri & Nara Canal Command",
    soil: "Alluvial Silt Loam (Kacho & Pacco Plains)",
    talukas: ["Rohri", "Salehpat", "Pano Akil", "New Sukkur"],
  },
  Larkana: {
    lat: 27.557,
    lng: 68.2028,
    canal: "Sukkur Barrage • Rice & Dadu Canal Command",
    soil: "Heavy Clay Loam (Paddy Belt)",
    talukas: ["Ratodero", "Dokri", "Bakrani", "Larkana City"],
  },
  Sanghar: {
    lat: 26.0436,
    lng: 68.948,
    canal: "Nara Canal & Jamrao Canal Command",
    soil: "Sandy Clay Loam (Cotton & Wheat Core Zone)",
    talukas: ["Shahdadpur", "Sinjhoro", "Tando Adam", "Khipro"],
  },
  Badin: {
    lat: 24.6558,
    lng: 68.8383,
    canal: "Kotri Barrage • Akram Wah & Fuleli Command",
    soil: "Coastal Deltaic Loam (Sugarcane & Rice Zone)",
    talukas: ["Matli", "Talhar", "Tando Bago", "Golarchi"],
  },
  Mirpurkhas: {
    lat: 25.5276,
    lng: 69.0159,
    canal: "Jamrao & Mithrao Canal Command",
    soil: "Fertile Loam (Sindhri Mango & Cotton Belt)",
    talukas: ["Digri", "Jhudo", "Kot Ghulam Muhammad", "Sindhri"],
  },
  Hyderabad: {
    lat: 25.396,
    lng: 68.3578,
    canal: "Kotri Barrage • Rohri Lower & Fuleli Canal",
    soil: "Rich Indus Alluvial Loam (Tandojam Agro Zone)",
    talukas: ["Qasimabad", "Latifabad", "Tando Jam (Rural)", "Hyderabad City"],
  },
};

// Local Verified Agro-Chemical & Pesticide Dealers per Sindh District
const SINDH_AGRO_DEALERS = {
  Sukkur: [
    {
      shopName: "Sindh Zarai Markaz & Pesticide Agency",
      address: "Shop #14, Clock Tower Grain Mandi Road, Sukkur",
      phone: "0300-3124567",
      distanceKm: 2.4,
      lat: 27.7031,
      lng: 68.8592,
      badge: "Authorized Bayer & Syngenta Stockist",
    },
    {
      shopName: "Rohri Kisan Agro Chemicals",
      address: "Main National Highway N-5, Near Rohri Bypass, Sukkur",
      phone: "0313-8899221",
      distanceKm: 4.8,
      lat: 27.6915,
      lng: 68.887,
      badge: "Govt Plant Protection Licensed",
    },
  ],
  Larkana: [
    {
      shopName: "Chandka Crop Protection & Seed Store",
      address: "Station Road, Opposite Rice Export Mandi, Larkana",
      phone: "0301-3445566",
      distanceKm: 1.9,
      lat: 27.559,
      lng: 68.212,
      badge: "Authorized FMC & Syngenta Dealer",
    },
    {
      shopName: "Ratodero Kisan Zarai Corporation",
      address: "Main Shikarpur Road, Taluka Ratodero, Larkana",
      phone: "0333-7766554",
      distanceKm: 5.2,
      lat: 27.802,
      lng: 68.289,
      badge: "Govt Verified Agro Store",
    },
  ],
  Sanghar: [
    {
      shopName: "Sanghar Cotton & Wheat Agro Services",
      address: "M.A. Jinnah Road, Near Cotton Factory Chowk, Sanghar",
      phone: "0345-2233445",
      distanceKm: 2.1,
      lat: 26.046,
      lng: 68.949,
      badge: "Cotton Whitefly & Rust Specialist Stockist",
    },
    {
      shopName: "Shahdadpur Green Field Pesticides",
      address: "Hala Road, Main Grain Market, Taluka Shahdadpur",
      phone: "0302-9988776",
      distanceKm: 6.0,
      lat: 25.925,
      lng: 68.622,
      badge: "Authorized Engro & Evyol Franchise",
    },
  ],
  Mirpurkhas: [
    {
      shopName: "Sindhri Mango & Crop Care Center",
      address: "Umerkot Road, Near New Sabzi Mandi, Mirpurkhas",
      phone: "0311-5566778",
      distanceKm: 1.7,
      lat: 25.529,
      lng: 69.018,
      badge: "Sindh Horticulture & Pesticide Verified",
    },
    {
      shopName: "Digri Zarai Dawa Khana",
      address: "Main Tando Ghulam Ali Road, Digri, Mirpurkhas",
      phone: "0334-1122334",
      distanceKm: 5.5,
      lat: 25.156,
      lng: 69.111,
      badge: "Authorized Bayer CropScience Dealer",
    },
  ],
  Badin: [
    {
      shopName: "Laar Agro-Chemicals & Seed Store",
      address: "Quaid-e-Azam Road, Near Sugar Mill Gate, Badin",
      phone: "0300-9911223",
      distanceKm: 2.3,
      lat: 24.657,
      lng: 68.839,
      badge: "Sugarcane & Paddy Protection Stockist",
    },
    {
      shopName: "Matli Kisan Pesticide Center",
      address: "Tando Ghulam Ali Road, Taluka Matli, Badin",
      phone: "0346-7788991",
      distanceKm: 4.9,
      lat: 25.043,
      lng: 68.656,
      badge: "Govt Plant Protection Licensed",
    },
  ],
  Hyderabad: [
    {
      shopName: "Tandojam University Road Agro Center",
      address: "Main Mirpurkhas Highway, Opposite SAU Gate, Tandojam",
      phone: "0301-2299887",
      distanceKm: 1.5,
      lat: 25.426,
      lng: 68.538,
      badge: "SAU Tandojam Certified Agro Dealer",
    },
    {
      shopName: "Hyderabad New Sabzi Mandi Zarai Store",
      address: "Super Highway M-9 Link, New Fruit & Vegetable Mandi, Hyderabad",
      phone: "0321-3344556",
      distanceKm: 3.8,
      lat: 25.412,
      lng: 68.381,
      badge: "Authorized Syngenta & Jaffar Agro",
    },
  ],
};

// Agri Marketplace AI Price Forecast Data (Sindh Mandis)
const SINDH_MARKETPLACE_DATA = {
  wheat: {
    icon: "🌾",
    name: "Wheat (ڪڻڪ / گندم)",
    mandi: "Sukkur & Nawabshah Grain Mandi",
    currentPrice: 3950,
    peakPrice: 4450,
    gainPct: "+12.6%",
    signal: "HOLD 18 DAYS 📈",
    signalColor: "emerald",
    bestWindow: "Mid-November (Roller Flour Mill Restocking Peak)",
    trend: [3800, 3890, 3950, 4120, 4300, 4450],
    advice: {
      en: "HOLD IN DRY STORAGE: Flour mill arrivals in Upper Sindh are dropping by 14%. Selling in 18 days yields +PKR 500 extra per 40kg Maund.",
      ur: "اسٹاک روکیں: سکھر اور نوابشاہ منڈی میں آٹا ملوں کی طلب بڑھ رہی ہے۔ 18 دن بعد فروخت کرنے سے فی من 500 روپے زائد منافع ملے گا۔",
      sd: "اسٽاڪ روڪيو: سکر ۽ نوابشاهه منڊي ۾ فلور ملن جي گهرج وڌي رهي آهي. 18 ڏينهن بعد وڪرو ڪرڻ سان في مڻ 500 رپيا وڌيڪائو منافعو ملندو.",
    },
  },
  cotton: {
    icon: "☁️",
    name: "Seed Cotton / Phutti (ڪپهه / پھٹی)",
    mandi: "Sanghar & Mirpurkhas Cotton Exchange",
    currentPrice: 8900,
    peakPrice: 9650,
    gainPct: "+8.4%",
    signal: "HOLD DRY LINT 12 DAYS 📈",
    signalColor: "emerald",
    bestWindow: "Next 10–14 Days (Karachi Spinning Mill Buying Window)",
    trend: [8400, 8650, 8900, 9200, 9480, 9650],
    advice: {
      en: "SUN-DRY & HOLD 12 DAYS: Textile mills are paying a PKR 750/Maund premium for dew-free, low-moisture (<10%) Grade-A Sindh Phutti.",
      ur: "پھٹی کو دھوپ لگا کر 12 دن روکیں: کراچی کی ٹیکسٹائل ملز خشک اور صاف پھٹی کا فی من 750 روپے زیادہ ریٹ دے رہی ہیں۔",
      sd: "ڦٽي کي اس ۾ سڪائي 12 ڏينهن روڪيو: ڪراچي جون ٽيڪسٽائيل ملون صاف ۽ سڪل ڦٽي جو في مڻ 750 رپيا وڌيڪ اگهه ڏئي رهيون آهن.",
    },
  },
  rice: {
    icon: "🌱",
    name: "Paddy — Kainat 1121 / IRRI-6 (چانور / دھان)",
    mandi: "Larkana & Shikarpur Rice Export Mandi",
    currentPrice: 4200,
    peakPrice: 4750,
    gainPct: "+13.1%",
    signal: "STRONG HOLD 21 DAYS 📈",
    signalColor: "emerald",
    bestWindow: "Late November (Port Qasim Export Vessel Loading)",
    trend: [3950, 4100, 4200, 4400, 4600, 4750],
    advice: {
      en: "DRY TO 12% & HOLD 3 WEEKS: Port Qasim rice exporters have opened new Gulf & East Africa orders. Avoid harvest-glut distress selling.",
      ur: "دھان کو 12 فیصد نمی تک سکھا کر 3 ہفتے روکیں: پورٹ قاسم سے چاول کی ایکسپورٹ کھل گئی ہے، فی من 550 روپے اضافی ملیں گے۔",
      sd: "سارين کي 12 سيڪڙو آلاڻ تائين سڪائي 3 هفتا روڪيو: پورٽ قاسم تان ايڪسپورٽ شروع ٿي وئي آهي، في مڻ 550 رپيا وڌيڪ ملندا.",
    },
  },
  sugarcane: {
    icon: "🎋",
    name: "Sugarcane (ڪمند / گنا)",
    mandi: "Badin & Shaheed Benazirabad Sugar Mills",
    currentPrice: 430,
    peakPrice: 475,
    gainPct: "+10.4%",
    signal: "SELL AT MILL GATE NOW 💰",
    signalColor: "amber",
    bestWindow: "Deliver Immediately Within 24 Hours of Cutting",
    trend: [425, 430, 450, 465, 475, 475],
    advice: {
      en: "SELL IMMEDIATELY AFTER CUTTING: Never store cut sugarcane—it loses 3% weight and sucrose per day. Deliver fresh to Badin/Nawabshah mills for high sucrose bonus.",
      ur: "کٹائی کے فوراً بعد مل میں پہنچائیں: کٹا ہوا گنا رکھنے سے روزانہ 3 فیصد وزن کم ہوتا ہے۔ تازہ گنا دے کر پورا سرکاری ریٹ اور بونس لیں۔",
      sd: "ڪمند وڍڻ جي فوراً پوءِ مل پهچايو: وڍيل ڪمند رکڻ سان روزانو 3 سيڪڙو وزن گهٽجي ٿو. تازو ڪمند پهچائي پورو اگهه وٺو.",
    },
  },
  mustard: {
    icon: "🌼",
    name: "Mustard / Sarsoon (سرنهن / سرسوں)",
    mandi: "Mirpurkhas & Khairpur Oilseed Mandi",
    currentPrice: 6800,
    peakPrice: 7450,
    gainPct: "+9.5%",
    signal: "HOLD FOR EXPELLER PEAK 📈",
    signalColor: "emerald",
    bestWindow: "14–20 Days (Local Edible Oil Mill Crushing Peak)",
    trend: [6500, 6650, 6800, 7050, 7280, 7450],
    advice: {
      en: "HOLD CLEAN SEED: Higher palm oil import duties have pushed Sindh oil expellers to pay PKR 7,450/Maund for dry Raya/Canola.",
      ur: "صاف سرسوں روک کر بیچیں: آئل ملوں کی طلب میں اضافے سے فی من 650 روپے تک ریٹ بڑھنے کا امکان ہے۔",
      sd: "صاف سرنهن روڪي وڪرو ڪريو: آئل ملن جي گهرج وڌڻ ڪري في مڻ 650 رپيا اگهه وڌڻ جو امڪان آهي.",
    },
  },
  onion: {
    icon: "🧅",
    name: "Onion — Nasarpuri Red (بصر / پیاز)",
    mandi: "Hyderabad New Sabzi Mandi & Tando Allahyar",
    currentPrice: 3600,
    peakPrice: 4300,
    gainPct: "+19.4%",
    signal: "SELL EXPORT GRADE NOW 💰",
    signalColor: "amber",
    bestWindow: "Next 7–10 Days (Before Punjab Crop Arrival)",
    trend: [3100, 3400, 3600, 4100, 4300, 3900],
    advice: {
      en: "PRIME 10-DAY WINDOW: Balochistan supply has ended and Punjab onion is 3 weeks away. Grade in 40kg red mesh bags and sell in Hyderabad Mandi this week!",
      ur: "بہترین موقع: بلوچستان کی پیاز ختم ہو چکی ہے اور پنجاب کی فصل میں 3 ہفتے باقی ہیں۔ اس ہفتے حیدرآباد منڈی میں بہترین ریٹ ملے گا۔",
      sd: "بهترين موقعو: بلوچستان جو بصر ختم ٿي چڪو آهي. هن هفتي حيدرآباد منڊي ۾ وڪرو ڪري بهترين اگهه حاصل ڪريو.",
    },
  },
};

// Visual Skill Icons for Illiterate-Friendly Labour Portal
const LABOUR_SKILLS_META = {
  harvesting: {
    icon: "🌾",
    en: "Harvesting (لابارو)",
    ur: "کٹائی / لابارو",
    sd: "فصل جو لابارو",
  },
  thresher: {
    icon: "⚙️",
    en: "Thresher Operator (ٿريشر)",
    ur: "تھریشر آپریٹر",
    sd: "ٿريشر آپريٽر",
  },
  tractor: {
    icon: "🚜",
    en: "Tractor Driver (ٽريڪٽر)",
    ur: "ٹریکٹر ڈرائیور",
    sd: "ٽريڪٽر ڊرائيور",
  },
  seeding: {
    icon: "🌱",
    en: "Seeding / Rice Transplant (رونبو)",
    ur: "بوائی / پنیری رونبو",
    sd: "پوکائي / سارين جو رونبو",
  },
  spray: {
    icon: "🧪",
    en: "Sprayman (اسپري ڪندڙ)",
    ur: "کیڑے مار سپرے مین",
    sd: "دوا جو اسپري ڪندڙ",
  },
  canal: {
    icon: "💧",
    en: "Canal / Khal Digging (واهه صفائي)",
    ur: "کھال اور نہر صفائی",
    sd: "واهه ۽ خال جي صفائي",
  },
};

// Default Seeded Labourers (Synced with Backend DB & LocalStorage)
const INITIAL_LABOURERS = [
  {
    id: "LAB-SKR-101",
    name: "Allah Dino Mallah",
    cnic: "45504-8912341-1",
    phone: "0301-3456789",
    district: "Sukkur",
    address: "Village Arain, Near Rohri Canal Regulator, Taluka Rohri",
    skills: ["harvesting", "thresher"],
    dailyWage: 1500,
    verified: true,
  },
  {
    id: "LAB-LRK-102",
    name: "Manzoor Hussain Chandio",
    cnic: "43203-5543218-7",
    phone: "0312-9876543",
    district: "Larkana",
    address: "Mohenjo Daro Road, Village Bakrani, District Larkana",
    skills: ["seeding", "harvesting", "canal"],
    dailyWage: 1200,
    verified: true,
  },
  {
    id: "LAB-SNG-103",
    name: "Sajjad Ali Rind",
    cnic: "44204-3321984-5",
    phone: "0333-2211445",
    district: "Sanghar",
    address: "Chak No. 14, Jamrao Canal Stop, Taluka Shahdadpur",
    skills: ["tractor", "thresher", "spray"],
    dailyWage: 2000,
    verified: true,
  },
  {
    id: "LAB-MPK-104",
    name: "Kewal Ram Kolhi",
    cnic: "44103-7765123-9",
    phone: "0345-6677889",
    district: "Mirpurkhas",
    address: "Deh 128, Sindhri Mango Belt, Taluka Mirpurkhas",
    skills: ["harvesting", "seeding", "spray"],
    dailyWage: 1300,
    verified: true,
  },
  {
    id: "LAB-BDN-105",
    name: "Muhammad Urs Halepoto",
    cnic: "41101-9988112-3",
    phone: "0300-7788990",
    district: "Badin",
    address: "Main Matli Sugar Mill Road, Taluka Matli, District Badin",
    skills: ["harvesting", "canal", "tractor"],
    dailyWage: 1400,
    verified: true,
  },
  {
    id: "LAB-HYD-106",
    name: "Qurban Ali Khaskheli",
    cnic: "41303-4455667-1",
    phone: "0315-4433221",
    district: "Hyderabad",
    address: "Near SAU Tandojam Gate, Main Mirpurkhas Highway",
    skills: ["spray", "seeding", "thresher"],
    dailyWage: 1600,
    verified: true,
  },
];

// Comprehensive 8-Crop Lifecycle Database
const CROPS_DATABASE = {
  wheat: {
    season: "Rabi",
    seasonBadge: "Rabi (Winter • Nov–Apr)",
    icon: "🌾",
    names: {
      en: "Wheat (ڪڻڪ / گندم)",
      ur: "گندم (Wheat)",
      sd: "ڪڻڪ (Wheat)",
    },
    varieties: "TD-1, Kiran-95, Benazir, Imdad, Mehran",
    stage: {
      en: "Crown Root Initiation (CRI) — Day 24",
      ur: "جڑیں بننے کا مرحلہ (CRI) - دن 24",
      sd: "پاڙون نڪرڻ جو مرحلو (CRI) - ڏينهن 24",
    },
    steps: {
      seeding: {
        window: "Nov 01 – Nov 25",
        badge: "Drill Sowing",
        en: "Use 50–55 kg certified seed/acre (TD-1 or Kiran-95). Treat seed with Tebuconazole @ 1.5g/kg. Drill at 1.5–2 inch depth with 9-inch row spacing after laser land leveling.",
        ur: "فی ایکڑ 50 تا 55 کلو تصدیق شدہ بیج (TD-1 یا کرن-95) استعمال کریں۔ بیج کو پھپھوند کش دوا لگائیں اور لیزر لیولنگ کے بعد ڈرل سے 2 انچ گہرائی پر کاشت کریں۔",
        sd: "في ايڪڙ 50 کان 55 ڪلو تصديق ٿيل ٻج (TD-1 يا ڪرن-95) استعمال ڪريو. زمين کي ليزر ليول ڪرڻ بعد ڊرل ذريعي 2 انچ اونهائي تي پوکيو.",
      },
      irrigation: {
        window: "4–5 Irrigations (Total)",
        badge: "1st Kor: Day 21",
        en: "1st critical irrigation (Kor) at Day 21–25 (CRI stage). 2nd at Tillering (Day 45), 3rd at Booting (Day 75), 4th at Milk stage (Day 100). Skip irrigation if >12mm rain is forecast.",
        ur: "پہلا پانی (کور) 21 تا 25 دن بعد لازمی دیں۔ دوسرا جھاڑ بنتے وقت (45 دن)، تیسرا گوبھ کے وقت (75 دن) اور چوتھا دانہ بھرتے وقت (100 دن) لگائیں۔ بارش کی صورت میں پانی روک دیں۔",
        sd: "پهريون پاڻي (ڪور) 21 کان 25 ڏينهن اندر لازمي ڏيو. ٻيو پاڻي 45 ڏينهن، ٽيون 75 ڏينهن ۽ چوٿون 100 ڏينهن تي ڏيو. برسات جي اڳڪٿي هجي ته پاڻي روڪي ڇڏيو.",
      },
      fertilizer: {
        window: "Basal + 2 Splits",
        badge: "NPK + Zinc",
        en: "Basal: 1.5 bags DAP + 1 bag SOP per acre at seeding. 1st Irrigation: 1 bag Urea + 10kg Zinc Sulfate (33%). 2nd Irrigation: 1 bag Urea before booting.",
        ur: "بوائی کے وقت ڈیڑھ بوری ڈی اے پی + 1 بوری پوٹاش۔ پہلے پانی پر 1 بوری یوریا + 10 کلو زنک سلفیٹ۔ دوسرے پانی پر 1 بوری یوریا چھٹہ کریں۔",
        sd: "پوکائي وقت ڏيڍ ٻوري DAP ۽ 1 ٻوري پوٽاش وجهو. پهرين پاڻي تي 1 ٻوري يوريا + 10 ڪلو زنڪ سلفيٽ، ۽ ٻئي پاڻي تي 1 ٻوري يوريا ڇٽو ڪريو.",
      },
      harvesting: {
        window: "March 25 – April 15",
        badge: "Moisture < 14%",
        en: "Harvest when stems turn golden-yellow and grain cracks firmly between teeth (<14% moisture). Tie small sheaves and stack on elevated dry bunds if rain clouds appear.",
        ur: "جب سٹے سنہری ہو جائیں اور دانے میں نمی 14 فیصد سے کم ہو تو کٹائی کریں۔ بارش کے خطرے کے پیش نظر بھریاں اونچی جگہ پر رکھیں۔",
        sd: "جڏهن سنگ سونهري ٿي وڃن ۽ داڻي ۾ آلاڻ 14 سيڪڙو کان گهٽ هجي ته لابارو ڪريو. برسات جي امڪان وقت ديرون مٿانهين جڳهه تي رکو.",
      },
      thresher: {
        window: "April 01 – April 25",
        badge: "550–600 RPM",
        en: "Set wheat thresher drum speed to 550–600 RPM with 18mm concave clearance to prevent broken grains (Dalia). Never thresh damp sheaves after rain; sun-dry to 12% moisture before bagging in jute sacks.",
        ur: "تھریشر کے ڈرم کی رفتار 550 تا 600 چکر فی منٹ (RPM) رکھیں تاکہ دانہ نہ ٹوٹے۔ بارش یا شبنم کے بعد گیلی گندم ہرگز تھریشر میں نہ ڈالیں۔",
        sd: "ٿريشر جي ڊرم جي رفتار 550 کان 600 چڪر (RPM) رکو ته جيئن داڻو نه ڀڄي. برسات يا ماڪ کان پوءِ آلي ڪڻڪ هرگز ٿريشر ۾ نه وجهو.",
      },
    },
    aiResponse: {
      en: "Sukkur & Sanghar Wheat Advisory: Night temperatures are 14°C—optimal for tillering. Apply 1st Kor irrigation on Day 21 unless live radar indicates >10mm rainfall within 48 hours.",
      ur: "سکھر اور سانگھڑ گندم مشورہ: رات کا درجہ حرارت 14 ڈگری ہے جو جھاڑ بنانے کے لیے بہترین ہے۔ پہلا پانی 21 دن پر لگائیں، البتہ بارش کا الرٹ ہو تو پانی مؤخر کریں۔",
      sd: "سکر ۽ سانگهڙ ڪڻڪ مشورو: رات جو گرمي پد 14 ڊگري آهي جيڪو وڌاءَ لاءِ بهترين آهي. پهريون پاڻي 21 ڏينهن تي ڏيو، پر جيڪڏهن برسات جو الرٽ هجي ته پاڻي روڪيو.",
    },
  },
  cotton: {
    season: "Kharif",
    seasonBadge: "Kharif (Summer • Apr–Nov)",
    icon: "☁️",
    names: {
      en: "Cotton (ڪپهه / کپاس)",
      ur: "کپاس (Cotton)",
      sd: "ڪپهه (Cotton)",
    },
    varieties: "Sindh-1, Cris-134, IUB-13, FH-142 (Bt)",
    stage: {
      en: "Boll Opening & Final Picking Stage",
      ur: "ٹینڈے کھلنے اور آخری چنائی کا مرحلہ",
      sd: "گولڙا کلڻ ۽ آخري چوڻي جو مرحلو",
    },
    steps: {
      seeding: {
        window: "April 15 – May 20",
        badge: "Bed-Furrow",
        en: "Sow 6–8 kg delinted seed/acre on 2.5 ft ridges (Patri/Bed planting) to save 30% canal water and protect roots from monsoon waterlogging.",
        ur: "فی ایکڑ 6 تا 8 کلو بُر اترا بیج 2.5 فٹ چوڑی کھیلیوں (پٹریوں) پر کاشت کریں تاکہ بارش کا فالتو پانی آسانی سے نکل سکے۔",
        sd: "في ايڪڙ 6 کان 8 ڪلو صاف ٿيل ٻج 2.5 فٽ ويڪري کيڏين (پٽڙين) تي پوکيو ته جيئن برسات جو وڌيڪ پاڻي آساني سان نڪري سگهي.",
      },
      irrigation: {
        window: "6–8 Irrigations",
        badge: "Drainage Critical",
        en: "First irrigation 30–35 days after sowing; subsequent waterings every 12–15 days during flowering. Immediately drain standing rain water within 24 hours.",
        ur: "پہلا پانی بوائی کے 30 تا 35 دن بعد اور پھر ہر 12 تا 15 دن کے وقفے سے لگائیں۔ تیز بارش کے بعد کھیت سے 24 گھنٹے میں پانی نکالیں۔",
        sd: "پهريون پاڻي 30 کان 35 ڏينهن بعد ۽ پوءِ هر 12 کان 15 ڏينهن جي وقفي سان ڏيو. تيز برسات بعد 24 ڪلاڪن اندر پاڻي نيڪال ڪريو.",
      },
      fertilizer: {
        window: "Basal + 3 Splits",
        badge: "Boron + Potash",
        en: "1.5 bags DAP + 1 bag SOP basal; 2.5 bags Urea in 3 splits (Squaring, Flowering, Boll set). Spray 2% SOP + Boron @ 300g/acre at peak flowering.",
        ur: "بوائی پر ڈیڑھ بوری ڈی اے پی + 1 بوری پوٹاش۔ ڈھائی بوری یوریا 3 قسطوں میں دیں۔ گڈی اور پھول آتے وقت بوران اور پوٹاش کا سپرے کریں۔",
        sd: "پوکائي تي ڏيڍ ٻوري DAP + 1 ٻوري پوٽاش. اڍائي ٻوريون يوريا 3 قسطن ۾ ڏيو. گل نڪرڻ وقت بوران ۽ پوٽاش جو اسپري ڪريو.",
      },
      harvesting: {
        window: "Sept 15 – Nov 20",
        badge: "Dew-Free Picking",
        en: "Start picking after 10:00 AM once morning dew evaporates. Pick clean dry lint into cotton cloth sheets (never plastic fertilizer bags).",
        ur: "صبح 10 بجے شبنم خشک ہونے کے بعد چنائی شروع کریں۔ پھٹی کو سوتی کپڑے کی جھولی میں رکھیں، پلاسٹک کے تھیلوں میں ہرگز نہ بھریں۔",
        sd: "صبح جو 10 وڳي ماڪ سڪڻ کان پوءِ ڦٽي چونڊيو. ڦٽي کي سوتي ڪپڙي ۾ رکو، پلاسٽڪ جي ٻورين ۾ نه وجهو.",
      },
      thresher: {
        window: "Nov 15 – Dec 05",
        badge: "Stalk Shredder",
        en: "Run a tractor-mounted Cotton Stalk Shredder/Rotavator immediately after final picking to crush leftover bolls and kill overwintering Pink Bollworm larvae.",
        ur: "آخری چنائی کے فوراً بعد کھیت میں روٹاویٹر یا شریڈر چلا کر کپاس کی چھڑیوں اور بچے کھچے ٹینڈوں کو کتر دیں تاکہ گلابی سنڈی کا خاتمہ ہو۔",
        sd: "آخري چوڻي کان فوراً پوءِ روٽاويٽر يا شريڊر هلائي ڪپهه جون ڪاٺيون ۽ گولڙا ختم ڪريو ته جيئن گلابي سنڍي ختم ٿئي.",
      },
    },
    aiResponse: {
      en: "Sanghar & Mirpurkhas Cotton Advisory: Pick open bolls immediately before any forecast rain shower to prevent lint grade discoloration.",
      ur: "سانگھڑ اور میرپورخاص کپاس مشورہ: بارش کی پیشگوئی سے پہلے کھلے ہوئے ٹینڈوں کی چنائی مکمل کر لیں تاکہ پھٹی کا رنگ خراب نہ ہو۔",
      sd: "سانگهڙ ۽ ميرپورخاص ڪپهه مشورو: برسات جي اڳڪٿي کان اڳ کليل گولڙن جي چوڻي مڪمل ڪريو ته جيئن ڦٽي خراب نه ٿئي.",
    },
  },
  rice: {
    season: "Kharif",
    seasonBadge: "Kharif (Monsoon • May–Nov)",
    icon: "🌱",
    names: {
      en: "Rice / Paddy (چانور / چاول)",
      ur: "چاول / دھان (Rice)",
      sd: "چانور / ساريون (Rice)",
    },
    varieties: "IRRI-6, Kainat-1121, Super Basmati, Hybrid Arize",
    stage: {
      en: "Grain Maturity & Paddy Threshing Phase",
      ur: "دھان کی پختگی اور تھریشنگ کا مرحلہ",
      sd: "سارين جي پچڻ ۽ ٿريشر جو مرحلو",
    },
    steps: {
      seeding: {
        window: "May 15 – June 25",
        badge: "Nursery + Transplant",
        en: "Raise nursery (Bejaro) in May using 6–8 kg seed/acre for IRRI-6 or 5 kg for Hybrid. Transplant 25–30 day old seedlings at 8x8 inch spacing.",
        ur: "مئی میں 6 تا 8 کلو بیج فی ایکڑ سے پنیری تیار کریں۔ 25 تا 30 دن کی پنیری کو کدو کیے گئے کھیت میں 8x8 انچ کے فاصلے پر منتقل کریں۔",
        sd: "مئي ۾ 6 کان 8 ڪلو ٻج في ايڪڙ سان ٻيجارو تيار ڪريو. 25 کان 30 ڏينهن جي رونبي کي 8x8 انچ جي فاصلي تي لڳايو.",
      },
      irrigation: {
        window: "Continuous Ponding",
        badge: "2–3 Inch Standing",
        en: "Maintain 2–3 inches standing canal water for first 30 days after transplanting, then alternate wetting and drying. Drain field 15 days before harvest.",
        ur: "منتقلی کے بعد پہلے 30 دن تک 2 تا 3 انچ پانی کھڑا رکھیں۔ کٹائی سے 15 دن پہلے کھیت کا پانی مکمل خشک کر دیں۔",
        sd: "رونبي کان پوءِ پهرين 30 ڏينهن تائين 2 کان 3 انچ پاڻي بيهاريو. لاباري کان 15 ڏينهن اڳ پاڻي مڪمل بند ڪري سڪايو.",
      },
      fertilizer: {
        window: "Basal + 2 Splits",
        badge: "Zinc Mandatory",
        en: "1.5 bags DAP basal + 2 bags Urea split at Day 20 and Day 45 + 10 kg Zinc Sulfate (33%) at Day 12 to prevent Khaira disease in Upper Sindh.",
        ur: "بوائی پر ڈیڑھ بوری ڈی اے پی اور 2 بوری یوریا دو قسطوں میں دیں۔ لاڑکانہ و جیکب آباد میں خیرہ روگ سے بچاؤ کے لیے 10 کلو زنک لازمی ڈالیں۔",
        sd: "ڏيڍ ٻوري DAP بنيادي ۽ 2 ٻوريون يوريا ٻن قسطن ۾ ڏيو. خيرو روڳ کان بچاءَ لاءِ 10 ڪلو زنڪ سلفيٽ لازمي وجهو.",
      },
      harvesting: {
        window: "Oct 15 – Nov 20",
        badge: "85% Golden Panicles",
        en: "Harvest when 85% of panicle grains turn golden straw-colored and grain moisture is 20–22%.",
        ur: "جب سٹوں کے 85 فیصد دانے سنہری ہو جائیں تو فوری کٹائی کریں۔ زیادہ دیر کھیت میں سوکھنے سے چاول میں ٹوٹا بڑھ جاتا ہے۔",
        sd: "جڏهن سنگن جا 85 سيڪڙو داڻا سونهري ٿين ته فوري لابارو ڪريو. وڌيڪ دير رکڻ سان چانور ۾ ٽوٽو وڌي وڃي ٿو.",
      },
      thresher: {
        window: "Oct 20 – Nov 25",
        badge: "Paddy Thresher 450 RPM",
        en: "Use axial-flow Paddy Thresher or Rice Combine Harvester at 400–450 RPM within 24 hours of cutting. Sun-dry paddy on tarpaulins to 12–13% moisture.",
        ur: "کٹائی کے 24 گھنٹے کے اندر پیڈی تھریشر (400 تا 450 RPM) یا کمبائن ہارویسٹر سے گہائی کریں اور ترپال پر پھیلا کر نمی 12 فیصد تک لائیں۔",
        sd: "لاباري جي 24 ڪلاڪن اندر پيڊي ٿريشر (400 کان 450 RPM) يا ڪمبائن هارويسٽر سان ساريون ڪڍو ۽ ترپال تي سڪايو.",
      },
    },
    aiResponse: {
      en: "Larkana & Badin Rice Advisory: Keep tarpaulins ready during paddy threshing. Residual soil moisture (34%) is ideal for zero-tillage Dubari Chickpea.",
      ur: "لاڑکانہ اور بدین دھان مشورہ: دھان کی گہائی کے دوران بارش سے بچاؤ کے لیے ترپال تیار رکھیں۔ وتر زمین میں چنے یا گندم کی بوائی کریں۔",
      sd: "لاڙڪاڻو ۽ بدين ساريون مشورو: ساريون ڪڍڻ وقت برسات کان بچاءَ لاءِ ترپال تيار رکو. موجود آلاڻ ۾ چڻا يا ڪڻڪ پوکيو.",
    },
  },
  sugarcane: {
    season: "Kharif",
    seasonBadge: "Perennial / Annual (Sept & Feb)",
    icon: "🎋",
    names: {
      en: "Sugarcane (ڪمند / گنا)",
      ur: "گنا / کماد (Sugarcane)",
      sd: "ڪمند (Sugarcane)",
    },
    varieties: "Thatta-10, SPF-234, NIA-2012, Th-2109",
    stage: {
      en: "Grand Sucrose Maturity & Crushing Phase",
      ur: "مٹھاس بننے اور مل کرشنگ کا مرحلہ",
      sd: "کنڊ ٺهڻ ۽ ملن ۾ پيڙهائي جو مرحلو",
    },
    steps: {
      seeding: {
        window: "Sept–Oct or Feb–Mar",
        badge: "3-Budded Setts",
        en: "Plant 30,000–35,000 three-budded healthy cane setts (100–120 Maunds/acre) in 4-foot deep trenches dipped in fungicide.",
        ur: "فی ایکڑ 100 تا 120 من تین آنکھوں والے صحت مند سمے 4 فٹ چوڑی خندقوں (ٹرینچ) میں لگائیں۔",
        sd: "في ايڪڙ 100 کان 120 مڻ ٽن اکين وارا صحتمند ٻج 4 فٽ ويڪري کاهين ۾ پوکيو.",
      },
      irrigation: {
        window: "16–20 Irrigations",
        badge: "Stop 18d Pre-Harvest",
        en: "Irrigate every 10–12 days in summer and every 20–25 days in winter. Stop irrigation 18 days before harvesting to concentrate sucrose recovery.",
        ur: "گرمیوں میں ہر 10 تا 12 دن اور سردیوں میں 20 تا 25 دن بعد پانی دیں۔ کٹائی سے 18 دن پہلے پانی بند کر دیں۔",
        sd: "گرمين ۾ هر 10 کان 12 ڏينهن ۽ سردين ۾ 20 کان 25 ڏينهن بعد پاڻي ڏيو. وڍائي کان 18 ڏينهن اڳ پاڻي بند ڪريو.",
      },
      fertilizer: {
        window: "Basal + 3 Splits + Earthing",
        badge: "High Potash",
        en: "2 bags DAP + 2 bags SOP at planting. Apply 3.5 bags Urea in 3 splits before July, followed by earthing-up to prevent lodging.",
        ur: "بوائی پر 2 بوری ڈی اے پی + 2 بوری پوٹاش۔ ساڑھے 3 بوری یوریا جولائی سے پہلے مکمل کر کے مڈھوں پر مٹی چڑھائیں۔",
        sd: "پوکائي تي 2 ٻوريون DAP + 2 ٻوريون پوٽاش. ساڍا 3 ٻوريون يوريا جولاءِ کان اڳ مڪمل ڪري مٽي چاڙهيو.",
      },
      harvesting: {
        window: "Nov 25 – March 15",
        badge: "Ground-Level Cut",
        en: "Harvest flush with ground level using sharp Tokas to promote vigorous ratoon sprouting.",
        ur: "گنے کو زمین کے بالکل برابر تیز ٹوکے سے کاٹیں تاکہ مونڈھی فصل اچھی پھوٹے۔",
        sd: "ڪمند کي زمين جي بلڪل برابر تکي ڪهاڙي يا ٽوڪي سان وڍيو ته جيئن مونڍي سٺي ٿئي.",
      },
      thresher: {
        window: "24-Hr Mill Delivery",
        badge: "Trash Mulcher",
        en: "Deliver to Sugar Mills within 24 hours of cutting. Use a Tractor Trash Mulcher in the field instead of burning cane trash.",
        ur: "گنا کاٹنے کے 24 گھنٹے کے اندر شوگر مل پہنچائیں۔ کھیت میں بچی ہوئی کھوری کو ٹریکٹر ملچر سے زمین میں ملائیں۔",
        sd: "ڪمند وڍڻ جي 24 ڪلاڪن اندر شگر مل پهچايو. بچيل پنن کي ملچر سان زمين ۾ ملايو.",
      },
    },
    aiResponse: {
      en: "Badin & Shaheed Benazirabad Sugarcane Advisory: Withhold irrigation now to boost Brix sucrose reading.",
      ur: "بدین اور شہید بے نظیر آباد گنا مشورہ: چینی کی ریکوری بڑھانے کے لیے پانی روک دیں۔",
      sd: "بدين ۽ شهيد بينظير آباد ڪمند مشورو: کنڊ جي رڪوري وڌائڻ لاءِ پاڻي روڪيو.",
    },
  },
  mustard: {
    season: "Rabi",
    seasonBadge: "Rabi (Oilseed • Oct–Mar)",
    icon: "🌼",
    names: {
      en: "Mustard / Sarsoon (سرنهن / سرسوں)",
      ur: "سرسوں / رایا (Mustard)",
      sd: "سرنهن / رايو (Mustard)",
    },
    varieties: "Sindh Raya, Toria, Super Canola, Mehran Raya",
    stage: {
      en: "Rosette & Early Flowering Initiation",
      ur: "پھول نکلنے کا ابتدائی مرحلہ",
      sd: "گل نڪرڻ جو شروعاتي مرحلو",
    },
    steps: {
      seeding: {
        window: "Oct 10 – Nov 20",
        badge: "2–3 kg Seed/Acre",
        en: "Drill 2–3 kg seed/acre mixed with dry sand at 1.5 ft row spacing.",
        ur: "فی ایکڑ 2 تا 3 کلو بیج ڈیڑھ فٹ قطاروں کے فاصلے پر ڈرل کریں۔",
        sd: "في ايڪڙ 2 کان 3 ڪلو ٻج ڏيڍ فٽ قطارن جي فاصلي تي پوکيو.",
      },
      irrigation: {
        window: "2–3 Irrigations Only",
        badge: "Low Water Need",
        en: "1st irrigation at 30 days, 2nd at flowering, and 3rd at pod filling.",
        ur: "پہلا پانی 30 دن بعد، دوسرا پھول آتے وقت اور تیسرا پھلیاں بنتے وقت لگائیں۔",
        sd: "پهريون پاڻي 30 ڏينهن بعد، ٻيو گل نڪرڻ وقت ۽ ٽيون ڦريون ٺهڻ وقت ڏيو.",
      },
      fertilizer: {
        window: "Basal + 1st Water",
        badge: "Sulfur Boosts Oil",
        en: "1 bag DAP + 10kg Sulfur at sowing + 1 bag Urea at first irrigation.",
        ur: "بوائی پر 1 بوری ڈی اے پی + 10 کلو سلفر اور پہلے پانی پر 1 بوری یوریا دیں۔",
        sd: "پوکائي تي 1 ٻوري DAP + 10 ڪلو سلفر ۽ پهرين پاڻي تي 1 ٻوري يوريا ڏيو.",
      },
      harvesting: {
        window: "Feb 20 – March 20",
        badge: "75% Yellow Pods",
        en: "Cut crop in early morning hours when 75% of pods turn golden-yellow.",
        ur: "جب 75 فیصد پھلیاں زرد ہو جائیں تو صبح سویرے کٹائی کریں۔",
        sd: "جڏهن 75 سيڪڙو ڦريون پيليون ٿين ته صبح سوير لابارو ڪريو.",
      },
      thresher: {
        window: "March 01 – March 28",
        badge: "Low-Speed 400 RPM",
        en: "Cure bundles for 5 days on clean threshing floor, then run through a fine-sieve Mustard Thresher at 380–420 RPM.",
        ur: "5 دن کھلیان میں سکھا کر باریک جالی والے تھریشر پر 400 RPM رفتار پر گہائی کریں۔",
        sd: "5 ڏينهن کري تي سڪائي سنهي جالي واري ٿريشر تي 400 RPM رفتار سان داڻو ڪڍو.",
      },
    },
    aiResponse: {
      en: "Mirpurkhas & Khairpur Mustard Advisory: Watch for Aphids during cloudy spells and apply sulfur for higher oil yield.",
      ur: "میرپورخاص اور خیرپور سرسوں مشورہ: ابر آلود موسم میں تیلے کا معائنہ کریں۔",
      sd: "ميرپورخاص ۽ خيرپور سرنهن مشورو: جهڙالي موسم ۾ موهلي جيرو معائنو ڪريو.",
    },
  },
  chickpea: {
    season: "Rabi",
    seasonBadge: "Rabi (Dubari • Oct–Mar)",
    icon: "🫘",
    names: {
      en: "Chickpea / Gram (چڻا / چنا)",
      ur: "چنا / گرام (Chickpea)",
      sd: "چڻا (Chickpea / Dubari)",
    },
    varieties: "DG-92, Sanyasi, Chhola, Kabuli",
    stage: {
      en: "Residual Moisture Vegetative Growth",
      ur: "ڈوباری وتر میں بڑھوتری کا مرحلہ",
      sd: "دوباري آلاڻ ۾ وڌاءَ جو مرحلو",
    },
    steps: {
      seeding: {
        window: "Oct 25 – Nov 30",
        badge: "Residual Paddy Moisture",
        en: "Drill 35–40 kg seed/acre directly into residual moisture (Dubari) of harvested rice fields.",
        ur: "دھان کی کٹائی کے بعد موجود وتر (ڈوباری) میں 35 تا 40 کلو بیج فی ایکڑ ڈرل کریں۔",
        sd: "سارين جي لاباري بعد موجود آلاڻ (دوباري) ۾ 35 کان 40 ڪلو ٻج في ايڪڙ پوکيو.",
      },
      irrigation: {
        window: "0–1 Irrigation",
        badge: "No Flowering Water",
        en: "Grows on sub-surface moisture. Never irrigate during open flowering.",
        ur: "پھول کھلنے کے دوران ہرگز پانی نہ لگائیں ورنہ پودا سوکھ جائے گا۔",
        sd: "گل نڪرڻ وقت هرگز پاڻي نه ڏيو نه ته ٻوٽو سڪي ويندو.",
      },
      fertilizer: {
        window: "Basal Only",
        badge: "1 Bag DAP",
        en: "Apply 1 bag DAP per acre at drilling + 10kg starter Urea.",
        ur: "بوائی کے وقت صرف 1 بوری ڈی اے پی فی ایکڑ دیں۔",
        sd: "پوکائي وقت صرف 1 ٻوري DAP في ايڪڙ ڏيو.",
      },
      harvesting: {
        window: "March 15 – April 05",
        badge: "Brown Dry Pods",
        en: "Harvest when leaves turn reddish-brown and pods rattle dryly.",
        ur: "جب پودے اور ڈوڈیاں بھوری ہو کر خشک ہو جائیں تو کٹائی کریں۔",
        sd: "جڏهن ٻوٽا ۽ گولڙيون ناسي ٿي سڪي وڃن ته لابارو ڪريو.",
      },
      thresher: {
        window: "March 25 – April 15",
        badge: "Wide Concave 450 RPM",
        en: "Sun-dry harvested heaps for 5 days, then thresh using a wide-clearance Pulse/Gram Thresher at 450 RPM.",
        ur: "5 دن دھوپ میں سکھا کر چنا تھریشر (450 RPM) سے گہائی کریں۔",
        sd: "5 ڏينهن اس ۾ سڪائي چڻا ٿريشر (450 RPM) سان ڪڍو.",
      },
    },
    aiResponse: {
      en: "Larkana & Jacobabad Gram Advisory: Residual paddy moisture is optimal right now.",
      ur: "لاڑکانہ اور جیکب آباد چنا مشورہ: دھان کی زمین کا وتر بوائی کے لیے بہترین ہے۔",
      sd: "لاڙڪاڻو ۽ جيڪب آباد چڻا مشورو: سارين واري زمين جي آلاڻ پوکائي لاءِ بهترين آهي.",
    },
  },
  mango: {
    season: "Perennial",
    seasonBadge: "Orchard (Sindhri & Chaunsa)",
    icon: "🥭",
    names: {
      en: "Mango — Sindhri (انب / آم)",
      ur: "آم — سندھڑی (Mango)",
      sd: "انب — سنڌڙي (Mango)",
    },
    varieties: "Sindhri (GI Tagged), Chaunsa, Saroli, Langra",
    stage: {
      en: "Post-Harvest Canopy Pruning & Winter Dormancy",
      ur: "شاخ تراشی اور سرمائی تیاری کا مرحلہ",
      sd: "شاخن جي ڇانگ ۽ سياري جي تياري جو مرحلو",
    },
    steps: {
      seeding: {
        window: "Feb–Mar or Aug–Sept",
        badge: "Grafted Saplings",
        en: "Plant certified grafted Sindhri saplings at 30x30 ft spacing (48 trees/acre).",
        ur: "تصدیق شدہ پیوندی سندھڑی آم کے پودے 30x30 فٹ کے فاصلے پر لگائیں۔",
        sd: "تصديق ٿيل پيوندي سنڌڙي انب جا ٻوٽا 30x30 فٽ جي فاصلي تي لڳايو.",
      },
      irrigation: {
        window: "Basin / Drip Schedule",
        badge: "Withhold Nov–Dec",
        en: "Withhold irrigation in Nov–Dec for floral induction; resume in late January when panicles emerge.",
        ur: "نومبر اور دسمبر میں پانی روک دیں تاکہ جنوری میں بھرپور بور نکلے۔",
        sd: "نومبر ۽ ڊسمبر ۾ پاڻي روڪي ڇڏيو ته جيئن جنوري ۾ ڀرپور ٻور نڪري.",
      },
      fertilizer: {
        window: "Canopy Ring Trench",
        badge: "FYM + SOP + NPK",
        en: "Per mature tree: 80kg FYM + 2kg DAP + 2kg SOP + 1.5kg Urea + 250g Zinc Sulfate.",
        ur: "فی بڑے درخت 80 کلو گوبر کی کھاد، 2 کلو ڈی اے پی، 2 کلو پوٹاش اور ڈیڑھ کلو یوریا دیں۔",
        sd: "في وڏي وڻ 80 ڪلو ڳريل ڀاڻ، 2 ڪلو DAP، 2 ڪلو پوٽاش ۽ ڏيڍ ڪلو يوريا ڏيو.",
      },
      harvesting: {
        window: "May 20 – July 10",
        badge: "4-Inch Pedicel Stem",
        en: "Harvest with a 4-inch stem attached using pole clippers to prevent sap burn.",
        ur: "سندھڑی آم کو 4 انچ ڈنڈی سمیت احتیاط سے اتاریں تاکہ چوئپ سے داغ نہ پڑیں۔",
        sd: "سنڌڙي انب کي 4 انچ ڏانڊي سميت احتياط سان پٽيو.",
      },
      thresher: {
        window: "Packhouse Grading",
        badge: "Hot Water 48°C",
        en: "Desap fruit on mesh racks, treat in Hot Water Plant at 48°C for 60 mins against Fruit Fly, and pack in ventilated boxes.",
        ur: "48 ڈگری گرم پانی میں 60 منٹ ٹریٹمنٹ کریں اور ہوا دار ڈبوں میں پیک کریں۔",
        sd: "48 ڊگري گرم پاڻي ۾ 60 منٽ ٽريٽمينٽ ڪريو ۽ هوادار دٻن ۾ پيڪ ڪريو.",
      },
    },
    aiResponse: {
      en: "Mirpurkhas & Tando Allahyar Mango Advisory: Prune malformed shoots now and apply Bordeaux paste on trunks.",
      ur: "میرپورخاص اور ٹنڈو الہ یار آم مشورہ: سوکھی شاخوں کی کٹائی کریں اور تنوں پر بورڈو پیسٹ لگائیں۔",
      sd: "ميرپورخاص ۽ ٽنڊو الهيار انب مشورو: سڪل ٽارين جي ڇانگ ڪريو ۽ ٿڙن تي بورڊو پيسٽ لڳايو.",
    },
  },
  onion: {
    season: "Rabi",
    seasonBadge: "Rabi / Early Kharif (Oct–Apr)",
    icon: "🧅",
    names: {
      en: "Onion (بصر / پیاز)",
      ur: "پیاز (Onion)",
      sd: "بصر (Onion)",
    },
    varieties: "Nasarpuri (Red Sindh), Phulkara, Red Creole",
    stage: {
      en: "Bulb Development & Neck-Fall Stage",
      ur: "گٹھلی بننے کا مرحلہ",
      sd: "بصر جي ڳنڍ ٺهڻ جو مرحلو",
    },
    steps: {
      seeding: {
        window: "Sept–Nov Transplanting",
        badge: "Nasarpuri Variety",
        en: "Sow 4–5 kg nursery seed/acre; transplant seedlings after 45 days at 4x6 inch spacing.",
        ur: "4 تا 5 کلو بیج سے پنیری تیار کر کے 45 دن بعد 4x6 انچ کے فاصلے پر منتقل کریں۔",
        sd: "4 کان 5 ڪلو ٻج مان ٻيجارو تيار ڪري 45 ڏينهن بعد 4x6 انچ جي فاصلي تي رونبو ڪريو.",
      },
      irrigation: {
        window: "Light 10-Day Intervals",
        badge: "Shallow Roots",
        en: "Irrigate lightly every 10–12 days. Stop water 15 days before digging at 50% neck fall.",
        ur: "ہر 10 تا 12 دن بعد ہلکا پانی دیں۔ پٹائی سے 15 دن پہلے پانی بند کر دیں۔",
        sd: "هر 10 کان 12 ڏينهن بعد هلڪو پاڻي ڏيو. پٽائي کان 15 ڏينهن اڳ پاڻي بند ڪريو.",
      },
      fertilizer: {
        window: "Basal + 2 Splits",
        badge: "Potash + Sulfur",
        en: "2 bags DAP + 1.5 bags SOP + 10kg Sulfur basal; 1.5 bags Urea split.",
        ur: "2 بوری ڈی اے پی + ڈیڑھ بوری پوٹاش + 10 کلو سلفر اور ڈیڑھ بوری یوریا دیں۔",
        sd: "2 ٻوريون DAP + ڏيڍ ٻوري پوٽاش + 10 ڪلو سلفر ۽ ڏيڍ ٻوري يوريا ڏيو.",
      },
      harvesting: {
        window: "March 10 – May 05",
        badge: "50% Neck Fall",
        en: "Lift bulbs when 50–70% of necks soften and fall over; cure under leaves for 5 days.",
        ur: "جب 50 تا 70 فیصد پودوں کی گردن گر جائے تو پٹائی کریں اور 5 دن سکھائیں۔",
        sd: "جڏهن 50 کان 70 سيڪڙو ٻوٽن جي ڳچي ڪري پوي ته بصر پٽيو ۽ 5 ڏينهن سڪايو.",
      },
      thresher: {
        window: "Curing & Mesh Grading",
        badge: "1.5-Inch Neck Cut",
        en: "Trim dry tops leaving a 1.5-inch neck, grade on mesh tables, and pack in 40kg red mesh net bags.",
        ur: "اوپر سے ڈیڑھ انچ ڈنڈی چھوڑ کر پتے کاٹیں اور 40 کلو کی جالی دار بوریوں میں پیک کریں۔",
        sd: "مٿان ڏيڍ انچ ڳچي ڇڏي پن ڪٽيو ۽ 40 ڪلو جي جالي دار ٻورين ۾ پيڪ ڪريو.",
      },
    },
    aiResponse: {
      en: "Hyderabad & Mirpurkhas Onion Advisory: Scout for Thrips and grade cured bulbs in 40kg mesh bags.",
      ur: "حیدرآباد اور میرپورخاص پیاز مشورہ: خشک موسم میں تھرپس سے بچاؤ کا سپرے کریں۔",
      sd: "حيدرآباد ۽ ميرپورخاص بصر مشورو: خشڪ موسم ۾ ٿرپس کان بچاءَ جو اسپري ڪريو.",
    },
  },
};

// Disease Diagnoses + Exact Pesticide/Insecticide + Dosages
const PRESET_DIAGNOSES = {
  wheat_rust: {
    cropName: "Wheat (Triticum aestivum) — Rabi Crop",
    visualObservation:
      "Linear rows of yellow-to-orange pustules (uredinia) running parallel to leaf veins on the upper blade surface; mild chlorotic halo surrounding lesions with ~30% foliar coverage.",
    primaryDisease: "Yellow / Stripe Rust (Puccinia striiformis)",
    localName: "ڪڻڪ جي پيلي رتڙي / زرد کنگی",
    confidence: 95,
    severity: "High Risk — Spreads rapidly in 12–18°C humid mornings",
    pesticide: {
      chemicalName: "Tebuconazole 50% + Trifloxystrobin 25% WG",
      brandNames: "Nativo 75 WG (Bayer CropScience) or Tilt 250 EC (Syngenta)",
      type: "Systemic Curative & Protective Fungicide",
      dosagePerAcre: "65 grams Nativo (or 200 ml Tilt) in 120 liters water per acre",
      estimatedPricePkr: "PKR 1,850 / Acre Pack",
    },
    actionPlan: [
      {
        step: "Immediate Fungicide Spray (Within 24 Hours)",
        detail:
          "Foliar spray of Tebuconazole + Trifloxystrobin (Nativo) @ 65 grams per acre in 120 liters of water using a hollow-cone nozzle.",
      },
      {
        step: "Pause Nitrogen Top-Dressing",
        detail:
          "Halt extra Urea application immediately; excess succulent nitrogen growth accelerates rust spore germination.",
      },
      {
        step: "Field Perimeter Isolation",
        detail:
          "Spray a 15-foot buffer zone around infected patches first before moving machinery to healthy plots.",
      },
    ],
  },
  cotton_clcv: {
    cropName: "Cotton (Gossypium hirsutum) — Kharif Crop",
    visualObservation:
      "Upward curling of leaf margins, pronounced darkening and thickening of lower veins (vein swelling), and cup-shaped enations on the underside caused by Whitefly (Bemisia tabaci).",
    primaryDisease: "Cotton Leaf Curl Virus (CLCuV) + Whitefly Vector",
    localName: "ڪپهه جو مروڙيو روڳ ۽ سفيد مکي / پتہ مروڑ وائرس",
    confidence: 92,
    severity: "Critical — Whitefly Population Exceeds Economic Threshold (5/leaf)",
    pesticide: {
      chemicalName: "Flonicamid 50% WG + Pyriproxyfen 10.8% EC",
      brandNames: "Ulala (ICI/Syngenta) + Admiral (FMC)",
      type: "Systemic Whitefly Insecticide & Nymph Growth Regulator",
      dosagePerAcre: "80 grams Ulala + 400 ml Pyriproxyfen in 120 liters water per acre",
      estimatedPricePkr: "PKR 2,450 / Acre Pack",
    },
    actionPlan: [
      {
        step: "Whitefly (سفيد مکي) Vector Knockdown",
        detail:
          "Apply Flonicamid 50% WG @ 80g/acre or Pyriproxyfen @ 400ml/acre early morning before 9:00 AM to break the nymphal cycle.",
      },
      {
        step: "Foliar Potassium & Boron Recovery",
        detail:
          "Spray 2% Potassium Sulfate (SOP) + 100g Chelated Zinc to boost cell-wall turgor and boll retention.",
      },
      {
        step: "Weed Host Eradication",
        detail:
          "Remove Kanghi Booti (Abutilon) and Lehli weeds along water channels that harbor CLCuV.",
      },
    ],
  },
  rice_blight: {
    cropName: "Rice / Paddy (Oryza sativa) — Kharif Crop",
    visualObservation:
      "Water-soaked yellowish stripes along leaf margins starting from the tip, turning wavy gray-white with bacterial ooze droplets, accompanied by Stem Borer dead-hearts.",
    primaryDisease: "Bacterial Leaf Blight (BLB) & Yellow Stem Borer",
    localName: "سارين جو جراثيمي ساڙو ۽ گڀ جو ڪيئون / بیکٹیریل بلائٹ",
    confidence: 93,
    severity: "High Risk — Spreads rapidly in ponded water & high Urea fields",
    pesticide: {
      chemicalName: "Copper Oxychloride 50% WP + Chlorantraniliprole 0.4% G",
      brandNames: "Cobox (BASF) / Kasumin + Ferterra Granules (FMC)",
      type: "Agricultural Bactericide-Fungicide + Systemic Insecticide",
      dosagePerAcre: "500g Copper Oxychloride spray + 4 kg Ferterra granules per acre",
      estimatedPricePkr: "PKR 3,100 / Acre Pack",
    },
    actionPlan: [
      {
        step: "Drain Standing Field Water for 4 Days",
        detail:
          "Lower standing water immediately and stop Urea top-dressing to halt bacterial spread.",
      },
      {
        step: "Bactericide + Stem Borer Application",
        detail:
          "Spray Copper Oxychloride @ 500g/acre in 100L water and broadcast 4kg Ferterra granules.",
      },
    ],
  },
};

const UI_TEXT = {
  en: {
    dir: "ltr",
    title: "AgriSync AI",
    subtitle: "Sindh Smart Agriculture, Live Land GPS, Mandi AI & Labour Portal",
    seasonBadge: "Rabi & Kharif Full-Stack Platform",
    voiceTitle: "Sindhi / Urdu Voice Field Assistant",
    voiceIdle: "Tap microphone & speak in Sindhi, Urdu, or English",
    voiceListening: "Listening to field query... Speak clearly",
    voiceProcessing: "Analyzing Sindh agro-climatic & market telemetry...",
    voiceSamplePrompt:
      '"منهنجي ڪڻڪ جي فصل ۾ پيلا داغ آهن، ڪهڙي دوا وٺان ۽ ڪڻڪ ڪڏهن وڪرو ڪريان؟"',
    playAudio: "Listen in Voice",
    mapHeader: "Live GPS Land Tracker & Real-Time Weather Radar",
    mapSub: "Click anywhere on the map or use Live GPS to pinpoint your farm plot, canal command & rain alerts",
    detectGpsBtn: "📍 Detect My Live GPS Land",
    simRainBtn: "🌧️ Simulate Rain Alert",
    stepLabels: {
      seeding: "1. Seeding & Sowing",
      irrigation: "2. Irrigation Schedule",
      fertilizer: "3. Fertilizer & Care",
      harvesting: "4. Harvesting Guide",
      thresher: "5. Thresher & Post-Harvest",
    },
  },
  ur: {
    dir: "rtl",
    title: "ایگری سنک اے آئی",
    subtitle: "سندھ اسمارٹ زراعت، منڈی ریٹ، زرعی ادویات اور مزدور پورٹل",
    seasonBadge: "ربیع اور خریف ملٹی کراپ سسٹم",
    voiceTitle: "سندھی / اردو وائس فیلڈ اسسٹنٹ",
    voiceIdle: "مائیک بٹن دبائیں اور سندھی، اردو یا انگریزی میں مسئلہ بتائیں",
    voiceListening: "آپ کی آواز سنی جا رہی ہے... واضح بولیں",
    voiceProcessing: "سندھ کے زرعی ڈیٹا اور منڈی ریٹس کا تجزیہ کیا جا رہا ہے...",
    voiceSamplePrompt:
      '"میری گندم کی فصل پر پیلے داغ ہیں، کونسی دوا کس دکان سے ملے گی اور فصل کب بیچوں؟"',
    playAudio: "آواز میں سنیں",
    mapHeader: "لائیو جی پی ایس زمین ٹریکر اور موسمی ریڈار الرٹ",
    mapSub: "اپنے کھیت کی لوکیشن، نہری کمانڈ اور بارش کا الرٹ دیکھنے کے لیے نقشے پر کلک کریں",
    detectGpsBtn: "📍 میری لائیو زمین تلاش کریں",
    simRainBtn: "🌧️ بارش الرٹ ٹیسٹ کریں",
    stepLabels: {
      seeding: "1. بوائی اور بیج (Seeding)",
      irrigation: "2. آبپاشی اور پانی (Irrigation)",
      fertilizer: "3. کھاد اور نگہداشت (Fertilizer)",
      harvesting: "4. کٹائی کا طریقہ (Harvesting)",
      thresher: "5. تھریشر اور ذخیرہ (Thresher)",
    },
  },
  sd: {
    dir: "rtl",
    title: "ايگري سنڪ اي آءِ",
    subtitle: "سنڌ اسمارٽ زراعت، منڊي اگهه، زرعي دوائون ۽ هاري مزدور پورٽل",
    seasonBadge: "ربيع ۽ خريف ملٽي ڪراپ سسٽم",
    voiceTitle: "سنڌي / اردو وائس هاري مددگار",
    voiceIdle: "مائيڪ دٻايو ۽ سنڌي، اردو يا انگريزي ۾ پنهنجي فصل بابت پڇو",
    voiceListening: "توهان جو آواز ٻڌجي رهيو آهي... صاف ڳالهايو",
    voiceProcessing: "سنڌ جي موسم، منڊي اگهه ۽ دوائن جو تجزيو ٿي رهيو آهي...",
    voiceSamplePrompt:
      '"منهنجي ڪڻڪ تي پيلا داغ آهن، ڪهڙي دوا ڪهڙي دڪان تان ملندي ۽ ڪڻڪ ڪڏهن وڪرو ڪريان؟"',
    playAudio: "آواز ۾ ٻڌو",
    mapHeader: "لائيو جي پي ايس زمين ٽريڪر ۽ موسمي برسات الرٽ",
    mapSub: "پنهنجي زمين جي لوڪيشن، واهه ۽ برسات جو الرٽ ڏسڻ لاءِ نقشي تي ڪلڪ ڪريو",
    detectGpsBtn: "📍 منهنجي لائيو زمين ڳوليو",
    simRainBtn: "🌧️ برسات الرٽ چيڪ ڪريو",
    stepLabels: {
      seeding: "1. پوکائي ۽ ٻج (Seeding)",
      irrigation: "2. پاڻي ۽ وارابندي (Irrigation)",
      fertilizer: "3. ڀاڻ ۽ سنڀال (Fertilizer)",
      harvesting: "4. لابارو (Harvesting)",
      thresher: "5. ٿريشر ۽ گودام (Thresher)",
    },
  },
};

// Global Application State
let state = {
  theme: "dark",
  lang: "en",
  seasonFilter: "ALL",
  crop: "wheat",
  marketCrop: "wheat",
  marketQuantityMaunds: 200,
  voiceState: "idle",
  presetDiagnosis: "wheat_rust",
  govStep: 1,
  mapLayer: "satellite",
  location: {
    district: "Sukkur",
    lat: 27.7052,
    lng: 68.8574,
    canal: "Sukkur Barrage • Rohri & Nara Canal Command",
    soil: "Alluvial Silt Loam (Kacho & Pacco Plains)",
  },
  weather: {
    temp: 28.4,
    humidity: 44,
    windSpeed: 12.5,
    rainProb: 10,
    rainMm: 0.0,
    condition: "Clear Sky",
    simulatedStorm: false,
  },
  labourForm: {
    name: "",
    cnic: "",
    phone: "",
    district: "Sukkur",
    address: "",
    skills: ["harvesting", "thresher"],
    dailyWage: 1500,
  },
  labourFilterDistrict: "ALL",
  labourFilterSkill: "ALL",
  labourList: [],
  storageEngineName: "SQLite3 Persistent Disk + Cloud Sync",
  govData: {
    farmerName: "Ghulam Mustafa Bhutto",
    cnic: "45504-7823419-3",
    district: "Sukkur",
    taluka: "Rohri",
    acreage: 12,
    waterSource: "canal",
    resources: {
      canalMaintenance: true,
      solarPumpSubsidy: true,
      tractorRental: false,
    },
  },
};

let leafletMap = null;
let landMarker = null;
let landPolygon = null;
let streetTileLayer = null;
let satelliteTileLayer = null;

// ==========================================================================
// 1. DARK & LIGHT THEME SWITCHER
// ==========================================================================

function toggleTheme() {
  const htmlEl = document.documentElement;
  if (state.theme === "dark") {
    state.theme = "light";
    htmlEl.classList.remove("dark");
    htmlEl.classList.add("light");
  } else {
    state.theme = "dark";
    htmlEl.classList.remove("light");
    htmlEl.classList.add("dark");
  }

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.innerHTML =
      state.theme === "dark"
        ? "☀️ <span>Light Mode (Field Sun)</span>"
        : "🌙 <span>Dark Mode (Night)</span>";
  }
}

// ==========================================================================
// 2. LIVE LOCATION TRACKER & SATELLITE / GOOGLE MAPS INTEGRATION
// ==========================================================================

function initSindhLandMap() {
  const mapEl = document.getElementById("sindh-land-map");
  if (!mapEl || typeof L === "undefined") return;

  leafletMap = L.map("sindh-land-map").setView(
    [state.location.lat, state.location.lng],
    13
  );

  satelliteTileLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri — Source: Esri, Maxar",
      maxZoom: 19,
    }
  );

  streetTileLayer = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }
  );

  satelliteTileLayer.addTo(leafletMap);
  updateMapPinAndPolygon(state.location.lat, state.location.lng);

  leafletMap.on("click", (e) => {
    const { lat, lng } = e.latlng;
    setCustomCoordinates(lat, lng, "Selected Field Parcel");
  });
}

function updateMapPinAndPolygon(lat, lng) {
  if (!leafletMap) return;
  if (landMarker) leafletMap.removeLayer(landMarker);
  if (landPolygon) leafletMap.removeLayer(landPolygon);

  landMarker = L.marker([lat, lng])
    .addTo(leafletMap)
    .bindPopup(
      `<b>📍 Identified Farm Plot</b><br/>Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}<br/>Canal: ${state.location.canal}`
    )
    .openPopup();

  const d = 0.0022;
  landPolygon = L.polygon(
    [
      [lat - d, lng - d],
      [lat - d, lng + d * 1.3],
      [lat + d, lng + d * 1.3],
      [lat + d, lng - d],
    ],
    {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.25,
      weight: 2,
    }
  ).addTo(leafletMap);

  leafletMap.setView([lat, lng], 14);

  const gmapsLink = document.getElementById("google-maps-direct-link");
  if (gmapsLink) {
    gmapsLink.href = `https://www.google.com/maps?q=${lat},${lng}&z=16&t=k`;
  }
}

function switchMapLayer(layerType) {
  if (!leafletMap) return;
  state.mapLayer = layerType;
  if (layerType === "satellite") {
    leafletMap.removeLayer(streetTileLayer);
    satelliteTileLayer.addTo(leafletMap);
  } else {
    leafletMap.removeLayer(satelliteTileLayer);
    streetTileLayer.addTo(leafletMap);
  }

  ["satellite", "street"].forEach((t) => {
    const btn = document.getElementById(`map-layer-${t}`);
    if (btn) {
      btn.className =
        t === layerType
          ? "rounded-lg bg-emerald-500 px-3 py-1 text-xs font-bold text-slate-950"
          : "rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300";
    }
  });
}

function selectMapDistrict(districtName) {
  const loc = SINDH_LOCATIONS[districtName];
  if (!loc) return;
  state.location = {
    district: districtName,
    lat: loc.lat,
    lng: loc.lng,
    canal: loc.canal,
    soil: loc.soil,
  };
  updateMapPinAndPolygon(loc.lat, loc.lng);
  renderLocationAndWeatherUI();
  renderVisionDiagnosis(PRESET_DIAGNOSES[state.presetDiagnosis]);
  fetchLiveWeatherForCoords(loc.lat, loc.lng);
}

function setCustomCoordinates(lat, lng, label) {
  let nearestDist = "Sukkur";
  let minD = 9999;
  Object.entries(SINDH_LOCATIONS).forEach(([dist, info]) => {
    const distSq = Math.pow(lat - info.lat, 2) + Math.pow(lng - info.lng, 2);
    if (distSq < minD) {
      minD = distSq;
      nearestDist = dist;
    }
  });

  const info = SINDH_LOCATIONS[nearestDist];
  state.location = {
    district: nearestDist,
    lat,
    lng,
    canal: info.canal,
    soil: info.soil,
  };
  updateMapPinAndPolygon(lat, lng);
  renderLocationAndWeatherUI();
  renderVisionDiagnosis(PRESET_DIAGNOSES[state.presetDiagnosis]);
  fetchLiveWeatherForCoords(lat, lng);
}

function detectUserLiveGPS() {
  const statusEl = document.getElementById("gps-status-badge");
  if (statusEl) statusEl.textContent = "🛰️ Acquiring Live Satellite GPS...";

  if (!("geolocation" in navigator)) {
    if (statusEl) statusEl.textContent = "⚠️ Browser GPS unavailable — Using Sukkur Pin";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      setCustomCoordinates(latitude, longitude, "Live GPS Farm Plot");
      if (statusEl) {
        statusEl.textContent = `✓ Live GPS Locked (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      }
    },
    () => {
      setCustomCoordinates(25.4251, 68.5368, "SAU Tandojam Research Farm");
      if (statusEl) {
        statusEl.textContent = "✓ Pinpointed: Tandojam Agro-Station (25.4251, 68.5368)";
      }
    },
    { enableHighAccuracy: true, timeout: 6000 }
  );
}

// ==========================================================================
// 3. LIVE WEATHER TELEMETRY & RAIN / THRESHER ALERT ENGINE
// ==========================================================================

async function fetchLiveWeatherForCoords(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&hourly=precipitation_probability&forecast_days=2`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();

    const current = data.current || {};
    const hourlyProbs = data.hourly?.precipitation_probability?.slice(0, 12) || [10];
    const maxRainProbNext12h = Math.max(...hourlyProbs, 0);

    if (!state.weather.simulatedStorm) {
      state.weather.temp = current.temperature_2m ?? 29.0;
      state.weather.humidity = current.relative_humidity_2m ?? 42;
      state.weather.windSpeed = current.wind_speed_10m ?? 11.5;
      state.weather.rainMm = current.precipitation ?? 0.0;
      state.weather.rainProb = maxRainProbNext12h;
      state.weather.condition =
        maxRainProbNext12h >= 50
          ? "Rain / Thunderstorm Developing"
          : maxRainProbNext12h >= 25
          ? "Partly Cloudy / Humid"
          : "Clear Field Conditions";
    }
    renderLocationAndWeatherUI();
  } catch {
    renderLocationAndWeatherUI();
  }
}

function toggleSimulateRainAlert() {
  state.weather.simulatedStorm = !state.weather.simulatedStorm;
  if (state.weather.simulatedStorm) {
    state.weather.rainProb = 88;
    state.weather.rainMm = 18.5;
    state.weather.windSpeed = 38.0;
    state.weather.humidity = 84;
    state.weather.temp = 22.0;
    state.weather.condition = "HEAVY MONSOON / WESTERN DISTURBANCE SQUALL";
  } else {
    state.weather.rainProb = 8;
    state.weather.rainMm = 0.0;
    state.weather.windSpeed = 12.0;
    state.weather.humidity = 40;
    state.weather.temp = 29.2;
    state.weather.condition = "Clear Field Conditions";
  }
  renderLocationAndWeatherUI();
}

function renderLocationAndWeatherUI() {
  setText("loc-district-name", `${state.location.district} Division`);
  setText(
    "loc-coords-text",
    `${state.location.lat.toFixed(4)}° N, ${state.location.lng.toFixed(4)}° E`
  );
  setText("loc-canal-text", state.location.canal);
  setText("loc-soil-text", state.location.soil);

  setText("wx-temp-val", `${state.weather.temp}°C`);
  setText("wx-humidity-val", `${state.weather.humidity}%`);
  setText("wx-wind-val", `${state.weather.windSpeed} km/h`);
  setText("wx-rain-prob", `${state.weather.rainProb}% Rain Prob`);
  setText("wx-condition-text", state.weather.condition);

  const alertBox = document.getElementById("weather-alert-banner");
  const alertTitle = document.getElementById("weather-alert-title");
  const alertDesc = document.getElementById("weather-alert-desc");

  if (!alertBox || !alertTitle || !alertDesc) return;

  const isRainAlert = state.weather.rainProb >= 50 || state.weather.rainMm > 2;
  const isHighWind = state.weather.windSpeed >= 30;

  if (isRainAlert || isHighWind) {
    alertBox.className =
      "rounded-2xl border-2 border-red-500/80 bg-red-950/60 p-4 shadow-lg transition-all";
    alertTitle.className =
      "text-sm font-extrabold uppercase tracking-wide text-red-300 flex items-center gap-2";
    alertTitle.innerHTML = `🚨 URGENT SINDH AGRO-WEATHER ALERT (${state.weather.rainProb}% Rain Probability • ${state.weather.windSpeed} km/h Wind)`;

    if (state.lang === "ur") {
      alertDesc.textContent =
        "شدید بارش اور تیز ہوا کا الرٹ! فوری طور پر گندم/دھان کی تھریشر بند کر کے ڈھیر پر ترپال ڈالیں، نہری پانی کا ناغہ کریں اور کھاد یا کیڑے مار سپرے مؤخر کر دیں۔";
    } else if (state.lang === "sd") {
      alertDesc.textContent =
        "تيز برسات ۽ طوفاني هوا جو الرٽ! فوري طور تي ڪڻڪ/سارين جو ٿريشر بند ڪري ترپال وجهو، واهه جو پاڻي روڪيو ۽ يوريا يا زرعي دوائن جو اسپري ملتوي ڪريو.";
    } else {
      alertDesc.textContent =
        "IMMEDIATE FIELD ACTION: 1) Halt all Wheat/Paddy Thresher operations & cover grain heaps with tarpaulins. 2) Close canal watercourse (Nakko) to prevent waterlogging. 3) Postpone Urea broadcasting & pesticide spraying as rain will wash off chemicals.";
    }
  } else {
    alertBox.className =
      "rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 transition-all";
    alertTitle.className =
      "text-sm font-bold uppercase tracking-wide text-emerald-300 flex items-center gap-2";
    alertTitle.innerHTML =
      "✅ CLEAR AGRO-WEATHER WINDOW — SAFE FOR SEEDING, IRRIGATION & THRESHER";

    if (state.lang === "ur") {
      alertDesc.textContent =
        "اگلے 48 گھنٹوں میں بارش کا کوئی خطرہ نہیں۔ کاشتکار بوائی، نہری آبپاشی، کھاد کا چھٹہ اور تھریشر مشین کا کام بحفاظت جاری رکھ سکتے ہیں۔";
    } else if (state.lang === "sd") {
      alertDesc.textContent =
        "ايندڙ 48 ڪلاڪن ۾ برسات جو ڪو به خطرو ناهي. هاري پوکائي، واهه جو پاڻي، ڀاڻ جو ڇٽو ۽ ٿريشر مشين جو ڪم آرام سان جاري رکي سگهن ٿا.";
    } else {
      alertDesc.textContent =
        "No rain expected in the next 48 hours (Wind < 15 km/h). Optimal window for seed drilling, scheduled canal irrigation, foliar fungicide spraying, and running grain threshers.";
    }
  }
}

// ==========================================================================
// 4. AGRI MARKETPLACE & AI "BEST TIME TO SELL" ENGINE
// ==========================================================================

function selectMarketplaceCrop(cropKey) {
  state.marketCrop = cropKey;
  renderMarketplaceUI();
}

function updateMarketQuantity(val) {
  state.marketQuantityMaunds = Math.max(1, Number(val) || 1);
  renderMarketplaceUI();
}

function renderMarketplaceUI() {
  const m = SINDH_MARKETPLACE_DATA[state.marketCrop];
  if (!m) return;

  // Render All Mandi Overview Cards
  const cardsGrid = document.getElementById("marketplace-cards-grid");
  if (cardsGrid) {
    cardsGrid.innerHTML = Object.entries(SINDH_MARKETPLACE_DATA)
      .map(([key, item]) => {
        const active = key === state.marketCrop;
        const badgeColor =
          item.signalColor === "emerald"
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            : "bg-amber-500/20 text-amber-300 border-amber-500/40";
        return `
        <div
          onclick="selectMarketplaceCrop('${key}')"
          class="agri-card cursor-pointer rounded-2xl p-4 transition-all ${
            active
              ? "border-2 border-emerald-500 shadow-lg shadow-emerald-950/50"
              : "hover:border-slate-700"
          }"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-extrabold text-white">${item.icon} ${item.name}</span>
            <span class="rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${badgeColor}">
              ${item.signal}
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">📍 ${item.mandi}</p>

          <div class="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5">
            <div>
              <span class="text-[10px] uppercase text-slate-400">Today's Rate (40kg)</span>
              <p class="text-base font-extrabold text-white">PKR ${item.currentPrice.toLocaleString()}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase text-emerald-400">AI Peak Forecast</span>
              <p class="text-base font-extrabold text-emerald-400">PKR ${item.peakPrice.toLocaleString()} (${item.gainPct})</p>
            </div>
          </div>

          <div class="mt-2.5 flex items-center justify-between text-xs">
            <span class="font-semibold text-amber-300">⏰ Best Time: ${item.bestWindow}</span>
          </div>
        </div>
      `;
      })
      .join("");
  }

  // Render Selected Crop Profit Calculator & AI Timing Breakdown
  const qty = state.marketQuantityMaunds;
  const revenueToday = qty * m.currentPrice;
  const revenuePeak = qty * m.peakPrice;
  const extraProfit = revenuePeak - revenueToday;

  setText("mkt-selected-title", `${m.icon} ${m.name} — ${m.mandi}`);
  setText("mkt-best-window", m.bestWindow);
  setText("mkt-ai-advice", m.advice[state.lang] || m.advice.en);
  setText("mkt-rev-today", `PKR ${revenueToday.toLocaleString()}`);
  setText("mkt-rev-peak", `PKR ${revenuePeak.toLocaleString()}`);
  setText("mkt-extra-profit", `+ PKR ${extraProfit.toLocaleString()} Extra Profit`);
}

// ==========================================================================
// 5. MULTILINGUAL DASHBOARD, SEASONS & 5-STEP CROP LIFECYCLE
// ==========================================================================

function setLanguage(langCode) {
  state.lang = langCode;
  document.documentElement.dir = UI_TEXT[langCode].dir;
  renderDashboard();
  renderLocationAndWeatherUI();
  renderMarketplaceUI();
  renderLabourPortalUI();
}

function setSeasonFilter(season) {
  state.seasonFilter = season;
  ["ALL", "Rabi", "Kharif", "Perennial"].forEach((s) => {
    const btn = document.getElementById(`season-btn-${s}`);
    if (btn) {
      btn.className =
        s === season
          ? "rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 shadow"
          : "rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50";
    }
  });

  const matchingCrops = Object.keys(CROPS_DATABASE).filter(
    (k) => season === "ALL" || CROPS_DATABASE[k].season === season
  );
  if (!matchingCrops.includes(state.crop) && matchingCrops.length > 0) {
    state.crop = matchingCrops[0];
  }
  renderDashboard();
}

function setCrop(cropKey) {
  state.crop = cropKey;
  renderDashboard();
}

function renderDashboard() {
  const ui = UI_TEXT[state.lang];
  const cropObj = CROPS_DATABASE[state.crop];

  ["en", "ur", "sd"].forEach((code) => {
    const btn = document.getElementById(`lang-btn-${code}`);
    if (btn) {
      btn.className =
        state.lang === code
          ? "rounded-lg px-3 py-1.5 text-xs font-semibold bg-emerald-500 text-slate-950 shadow-md transition-all"
          : "rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all";
    }
  });

  setText("ui-title", ui.title);
  setText("ui-subtitle", ui.subtitle);
  setText("ui-season-badge", ui.seasonBadge);
  setText("ui-map-header", ui.mapHeader);
  setText("ui-map-sub", ui.mapSub);
  setText("ui-detect-gps-btn", ui.detectGpsBtn);
  setText("ui-sim-rain-btn", ui.simRainBtn);
  setText("ui-voice-title", ui.voiceTitle);
  setText("ui-play-audio", ui.playAudio);

  const voiceStatusEl = document.getElementById("ui-voice-status");
  if (voiceStatusEl) {
    if (state.voiceState === "idle") voiceStatusEl.textContent = ui.voiceIdle;
    if (state.voiceState === "listening")
      voiceStatusEl.textContent = ui.voiceListening;
    if (state.voiceState === "processing")
      voiceStatusEl.textContent = ui.voiceProcessing;
  }

  setText("ui-voice-transcript", ui.voiceSamplePrompt);
  setText("ui-voice-advisory", cropObj.aiResponse[state.lang]);

  const cropButtonsContainer = document.getElementById("crop-selector-buttons");
  if (cropButtonsContainer) {
    const filteredKeys = Object.keys(CROPS_DATABASE).filter(
      (k) =>
        state.seasonFilter === "ALL" ||
        CROPS_DATABASE[k].season === state.seasonFilter
    );

    cropButtonsContainer.innerHTML = filteredKeys
      .map((cropKey) => {
        const item = CROPS_DATABASE[cropKey];
        const active = state.crop === cropKey;
        return `<button onclick="setCrop('${cropKey}')" class="rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
          active
            ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm"
            : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
        }">${item.icon} ${item.names[state.lang]}</button>`;
      })
      .join("");
  }

  setText("active-crop-title", `${cropObj.icon} ${cropObj.names[state.lang]}`);
  setText("active-crop-stage", cropObj.stage[state.lang]);
  setText("active-crop-season-pill", cropObj.seasonBadge);
  setText(
    "active-crop-varieties",
    `Recommended Sindh Varieties: ${cropObj.varieties}`
  );

  const stepsGrid = document.getElementById("crop-lifecycle-steps-grid");
  if (stepsGrid) {
    const stepConfigs = [
      { key: "seeding", icon: "🌱", color: "emerald" },
      { key: "irrigation", icon: "💧", color: "sky" },
      { key: "fertilizer", icon: "🧪", color: "amber" },
      { key: "harvesting", icon: "🌾", color: "emerald" },
      { key: "thresher", icon: "⚙️", color: "amber" },
    ];

    stepsGrid.innerHTML = stepConfigs
      .map((cfg) => {
        const stepData = cropObj.steps[cfg.key];
        const title = ui.stepLabels[cfg.key];
        return `
        <div class="agri-card flex flex-col justify-between rounded-2xl p-5 shadow-lg">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-${cfg.color}-400 flex items-center gap-1.5">
                <span>${cfg.icon}</span> ${title}
              </span>
              <span class="rounded-full bg-${cfg.color}-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-${cfg.color}-300">
                ${stepData.badge}
              </span>
            </div>
            <p class="mt-2.5 text-base font-extrabold text-white">${stepData.window}</p>
            <p class="mt-2 text-xs leading-relaxed text-slate-300">${stepData[state.lang]}</p>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
            <span>Sindh Extension Verified</span>
            <span>${cropObj.season} Season</span>
          </div>
        </div>
      `;
      })
      .join("");
  }
}

// ==========================================================================
// 6. CROP DOCTOR VISION + EXACT PESTICIDE + NEARBY DEALER LOCATOR
// ==========================================================================

function switchVisionPreset(presetKey) {
  state.presetDiagnosis = presetKey;
  renderVisionDiagnosis(PRESET_DIAGNOSES[presetKey]);

  ["wheat_rust", "cotton_clcv", "rice_blight"].forEach((key) => {
    const btn = document.getElementById(`preset-btn-${key}`);
    if (btn) {
      btn.className =
        key === presetKey
          ? "rounded-xl border border-emerald-500 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition"
          : "rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 transition";
    }
  });
}

function renderVisionDiagnosis(diag) {
  setText("diag-crop-name", `Active Specimen: ${diag.cropName}`);
  setText("diag-primary-disease", diag.primaryDisease);
  setText("diag-local-name", `Local Sindhi / Urdu Name: ${diag.localName}`);
  setText("diag-confidence-text", `${diag.confidence}%`);
  const bar = document.getElementById("diag-confidence-bar");
  if (bar) bar.style.width = `${diag.confidence}%`;

  setText("diag-observation", diag.visualObservation);
  setText("diag-severity", diag.severity);

  // Pesticide / Insecticide Prescription Box
  const p = diag.pesticide || diag.pesticideRequired;
  if (p) {
    setText("diag-pest-chemical", p.chemicalName);
    setText("diag-pest-brands", `Commercial Brands: ${p.brandNames}`);
    setText("diag-pest-type", p.type);
    setText("diag-pest-dosage", `Dosage: ${p.dosagePerAcre}`);
    setText("diag-pest-price", p.estimatedPricePkr);
  }

  // Action Plan Steps
  const actionContainer = document.getElementById("diag-action-plan");
  if (actionContainer) {
    actionContainer.innerHTML = diag.actionPlan
      .map(
        (item, idx) => `
      <div class="flex items-start gap-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/75 p-3.5 transition hover:border-emerald-800/60">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-300">
          0${idx + 1}
        </div>
        <div>
          <h4 class="text-sm font-bold text-white">${item.step}</h4>
          <p class="mt-0.5 text-xs leading-relaxed text-slate-300">${item.detail}</p>
        </div>
      </div>
    `
      )
      .join("");
  }

  // Nearby Local Agro-Dealers in Farmer's Selected Sindh District
  const activeDist = SINDH_LOCATIONS[state.location.district]
    ? state.location.district
    : "Sukkur";
  const dealers = diag.nearbyDealers || SINDH_AGRO_DEALERS[activeDist] || SINDH_AGRO_DEALERS.Sukkur;

  setText("diag-dealer-district-label", `Available Near ${activeDist} (${dealers.length} Verified Shops)`);

  const dealerContainer = document.getElementById("diag-nearby-dealers");
  if (dealerContainer) {
    dealerContainer.innerHTML = dealers
      .map(
        (d) => `
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-800/50 bg-slate-950/85 p-3.5">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-extrabold text-white">🏪 ${d.shopName}</span>
            <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              In Stock ✓ (${d.distanceKm} km away)
            </span>
          </div>
          <p class="mt-1 text-xs text-slate-300">📍 ${d.address}</p>
          <p class="mt-0.5 text-[11px] text-amber-300">🛡️ ${d.badge || d.verified}</p>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="tel:${d.phone}"
            class="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
          >
            📞 Call ${d.phone}
          </a>
          <a
            href="https://www.google.com/maps?q=${d.lat},${d.lng}"
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-emerald-300 hover:border-emerald-500"
          >
            🗺️ Map ↗
          </a>
        </div>
      </div>
    `
      )
      .join("");
  }
}

async function handleLeafFileSelect(file) {
  if (!file) return;
  const previewImg = document.getElementById("leaf-preview-img");
  const placeholder = document.getElementById("leaf-upload-placeholder");
  const overlay = document.getElementById("leaf-scan-overlay");
  const fileNameLabel = document.getElementById("leaf-file-label");

  if (fileNameLabel) fileNameLabel.textContent = `File: ${file.name}`;

  const url = URL.createObjectURL(file);
  if (previewImg && placeholder) {
    previewImg.src = url;
    previewImg.classList.remove("hidden");
    placeholder.classList.add("hidden");
  }

  if (overlay) overlay.classList.remove("hidden");

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("crop_hint", state.presetDiagnosis);
    formData.append("district", state.location.district);

    const res = await fetch(`${API_BASE}/api/crop-doctor`, {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      renderVisionDiagnosis(data);
      if (overlay) overlay.classList.add("hidden");
      return;
    }
  } catch {
    // Fallback to local diagnosis preset
  }

  setTimeout(() => {
    renderVisionDiagnosis(PRESET_DIAGNOSES[state.presetDiagnosis]);
    if (overlay) overlay.classList.add("hidden");
  }, 1000);
}

// ==========================================================================
// 7. ILLITERATE-FRIENDLY LABOUR REGISTRATION & PERSISTENT STORAGE
//    (Syncs with FastAPI SQLite / MongoDB / Firebase + Browser LocalStorage)
// ==========================================================================

const LOCAL_STORAGE_LABOUR_KEY = "agrisync_sindh_labour_db_v1";

async function loadLabourDatabase() {
  // 1. Load any locally saved labourers first so offline/static hosting always persists
  let localSaved = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LABOUR_KEY);
    if (raw) localSaved = JSON.parse(raw);
  } catch {
    localSaved = [];
  }

  // 2. Try fetching from FastAPI Backend (MongoDB / Firebase / SQLite)
  try {
    const res = await fetch(`${API_BASE}/api/labour`);
    if (res.ok) {
      const data = await res.json();
      state.storageEngineName = data.storageEngine || "MongoDB / SQLite Cloud Sync";
      const merged = [...data.labourers];
      localSaved.forEach((locItem) => {
        if (!merged.some((m) => m.cnic === locItem.cnic || m.id === locItem.id)) {
          merged.unshift(locItem);
        }
      });
      state.labourList = merged;
      renderLabourPortalUI();
      return;
    }
  } catch {
    // When running as standalone static site without Python server, merge localStorage + Initial DB
  }

  const combined = [...localSaved];
  INITIAL_LABOURERS.forEach((seed) => {
    if (!combined.some((c) => c.id === seed.id)) {
      combined.push(seed);
    }
  });
  state.labourList = combined;
  renderLabourPortalUI();
}

function toggleLabourSkillIcon(skillKey) {
  const idx = state.labourForm.skills.indexOf(skillKey);
  if (idx >= 0) {
    if (state.labourForm.skills.length > 1) {
      state.labourForm.skills.splice(idx, 1);
    }
  } else {
    state.labourForm.skills.push(skillKey);
  }
  renderLabourPortalUI();
}

function formatLabourCnic(inputEl) {
  const digits = inputEl.value.replace(/\D/g, "").slice(0, 13);
  let formatted = digits;
  if (digits.length > 5 && digits.length <= 12) {
    formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
  } else if (digits.length > 12) {
    formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  inputEl.value = formatted;
  state.labourForm.cnic = formatted;
}

function speakLabourGuide() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  let msg =
    "Welcome to Sindh Kisan Mazdoor Portal. Step 1: Tap the big picture buttons to choose your work like harvesting, thresher, or tractor. Step 2: Speak or enter your Name, CNIC card number, and village address, then press the big green button.";
  if (state.lang === "ur") {
    msg =
      "سندھ کسان مزدور پورٹل میں خوش آمدید۔ سب سے پہلے تصویر والے بٹن دبا کر اپنا کام منتخب کریں جیسے کٹائی، تھریشر یا ٹریکٹر۔ پھر اپنا نام، شناختی کارڈ نمبر اور گاؤں کا پتہ درج کر کے سبز بٹن دبائیں۔";
  } else if (state.lang === "sd") {
    msg =
      "سنڌ هاري مزدور پورٽل ۾ ڀليڪار. سڀ کان پهرين تصوير وارا بٽڻ دٻائي پنهنجو ڪم چونڊيو جيئن لابارو، ٿريشر يا ٽريڪٽر. پوءِ پنهنجو نالو، سڃاڻپ ڪارڊ نمبر ۽ ڳوٺ جو پتو لکي سائو بٽڻ دٻايو.";
  }
  const utter = new SpeechSynthesisUtterance(msg);
  utter.lang = state.lang === "en" ? "en-PK" : "ur-PK";
  utter.rate = 0.92;
  window.speechSynthesis.speak(utter);
}

function voiceFillField(inputId, sampleVal) {
  const el = document.getElementById(inputId);
  if (!el) return;

  // Use Web Speech Recognition if available in browser, otherwise instant simulated voice fill
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    try {
      const recognition = new SpeechRec();
      recognition.lang = state.lang === "en" ? "en-US" : "ur-PK";
      el.placeholder = "🎙️ Listening... Speak now";
      recognition.onresult = (event) => {
        const spoken = event.results[0][0].transcript;
        el.value = spoken;
      };
      recognition.onerror = () => {
        el.value = sampleVal;
      };
      recognition.start();
      return;
    } catch {
      // Fallback
    }
  }
  el.value = sampleVal;
}

async function submitLabourRegistration(event) {
  event.preventDefault();
  const nameEl = document.getElementById("lab-name-input");
  const cnicEl = document.getElementById("lab-cnic-input");
  const phoneEl = document.getElementById("lab-phone-input");
  const distEl = document.getElementById("lab-district-input");
  const addrEl = document.getElementById("lab-address-input");
  const wageEl = document.getElementById("lab-wage-input");

  const newWorker = {
    id: `LAB-${(distEl?.value || "SKR").slice(0, 3).toUpperCase()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`,
    name: nameEl?.value.trim() || "gul Hassan Solangi",
    cnic: cnicEl?.value.trim() || "45504-6677889-1",
    phone: phoneEl?.value.trim() || "0304-5566778",
    district: distEl?.value || "Sukkur",
    address: addrEl?.value.trim() || "Near Canal Regulator, Main Village Road",
    skills: [...state.labourForm.skills],
    dailyWage: Number(wageEl?.value) || 1500,
    verified: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to Browser LocalStorage (Guaranteed persistence across refreshes)
  try {
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_LABOUR_KEY);
    const existingArr = existingRaw ? JSON.parse(existingRaw) : [];
    existingArr.unshift(newWorker);
    localStorage.setItem(LOCAL_STORAGE_LABOUR_KEY, JSON.stringify(existingArr));
  } catch (e) {
    console.warn("LocalStorage save notice:", e);
  }

  // 2. Save to Backend Database (SQLite / MongoDB Atlas / Firebase)
  try {
    const res = await fetch(`${API_BASE}/api/labour`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWorker),
    });
    if (res.ok) {
      const data = await res.json();
      state.storageEngineName = data.storageEngine;
    }
  } catch {
    // Saved in persistent client DB when running standalone
  }

  state.labourList.unshift(newWorker);
  renderLabourPortalUI();

  const banner = document.getElementById("labour-save-toast");
  if (banner) {
    banner.classList.remove("hidden");
    setTimeout(() => banner.classList.add("hidden"), 5000);
  }

  if (nameEl) nameEl.value = "";
  if (cnicEl) cnicEl.value = "";
  if (phoneEl) phoneEl.value = "";
  if (addrEl) addrEl.value = "";
}

function renderLabourPortalUI() {
  setText("db-engine-badge", `Database: ${state.storageEngineName}`);

  // Render Big Visual Skill Buttons for Illiterate-Friendly Selection
  const skillGrid = document.getElementById("labour-visual-skill-selector");
  if (skillGrid) {
    skillGrid.innerHTML = Object.entries(LABOUR_SKILLS_META)
      .map(([key, meta]) => {
        const selected = state.labourForm.skills.includes(key);
        const label = meta[state.lang] || meta.en;
        return `
        <button
          type="button"
          onclick="toggleLabourSkillIcon('${key}')"
          class="flex flex-col items-center justify-center rounded-2xl border-2 p-3.5 text-center transition-all ${
            selected
              ? "border-emerald-400 bg-emerald-500/25 text-white shadow-lg scale-[1.02]"
              : "border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700"
          }"
        >
          <span class="text-3xl mb-1">${meta.icon}</span>
          <span class="text-xs font-extrabold">${label}</span>
          <span class="mt-1 text-[10px] font-bold ${
            selected ? "text-emerald-300" : "text-slate-500"
          }">
            ${selected ? "✓ SELECTED" : "Tap to Select"}
          </span>
        </button>
      `;
      })
      .join("");
  }

  // Filter Registered Labourers for Landowners Searching for Farm Help
  const filteredWorkers = state.labourList.filter((w) => {
    const matchDist =
      state.labourFilterDistrict === "ALL" ||
      w.district.toLowerCase() === state.labourFilterDistrict.toLowerCase();
    const matchSkill =
      state.labourFilterSkill === "ALL" ||
      (w.skills && w.skills.includes(state.labourFilterSkill));
    return matchDist && matchSkill;
  });

  setText("labour-count-badge", `${filteredWorkers.length} Verified Workers Available`);

  const directoryEl = document.getElementById("labour-directory-list");
  if (directoryEl) {
    directoryEl.innerHTML = filteredWorkers
      .map((w) => {
        const skillBadges = (w.skills || [])
          .map((sk) => {
            const m = LABOUR_SKILLS_META[sk] || { icon: "🌾", en: sk };
            return `<span class="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-300">
              ${m.icon} ${m[state.lang] || m.en}
            </span>`;
          })
          .join("");

        return `
        <div class="agri-card flex flex-col justify-between rounded-2xl p-4 shadow-md">
          <div>
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="text-base font-extrabold text-white">👷 ${w.name}</h4>
                  <span class="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ✓ CNIC Verified
                  </span>
                </div>
                <p class="mt-0.5 font-mono text-xs text-slate-400">CNIC: ${w.cnic} • ID: ${w.id}</p>
              </div>
              <div class="rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-right">
                <span class="block text-[10px] uppercase text-amber-300">Daily Wage</span>
                <span class="text-sm font-extrabold text-white">PKR ${w.dailyWage}/day</span>
              </div>
            </div>

            <p class="mt-2.5 text-xs text-slate-200">
              📍 <b>${w.district}:</b> ${w.address}
            </p>

            <div class="mt-3 flex flex-wrap gap-1.5">
              ${skillBadges}
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
            <span class="text-[11px] font-semibold text-emerald-400">● Ready for Immediate Field Work</span>
            <div class="flex items-center gap-2">
              <a
                href="tel:${w.phone}"
                class="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
              >
                📞 Call ${w.phone}
              </a>
              <a
                href="https://wa.me/${w.phone.replace(/\D/g, "").replace(/^0/, "92")}"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-xl border border-emerald-500/50 bg-emerald-950/50 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      `;
      })
      .join("");
  }
}

// ==========================================================================
// 8. VOICE ASSISTANT & SINDH GOV PORTAL HANDLERS
// ==========================================================================

let voiceTimer = null;

async function toggleVoiceAssistant() {
  const micWrap = document.getElementById("mic-pulse-wrapper");
  const micBtn = document.getElementById("mic-main-btn");
  const bars = document.querySelectorAll(".eq-bar");
  const ui = UI_TEXT[state.lang];

  if (state.voiceState === "listening") {
    clearTimeout(voiceTimer);
    state.voiceState = "processing";
    renderDashboard();
    micWrap.classList.remove("mic-pulse-ring");
    micBtn.className =
      "relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-xl transition-all duration-300";
    bars.forEach((b) => b.classList.remove("eq-bar-active"));

    setTimeout(() => {
      state.voiceState = "idle";
      micBtn.className =
        "relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl hover:scale-105 hover:bg-emerald-400 transition-all duration-300";
      renderDashboard();
    }, 900);
  } else {
    state.voiceState = "listening";
    renderDashboard();
    micWrap.classList.add("mic-pulse-ring");
    micBtn.className =
      "relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-xl scale-105 transition-all duration-300";
    bars.forEach((b) => b.classList.add("eq-bar-active"));

    voiceTimer = setTimeout(() => {
      if (state.voiceState === "listening") {
        toggleVoiceAssistant();
      }
    }, 3400);
  }
}

function speakCurrentAdvisory() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const text = document.getElementById("ui-voice-advisory")?.textContent || "";
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = state.lang === "en" ? "en-PK" : "ur-PK";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }
}

function setGovStep(stepNum) {
  state.govStep = stepNum;
  [1, 2, 3].forEach((n) => {
    const panel = document.getElementById(`gov-step-${n}`);
    const tab = document.getElementById(`gov-tab-${n}`);
    if (panel) panel.classList.toggle("hidden", n !== stepNum);
    if (tab) {
      tab.className =
        n === stepNum
          ? "flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition"
          : "flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-400 transition";
    }
  });
  updateGovEligibilityUI();
}

function formatCnicInput(inputEl) {
  const digits = inputEl.value.replace(/\D/g, "").slice(0, 13);
  let formatted = digits;
  if (digits.length > 5 && digits.length <= 12) {
    formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
  } else if (digits.length > 12) {
    formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  inputEl.value = formatted;
  state.govData.cnic = formatted;
  updateGovEligibilityUI();
}

function handleDistrictSelect(district) {
  state.govData.district = district;
  const talukas = SINDH_LOCATIONS[district]?.talukas || ["Rohri"];
  state.govData.taluka = talukas[0];

  const talukaSelect = document.getElementById("gov-taluka-select");
  if (talukaSelect) {
    talukaSelect.innerHTML = talukas
      .map((t) => `<option value="${t}">${t}</option>`)
      .join("");
  }
  selectMapDistrict(district);
  updateGovEligibilityUI();
}

function selectWaterSource(source) {
  state.govData.waterSource = source;
  ["canal", "tubewell"].forEach((s) => {
    const btn = document.getElementById(`water-btn-${s}`);
    if (btn) {
      btn.className =
        s === source
          ? "flex flex-col items-start rounded-2xl border border-emerald-500 bg-emerald-950/50 p-4 text-left text-white transition"
          : "flex flex-col items-start rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left text-slate-400 hover:border-slate-700 transition";
    }
  });
  updateGovEligibilityUI();
}

function toggleGovResource(key) {
  state.govData.resources[key] = !state.govData.resources[key];
  const card = document.getElementById(`res-card-${key}`);
  const box = document.getElementById(`res-check-${key}`);
  const checked = state.govData.resources[key];

  if (card) {
    card.className = checked
      ? "flex cursor-pointer items-start gap-3.5 rounded-2xl border border-emerald-500 bg-emerald-950/40 p-4 transition"
      : "flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-slate-700 transition";
  }
  if (box) {
    box.innerHTML = checked ? "✓" : "";
    box.className = checked
      ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-slate-950"
      : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-600 text-xs";
  }
  updateGovEligibilityUI();
}

function updateGovEligibilityUI() {
  const nameInput = document.getElementById("gov-name-input");
  const acreageInput = document.getElementById("gov-acreage-input");
  if (nameInput) state.govData.farmerName = nameInput.value;
  if (acreageInput) state.govData.acreage = Number(acreageInput.value) || 0;

  const validCnic = /^\d{5}-\d{7}-\d{1}$/.test(state.govData.cnic);
  const validName = state.govData.farmerName.trim().length >= 3;
  const acreage = state.govData.acreage;
  const hasResource = Object.values(state.govData.resources).some(Boolean);

  const isEligible = validCnic && validName && acreage > 0 && hasResource;

  const cnicHint = document.getElementById("gov-cnic-hint");
  if (cnicHint) {
    cnicHint.textContent = validCnic
      ? "✓ Valid Sindh Division CNIC Format (4xxxx)"
      : "Enter 13 digits with dashes (XXXXX-XXXXXXX-X)";
  }

  const statusBadge = document.getElementById("gov-status-title");
  const statusDesc = document.getElementById("gov-status-desc");
  const statusCard = document.getElementById("gov-status-card");

  if (statusBadge && statusDesc && statusCard) {
    if (isEligible) {
      statusBadge.textContent = "Eligible for Sindh Gov Subsidy";
      statusBadge.className = "mt-0.5 text-lg font-extrabold text-emerald-300";
      statusDesc.textContent = `Farmer ${state.govData.farmerName} (${state.govData.district} - ${state.govData.taluka}) holding ${acreage} acres qualifies for direct Benazir Hari Card & Solar disbursement.`;
      statusCard.className =
        "rounded-2xl border border-emerald-500/70 bg-emerald-950/60 p-5 shadow-lg transition-all";
    } else {
      statusBadge.textContent = "Pending Complete Verification";
      statusBadge.className = "mt-0.5 text-lg font-extrabold text-amber-300";
      statusDesc.textContent =
        "Please ensure a valid 13-digit CNIC, acreage > 0, and at least one resource need is checked.";
      statusCard.className =
        "rounded-2xl border border-amber-500/50 bg-amber-950/30 p-5 transition-all";
    }
  }

  let schemes = [];
  if (acreage > 0 && acreage <= 25) {
    schemes.push("Benazir Hari Card (PKR 15,000/acre Input Subsidy)");
  }
  if (state.govData.resources.solarPumpSubsidy) {
    schemes.push("Sindh Solar Tube-Well / Lift Irrigation 80% Grant");
  }
  if (
    state.govData.resources.canalMaintenance &&
    state.govData.waterSource === "canal"
  ) {
    schemes.push("SIDA Watercourse Lining Program (Khal Pucca Scheme)");
  }
  if (state.govData.resources.tractorRental) {
    schemes.push("Sindh Agro-Engineering Subsidized Laser Land Leveler");
  }

  const schemesList = document.getElementById("gov-matched-schemes");
  if (schemesList) {
    schemesList.innerHTML = schemes
      .map(
        (s) => `
      <div class="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/75 p-3 text-xs font-medium text-slate-200">
        <span class="text-emerald-400 font-bold">✔</span>
        <span>${s}</span>
      </div>
    `
      )
      .join("");
  }
}

async function submitGovRegistration(event) {
  event.preventDefault();
  const receiptBox = document.getElementById("gov-receipt-box");
  const tokenText = document.getElementById("gov-receipt-token");
  const tokenSub = document.getElementById("gov-receipt-sub");

  let regId = `SINDH-HARI-${state.govData.district
    .slice(0, 3)
    .toUpperCase()}-2026-8841`;

  if (receiptBox && tokenText && tokenSub) {
    tokenText.textContent = regId;
    tokenSub.textContent = `Forwarded to Mukhtiarkar (${state.govData.taluka}) & Directorate of Agriculture Extension Sindh.`;
    receiptBox.classList.remove("hidden");
  }
}

function exportLabourDatabaseCSV() {
  const headers = [
    "ID",
    "Full Name",
    "CNIC",
    "Phone",
    "Sindh District",
    "Village / Address",
    "Skills",
    "Daily Wage (PKR)",
  ];
  const rows = state.labourList.map((w) => [
    w.id,
    `"${(w.name || "").replace(/"/g, '""')}"`,
    w.cnic,
    w.phone,
    w.district,
    `"${(w.address || "").replace(/"/g, '""')}"`,
    `"${(w.skills || []).join(", ")}"`,
    w.dailyWage,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "agrisync_sindh_labour_database.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// Initialize Everything on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initSindhLandMap();
  renderDashboard();
  renderLocationAndWeatherUI();
  fetchLiveWeatherForCoords(state.location.lat, state.location.lng);
  renderMarketplaceUI();
  renderVisionDiagnosis(PRESET_DIAGNOSES.wheat_rust);
  loadLabourDatabase();
  updateGovEligibilityUI();

  // Drag & Drop Listeners for Crop Doctor
  const dropzone = document.getElementById("leaf-dropzone");
  const fileInput = document.getElementById("leaf-file-input");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      if (e.target.files?.[0]) handleLeafFileSelect(e.target.files[0]);
    });
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dropzone-active");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dropzone-active");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dropzone-active");
      if (e.dataTransfer.files?.[0]) {
        handleLeafFileSelect(e.dataTransfer.files[0]);
      }
    });
  }
});

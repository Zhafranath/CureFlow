// Central static data for CureFlow: the herbal remedy catalog, plant grow
// profiles, and fish types. Plant names double as catalog identifiers.

export type PlantProfile = {
  /** Indonesian display name (also used as the canonical key) */
  id: string
  /** English display name */
  en: string
  /** Realistic hydroponic grow duration in days */
  growDays: number
}

// Grow durations tuned for a hospital hydroponic/aquaponic setup (days).
export const PLANTS: PlantProfile[] = [
  { id: 'Daun mint', en: 'Mint leaves', growDays: 21 },
  { id: 'Selada', en: 'Lettuce', growDays: 30 },
  { id: 'Bayam', en: 'Spinach', growDays: 35 },
  { id: 'Seledri', en: 'Celery', growDays: 60 },
  { id: 'Kangkung', en: 'Water spinach', growDays: 30 },
  { id: 'Pakcoy', en: 'Bok choy', growDays: 35 },
  { id: 'Kale', en: 'Kale', growDays: 55 },
  { id: 'Sawi hijau', en: 'Green mustard', growDays: 40 },
  { id: 'Daun kemangi', en: 'Lemon basil', growDays: 28 },
  { id: 'Daun oregano', en: 'Oregano', growDays: 45 },
  { id: 'Daun thyme', en: 'Thyme', growDays: 50 },
  { id: 'Daun basil', en: 'Basil', growDays: 28 },
  { id: 'Selada romaine', en: 'Romaine lettuce', growDays: 32 },
  { id: 'Kailan', en: 'Chinese broccoli', growDays: 50 },
  { id: 'Mentimun', en: 'Cucumber', growDays: 55 },
  { id: 'Selada merah', en: 'Red lettuce', growDays: 32 },
  { id: 'Peterseli', en: 'Parsley', growDays: 45 },
  { id: 'Daun bawang', en: 'Spring onion', growDays: 40 },
  { id: 'Sawi putih', en: 'Napa cabbage', growDays: 55 },
  { id: 'Bayam merah', en: 'Red spinach', growDays: 35 },
  { id: 'Swiss chard', en: 'Swiss chard', growDays: 50 },
  { id: 'Paprika', en: 'Bell pepper', growDays: 75 },
  { id: 'Tomat ceri', en: 'Cherry tomato', growDays: 70 },
  { id: 'Brokoli', en: 'Broccoli', growDays: 80 },
  { id: 'Kubis', en: 'Cabbage', growDays: 80 },
  { id: 'Selada air', en: 'Watercress', growDays: 30 },
  { id: 'Arugula', en: 'Arugula', growDays: 28 },
  { id: 'Microgreens', en: 'Microgreens', growDays: 10 },
]

export function getPlantProfile(id: string): PlantProfile | undefined {
  return PLANTS.find((p) => p.id === id)
}

export function plantName(id: string, lang: 'id' | 'en'): string {
  const p = getPlantProfile(id)
  if (!p) return id
  return lang === 'en' ? p.en : p.id
}

export type Remedy = {
  id: string
  complaintId: string
  complaintEn: string
  plant: string // matches PlantProfile.id
  prepId: string
  prepEn: string
}

// The full herbal remedy catalog provided by the clinical team.
export const REMEDIES: Remedy[] = [
  { id: 'r1', complaintId: 'Sakit perut ringan', complaintEn: 'Mild stomach ache', plant: 'Daun mint', prepId: 'Diseduh menjadi teh hangat.', prepEn: 'Brewed into a warm tea.' },
  { id: 'r2', complaintId: 'Mual', complaintEn: 'Nausea', plant: 'Daun mint', prepId: 'Diseduh atau dicampurkan ke air minum.', prepEn: 'Brewed or mixed into drinking water.' },
  { id: 'r3', complaintId: 'Gangguan pencernaan', complaintEn: 'Indigestion', plant: 'Selada', prepId: 'Dimakan sebagai lalapan atau salad.', prepEn: 'Eaten fresh or as a salad.' },
  { id: 'r4', complaintId: 'Sembelit', complaintEn: 'Constipation', plant: 'Bayam', prepId: 'Direbus menjadi sayur bening atau ditumis.', prepEn: 'Boiled into clear soup or stir-fried.' },
  { id: 'r5', complaintId: 'Kurang darah (anemia)', complaintEn: 'Anemia', plant: 'Bayam', prepId: 'Direbus atau dibuat smoothie.', prepEn: 'Boiled or blended into a smoothie.' },
  { id: 'r6', complaintId: 'Tekanan darah tinggi', complaintEn: 'High blood pressure', plant: 'Seledri', prepId: 'Dijus atau dimakan segar sebagai lalapan.', prepEn: 'Juiced or eaten fresh.' },
  { id: 'r7', complaintId: 'Kolesterol tinggi', complaintEn: 'High cholesterol', plant: 'Kangkung', prepId: 'Ditumis atau direbus.', prepEn: 'Stir-fried or boiled.' },
  { id: 'r8', complaintId: 'Diabetes (membantu pola makan sehat)', complaintEn: 'Diabetes (supports a healthy diet)', plant: 'Pakcoy', prepId: 'Ditumis sedikit minyak atau direbus.', prepEn: 'Stir-fried in a little oil or boiled.' },
  { id: 'r9', complaintId: 'Menjaga kesehatan mata', complaintEn: 'Maintaining eye health', plant: 'Kale', prepId: 'Dibuat salad, smoothie, atau ditumis.', prepEn: 'Made into salad, smoothie, or stir-fry.' },
  { id: 'r10', complaintId: 'Menjaga daya tahan tubuh', complaintEn: 'Boosting immunity', plant: 'Kale', prepId: 'Dikukus atau dijadikan jus.', prepEn: 'Steamed or juiced.' },
  { id: 'r11', complaintId: 'Kekurangan vitamin C', complaintEn: 'Vitamin C deficiency', plant: 'Sawi hijau', prepId: 'Ditumis atau direbus sebentar.', prepEn: 'Stir-fried or briefly boiled.' },
  { id: 'r12', complaintId: 'Radang ringan', complaintEn: 'Mild inflammation', plant: 'Daun kemangi', prepId: 'Dimakan segar sebagai lalapan.', prepEn: 'Eaten fresh as a side.' },
  { id: 'r13', complaintId: 'Bau mulut', complaintEn: 'Bad breath', plant: 'Daun kemangi', prepId: 'Dikunyah segar setelah dicuci.', prepEn: 'Chewed fresh after washing.' },
  { id: 'r14', complaintId: 'Batuk ringan', complaintEn: 'Mild cough', plant: 'Daun oregano', prepId: 'Diseduh menjadi teh.', prepEn: 'Brewed into a tea.' },
  { id: 'r15', complaintId: 'Flu ringan', complaintEn: 'Mild flu', plant: 'Daun oregano', prepId: 'Diseduh dengan air hangat.', prepEn: 'Brewed with warm water.' },
  { id: 'r16', complaintId: 'Hidung tersumbat', complaintEn: 'Nasal congestion', plant: 'Daun thyme', prepId: 'Diseduh menjadi teh hangat.', prepEn: 'Brewed into a warm tea.' },
  { id: 'r17', complaintId: 'Sakit tenggorokan ringan', complaintEn: 'Mild sore throat', plant: 'Daun thyme', prepId: 'Diseduh sebagai teh.', prepEn: 'Brewed as a tea.' },
  { id: 'r18', complaintId: 'Stres ringan', complaintEn: 'Mild stress', plant: 'Daun basil', prepId: 'Dijadikan teh atau campuran salad.', prepEn: 'Made into tea or a salad mix.' },
  { id: 'r19', complaintId: 'Susah tidur', complaintEn: 'Trouble sleeping', plant: 'Selada romaine', prepId: 'Dimakan sebagai salad pada malam hari.', prepEn: 'Eaten as a salad at night.' },
  { id: 'r20', complaintId: 'Kekurangan vitamin A', complaintEn: 'Vitamin A deficiency', plant: 'Selada', prepId: 'Dimakan segar.', prepEn: 'Eaten fresh.' },
  { id: 'r21', complaintId: 'Tulang kurang kuat', complaintEn: 'Weak bones', plant: 'Kailan', prepId: 'Ditumis atau dikukus.', prepEn: 'Stir-fried or steamed.' },
  { id: 'r22', complaintId: 'Kekurangan kalsium', complaintEn: 'Calcium deficiency', plant: 'Kailan', prepId: 'Direbus atau ditumis.', prepEn: 'Boiled or stir-fried.' },
  { id: 'r23', complaintId: 'Kram otot', complaintEn: 'Muscle cramps', plant: 'Bayam', prepId: 'Direbus karena kaya magnesium.', prepEn: 'Boiled — rich in magnesium.' },
  { id: 'r24', complaintId: 'Dehidrasi', complaintEn: 'Dehydration', plant: 'Mentimun', prepId: 'Dimakan segar atau dijus.', prepEn: 'Eaten fresh or juiced.' },
  { id: 'r25', complaintId: 'Panas dalam (secara tradisional)', complaintEn: 'Internal heat (traditional)', plant: 'Mentimun', prepId: 'Dimakan segar.', prepEn: 'Eaten fresh.' },
  { id: 'r26', complaintId: 'Berat badan berlebih', complaintEn: 'Excess weight', plant: 'Selada', prepId: 'Dijadikan salad rendah kalori.', prepEn: 'Made into a low-calorie salad.' },
  { id: 'r27', complaintId: 'Kekurangan serat', complaintEn: 'Fiber deficiency', plant: 'Pakcoy', prepId: 'Ditumis atau direbus.', prepEn: 'Stir-fried or boiled.' },
  { id: 'r28', complaintId: 'Sariawan', complaintEn: 'Mouth ulcers', plant: 'Selada', prepId: 'Dikonsumsi sebagai sumber vitamin.', prepEn: 'Consumed as a vitamin source.' },
  { id: 'r29', complaintId: 'Mata lelah', complaintEn: 'Tired eyes', plant: 'Bayam', prepId: 'Dimasak menjadi sup.', prepEn: 'Cooked into a soup.' },
  { id: 'r30', complaintId: 'Kulit kering', complaintEn: 'Dry skin', plant: 'Kale', prepId: 'Dijadikan smoothie atau salad.', prepEn: 'Made into a smoothie or salad.' },
  { id: 'r31', complaintId: 'Pencernaan lambat', complaintEn: 'Slow digestion', plant: 'Kangkung', prepId: 'Direbus atau ditumis.', prepEn: 'Boiled or stir-fried.' },
  { id: 'r32', complaintId: 'Kekurangan folat', complaintEn: 'Folate deficiency', plant: 'Bayam', prepId: 'Direbus sebentar.', prepEn: 'Briefly boiled.' },
  { id: 'r33', complaintId: 'Kesehatan jantung', complaintEn: 'Heart health', plant: 'Selada merah', prepId: 'Dijadikan salad.', prepEn: 'Made into a salad.' },
  { id: 'r34', complaintId: 'Antioksidan', complaintEn: 'Antioxidants', plant: 'Selada merah', prepId: 'Dimakan segar.', prepEn: 'Eaten fresh.' },
  { id: 'r35', complaintId: 'Peradangan ringan', complaintEn: 'Mild inflammation', plant: 'Peterseli', prepId: 'Dicampurkan ke sup atau salad.', prepEn: 'Mixed into soup or salad.' },
  { id: 'r36', complaintId: 'Bau napas', complaintEn: 'Bad breath', plant: 'Peterseli', prepId: 'Dikunyah segar.', prepEn: 'Chewed fresh.' },
  { id: 'r37', complaintId: 'Menjaga imun', complaintEn: 'Maintaining immunity', plant: 'Daun bawang', prepId: 'Ditambahkan ke sup atau tumisan.', prepEn: 'Added to soup or stir-fry.' },
  { id: 'r38', complaintId: 'Kesehatan tulang', complaintEn: 'Bone health', plant: 'Sawi putih', prepId: 'Direbus atau ditumis.', prepEn: 'Boiled or stir-fried.' },
  { id: 'r39', complaintId: 'Kesehatan usus', complaintEn: 'Gut health', plant: 'Bayam merah', prepId: 'Direbus atau ditumis.', prepEn: 'Boiled or stir-fried.' },
  { id: 'r40', complaintId: 'Kekurangan vitamin K', complaintEn: 'Vitamin K deficiency', plant: 'Bayam merah', prepId: 'Dimasak menjadi sayur.', prepEn: 'Cooked as a vegetable.' },
  { id: 'r41', complaintId: 'Kesehatan mata', complaintEn: 'Eye health', plant: 'Swiss chard', prepId: 'Ditumis atau direbus.', prepEn: 'Stir-fried or boiled.' },
  { id: 'r42', complaintId: 'Antioksidan', complaintEn: 'Antioxidants', plant: 'Swiss chard', prepId: 'Dikukus.', prepEn: 'Steamed.' },
  { id: 'r43', complaintId: 'Kekurangan vitamin C', complaintEn: 'Vitamin C deficiency', plant: 'Paprika', prepId: 'Dimakan segar atau ditumis sebentar.', prepEn: 'Eaten fresh or briefly stir-fried.' },
  { id: 'r44', complaintId: 'Menjaga kesehatan kulit', complaintEn: 'Maintaining skin health', plant: 'Paprika', prepId: 'Dibuat salad atau tumisan.', prepEn: 'Made into salad or stir-fry.' },
  { id: 'r45', complaintId: 'Kesehatan prostat', complaintEn: 'Prostate health', plant: 'Tomat ceri', prepId: 'Dimakan segar atau dimasak menjadi saus.', prepEn: 'Eaten fresh or cooked into sauce.' },
  { id: 'r46', complaintId: 'Antioksidan', complaintEn: 'Antioxidants', plant: 'Tomat ceri', prepId: 'Dikonsumsi segar.', prepEn: 'Consumed fresh.' },
  { id: 'r47', complaintId: 'Kesehatan tulang', complaintEn: 'Bone health', plant: 'Brokoli', prepId: 'Dikukus atau direbus.', prepEn: 'Steamed or boiled.' },
  { id: 'r48', complaintId: 'Menjaga daya tahan tubuh', complaintEn: 'Boosting immunity', plant: 'Brokoli', prepId: 'Dikukus agar nutrisi tetap baik.', prepEn: 'Steamed to preserve nutrients.' },
  { id: 'r49', complaintId: 'Pencernaan', complaintEn: 'Digestion', plant: 'Kubis', prepId: 'Direbus menjadi sup atau dibuat salad.', prepEn: 'Boiled into soup or made into salad.' },
  { id: 'r50', complaintId: 'Kesehatan usus', complaintEn: 'Gut health', plant: 'Kubis', prepId: 'Difermentasi menjadi kimchi atau sauerkraut.', prepEn: 'Fermented into kimchi or sauerkraut.' },
  { id: 'r51', complaintId: 'Kesehatan ginjal (pola makan tertentu)', complaintEn: 'Kidney health (specific diet)', plant: 'Selada air', prepId: 'Dijadikan salad.', prepEn: 'Made into a salad.' },
  { id: 'r52', complaintId: 'Kesehatan hati', complaintEn: 'Liver health', plant: 'Selada air', prepId: 'Dicampur dalam smoothie hijau.', prepEn: 'Mixed into a green smoothie.' },
  { id: 'r53', complaintId: 'Antioksidan tinggi', complaintEn: 'High antioxidants', plant: 'Arugula', prepId: 'Dijadikan salad.', prepEn: 'Made into a salad.' },
  { id: 'r54', complaintId: 'Kesehatan jantung', complaintEn: 'Heart health', plant: 'Arugula', prepId: 'Dicampur dalam sandwich atau salad.', prepEn: 'Added to a sandwich or salad.' },
  { id: 'r55', complaintId: 'Radikal bebas', complaintEn: 'Free radicals', plant: 'Microgreens', prepId: 'Dimakan segar sebagai topping makanan.', prepEn: 'Eaten fresh as a food topping.' },
  { id: 'r56', complaintId: 'Nutrisi tinggi', complaintEn: 'High nutrition', plant: 'Microgreens', prepId: 'Dicampur ke salad atau sandwich.', prepEn: 'Mixed into salad or sandwich.' },
]

export type FishType = {
  id: string
  nameId: string
  nameEn: string
  noteId: string
  noteEn: string
}

export const FISH_TYPES: FishType[] = [
  { id: 'nila', nameId: 'Ikan Nila', nameEn: 'Tilapia', noteId: 'Tahan banting, produksi nutrisi tinggi.', noteEn: 'Hardy, high nutrient output.' },
  { id: 'lele', nameId: 'Ikan Lele', nameEn: 'Catfish', noteId: 'Toleran kadar oksigen rendah.', noteEn: 'Tolerant of low oxygen.' },
  { id: 'mas', nameId: 'Ikan Mas', nameEn: 'Common Carp', noteId: 'Cocok untuk air kolam sedang.', noteEn: 'Suited to moderate ponds.' },
  { id: 'koi', nameId: 'Ikan Koi', nameEn: 'Koi', noteId: 'Estetis untuk ruang hijau.', noteEn: 'Decorative for green spaces.' },
  { id: 'gurame', nameId: 'Ikan Gurame', nameEn: 'Gourami', noteId: 'Pertumbuhan stabil.', noteEn: 'Steady growth.' },
]

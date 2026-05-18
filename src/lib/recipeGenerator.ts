export interface Recipe {
  title: string;
  description: string;
  cuisine: string;
  ingredients: string[];
  missing: string[];
  steps: string[];
  cookingTime: string;
  compatibilityScore: number;
}

export interface PossibleUse {
  itemName: string;
  suggestions: {
    title: string;
    description: string;
    steps: string[];
  }[];
}

export interface DebugLog {
  ingredient: string;
  recognized: boolean;
  category: string;
  matchedRecipesCount: number;
  rejectedRecipes: { title: string; reason: string; score: number }[];
}

// Normalized ingredient categories
export const INGREDIENT_CATEGORIES: Record<string, string[]> = {
  fruits: ['mango', 'apple', 'banana', 'orange', 'grape', 'lemon', 'watermelon', 'papaya', 'pomegranate', 'strawberry', 'fruit', 'pineapple', 'guava', 'peach'],
  dairy: ['milk', 'curd', 'yogurt', 'paneer', 'butter', 'cheese', 'ghee', 'cream', 'mozzarella', 'cheddar'],
  protein: ['egg', 'chicken', 'meat', 'fish', 'mutton', 'tofu', 'pork', 'beef', 'eggroll'],
  carbs: ['bread', 'rice', 'roti', 'wheat', 'atta', 'maggi', 'noodle', 'pasta', 'flour', 'suji', 'ravva', 'bun', 'tortilla'],
  veggies: ['potato', 'onion', 'tomato', 'carrot', 'chilli', 'coriander', 'mint', 'garlic', 'ginger', 'spinach', 'palak', 'vegetable', 'cabbage', 'capsicum', 'pepper'],
  snacks: ['biscuit', 'chips', 'lays', 'kurkure', 'popcorn', 'peanut', 'snack', 'nuts', 'cashew', 'almond'],
  beverages: ['tea', 'coffee', 'juice', 'soda', 'coke', 'pepsi', 'drink'],
  condiments: ['ketchup', 'mayonnaise', 'mayo', 'mustard', 'honey', 'vinegar', 'sauce', 'dip'],
  sauces: ['soy sauce', 'chilli sauce', 'schezwan', 'chutney', 'pesto', 'marinara'],
  spreads: ['jam', 'peanut butter', 'spread', 'nutella', 'hummus'],
  cooking_essentials: ['oil', 'salt', 'pepper', 'sugar', 'spices', 'turmeric', 'masala', 'cumin', 'mustard seed']
};

// Normalized base helper to clean name, strip descriptor words, singularize (Requirements 1, 9, 11)
export function getNormalizedBase(name: string): string {
  let str = name.trim().toLowerCase();
  
  // Remove special characters, keep only letters, digits, and spaces
  str = str.replace(/[^a-z0-9\s]/g, '');
  
  // Remove common descriptors/stop words so we compare core ingredients
  const stopWords = [
    'fresh', 'organic', 'packet of', 'packet', 'pack of', 'pack', 'slices of', 'slice', 'slices', 
    'pieces of', 'pieces', 'piece', 'powder', 'flakes', 'ground', 'table', 'refined', 'salted', 
    'unsalted', 'grated', 'cloves', 'clove', 'paste', 'carton', 'whole', 'boiled', 'leaves', 
    'root', 'leaf', 'cup', 'cups', 'spoon', 'spoons', 'gram', 'grams', 'kg', 'ml', 'liter', 'liters'
  ];
  
  stopWords.forEach(word => {
    const reg = new RegExp(`\\b${word}\\b`, 'g');
    str = str.replace(reg, '');
  });
  
  str = str.trim().replace(/\s+/g, ' ');
  
  // Singularization handling
  if (str.endsWith('ies')) {
    str = str.slice(0, -3) + 'y'; // chillies -> chilli
  } else if (str.endsWith('tomatoes')) {
    str = 'tomato';
  } else if (str.endsWith('potatoes')) {
    str = 'potato';
  } else if (str.endsWith('oes')) {
    str = str.slice(0, -2);
  } else if (str.endsWith('s') && !str.endsWith('ss') && str !== 'cheese') {
    str = str.slice(0, -1);
  }
  
  return str.trim();
}

// Clean and normalize ingredient names
function normalizeName(name: string): string {
  return getNormalizedBase(name);
}

// Get the high-level category of an ingredient
export function getIngredientCategory(name: string): string {
  const norm = getNormalizedBase(name);
  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(kw => norm.includes(getNormalizedBase(kw)) || getNormalizedBase(kw).includes(norm))) {
      return category;
    }
  }
  return 'other';
}

// Alias mapping for equivalent ingredients (Requirement 3)
export const INGREDIENT_ALIASES: Record<string, string[]> = {
  pepper: ['black pepper', 'pepper powder', 'peppercorns', 'peppers', 'ground pepper'],
  chilli: ['chili', 'chillies', 'green chilli', 'red chilli', 'chilli flakes', 'chili flakes', 'chilli powder', 'chili powder', 'cayenne pepper'],
  cheese: ['cheese slice', 'cheese slices', 'cheddar', 'mozzarella', 'processed cheese', 'cheese cube', 'cheese cubes', 'grated cheese'],
  bread: ['bread slice', 'bread slices', 'white bread', 'brown bread', 'packet of bread', 'bread packet', 'bun', 'buns', 'loaf'],
  milk: ['milk packet', 'packet of milk', 'packet milk', 'milk carton', 'cow milk', 'whole milk'],
  butter: ['salted butter', 'unsalted butter', 'butter block', 'butter cube'],
  oil: ['cooking oil', 'vegetable oil', 'mustard oil', 'sunflower oil', 'refined oil', 'ghee', 'olive oil'],
  egg: ['eggs', 'egg packet', 'boiled egg', 'boiled eggs'],
  chicken: ['chicken pieces', 'chicken breast', 'chicken boneless'],
  curd: ['yogurt', 'curd packet', 'dahi'],
  garlic: ['garlic cloves', 'garlic clove', 'garlic paste'],
  ginger: ['ginger root', 'ginger paste'],
  potato: ['potatoes', 'aloo'],
  onion: ['onions', 'pyaz'],
  tomato: ['tomatoes', 'tamatar'],
  coriander: ['coriander leaves', 'dhaniya', 'cilantro'],
  mint: ['mint leaves', 'pudina'],
  paneer: ['cottage cheese'],
  sugar: ['refined sugar', 'sugar powder'],
  salt: ['table salt']
};

// Check if two ingredient strings match using fuzzy, base normalization, or alias mappings (Requirement 2 & 4)
export function isIngredientMatch(inventoryItem: string, targetIngredient: string): boolean {
  const invNorm = getNormalizedBase(inventoryItem);
  const targetNorm = getNormalizedBase(targetIngredient);
  
  if (invNorm === targetNorm || invNorm.includes(targetNorm) || targetNorm.includes(invNorm)) {
    return true;
  }
  
  // Alias mappings check
  for (const [canonical, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    const canonicalNorm = getNormalizedBase(canonical);
    
    const targetMatches = (targetNorm === canonicalNorm || aliases.some(alias => getNormalizedBase(alias) === targetNorm));
    const invMatches = (invNorm === canonicalNorm || aliases.some(alias => getNormalizedBase(alias) === invNorm));
    
    if (targetMatches && invMatches) {
      return true;
    }
  }
  
  return false;
}

// Pantry Categories (Requirement 7)
export const PANTRY_STAPLES: Record<string, string[]> = {
  spices: ['salt', 'pepper', 'black pepper', 'chilli powder', 'turmeric', 'turmeric powder', 'masala', 'cumin', 'cumin seeds', 'mustard seeds'],
  oils: ['oil', 'cooking oil', 'butter', 'ghee'],
  condiments: ['ketchup', 'mayonnaise', 'soy sauce', 'chilli sauce', 'schezwan chutney'],
  staples: ['sugar', 'water', 'flour', 'atta', 'rice', 'bread']
};

// Common pantry items that count as available if present in inventory (Requirement 8)
export const COMMON_PANTRY_ITEMS = [
  'salt',
  'pepper',
  'oil',
  'butter',
  'chilli powder',
  'turmeric',
  'sugar'
];

// Registry of highly realistic, safe, commonly known Indian, hostel-friendly, and condiment-friendly recipes
const RECIPE_REGISTRY = [
  // --- Standard/Previous Meals ---
  {
    title: "Classic Egg Toast 🍳",
    description: "A quick, protein-packed breakfast beloved by students and hostelers alike.",
    cuisine: "Hostel-friendly / Beginner cooking",
    cookingTime: "5 mins",
    required: ["bread", "egg"],
    optional: ["onion", "chilli", "butter", "cheese"],
    missing: ["Salt", "Pepper"],
    steps: [
      "Whisk egg in a bowl with a pinch of salt and pepper (add chopped onion and chilli if available).",
      "Heat a pan with a little butter or oil, and pour the egg mix into it.",
      "Place a slice of bread on top of the cooking egg, let it stick, then flip after 1-2 minutes.",
      "Toast both sides until the bread is golden and the egg is fully cooked.",
      "Serve warm!"
    ]
  },
  {
    title: "Classic Curd Rice (Thayir Sadam) 🍚",
    description: "Comforting, cooling, and extremely easy South Indian classic.",
    cuisine: "South Indian / Comfort Food",
    cookingTime: "5 mins",
    required: ["rice", "curd"],
    optional: ["ginger", "chilli", "coriander", "butter"],
    missing: ["Salt"],
    steps: [
      "Take pre-cooked rice in a bowl and mash it slightly using a spoon.",
      "Add fresh curd (yogurt) and a pinch of salt. Mix thoroughly.",
      "If available, mix in finely chopped ginger and green chillies for a kick.",
      "Optionally temper with oil and mustard seeds if you have a stove.",
      "Serve chilled or at room temperature."
    ]
  },
  {
    title: "Hostel Egg Fried Rice 🍛",
    description: "Quick, tasty, and perfect for using left-over rice.",
    cuisine: "Hostel-friendly / Quick Meal",
    cookingTime: "10 mins",
    required: ["rice", "egg"],
    optional: ["onion", "tomato", "chilli", "garlic", "soy sauce", "butter"],
    missing: ["Oil", "Salt"],
    steps: [
      "Heat oil or butter in a pan and sauté chopped onions, green chillies, and garlic until soft.",
      "Push veggies to the side, crack the eggs into the pan, and scramble them until cooked.",
      "Add the cooked rice into the pan and mix thoroughly with the egg and veggies.",
      "Season with salt and a splash of soy sauce if available.",
      "Stir-fry on high heat for 2 minutes and serve hot!"
    ]
  },
  {
    title: "Paneer Bhurji (Scrambled Paneer) 🧀",
    description: "A rich, high-protein Indian stir-fry that cooks in minutes.",
    cuisine: "Indian / Vegetarian",
    cookingTime: "10 mins",
    required: ["paneer"],
    optional: ["onion", "tomato", "chilli", "butter", "cheese"],
    missing: ["Turmeric powder", "Salt", "Cumin seeds"],
    steps: [
      "Crumble the fresh paneer into fine pieces using your hands.",
      "Heat butter or oil in a pan, add cumin seeds, and sauté chopped onions and chillies.",
      "Add tomatoes and cook until soft, then stir in turmeric powder and salt.",
      "Add the crumbled paneer and toss gently. Cook for 2-3 minutes.",
      "Garnish with coriander and serve hot with bread or roti."
    ]
  },
  {
    title: "Paneer Sandwich 🥪",
    description: "Crispy toasted sandwich stuffed with seasoned paneer.",
    cuisine: "Beginner cooking / Quick Snack",
    cookingTime: "7 mins",
    required: ["bread", "paneer"],
    optional: ["onion", "tomato", "butter", "cheese", "mayonnaise", "ketchup"],
    missing: ["Salt"],
    steps: [
      "Crumble paneer and mix it in a bowl with a pinch of salt and chopped onions or tomatoes if available.",
      "Spread green chutney, mayonnaise, or tomato ketchup on two slices of bread.",
      "Stuff the paneer mixture evenly between the bread slices.",
      "Heat a pan with a smear of butter and toast the sandwich on both sides until crispy and golden brown.",
      "Cut diagonally and enjoy!"
    ]
  },
  {
    title: "Refreshing Mango Shake 🥭",
    description: "Sweet, creamy, and refreshing summer beverage.",
    cuisine: "Hostel-friendly / Quick Drink",
    cookingTime: "3 mins",
    required: ["mango", "milk"],
    optional: ["sugar", "curd"],
    missing: ["Ice cubes"],
    steps: [
      "Peel the ripe mango and chop the sweet pulp into cubes, discarding the seed.",
      "Add the mango cubes and a cup of cold milk to a blender.",
      "Add 1-2 spoons of sugar if the mango is not sweet enough.",
      "Blend until completely smooth and frothy.",
      "Pour into a tall glass and serve chilled."
    ]
  },
  {
    title: "Mango Lassi (Yogurt Smoothie) 🥛",
    description: "Classic creamy Indian yogurt drink highlighting sweet mangoes.",
    cuisine: "Indian / Dessert",
    cookingTime: "3 mins",
    required: ["mango", "curd"],
    optional: ["milk", "sugar"],
    missing: ["Cardamom powder"],
    steps: [
      "Scoop out the fresh mango pulp.",
      "Add mango pulp, curd (yogurt), a splash of milk, and sugar to a blender.",
      "Optionally add a pinch of cardamom powder for authentic aroma.",
      "Blend until thick, creamy, and smooth.",
      "Pour into glasses, garnish with almond slivers if available, and serve chilled."
    ]
  },
  {
    title: "Simple Creamy Banana Shake 🍌",
    description: "Instant energy-boosting shake perfect for active students.",
    cuisine: "Hostel-friendly / Quick Drink",
    cookingTime: "3 mins",
    required: ["banana", "milk"],
    optional: ["sugar", "peanut butter"],
    missing: ["Peanuts or Almonds (optional)"],
    steps: [
      "Peel the banana and slice it into pieces.",
      "Put the banana slices and cold milk into a blender.",
      "Blend on high until completely smooth with no lumps.",
      "Optionally blend in a spoonful of sugar or peanut butter for rich taste.",
      "Drink immediately!"
    ]
  },
  {
    title: "Classic Maggi with Veggies 🍜",
    description: "The ultimate comfort food for late-night hostel study sessions.",
    cuisine: "Hostel-friendly / Beginner cooking",
    cookingTime: "5 mins",
    required: ["maggi"],
    optional: ["onion", "tomato", "chilli", "potato", "butter", "cheese", "ketchup"],
    missing: ["Water", "Maggi Tastemaker (included in pack)"],
    steps: [
      "If you have onions, tomatoes, or chillies, chop and sauté them in a pan with a drop of oil or butter.",
      "Add 1.5 cups of water and bring to a boil.",
      "Break the Maggi noodle cake into the water and add the Tastemaker spice mix.",
      "Cook for 2-3 minutes, stirring occasionally, until the noodles are soft.",
      "Serve steaming hot!"
    ]
  },
  {
    title: "Simple Aloo Fry (Potato Stir-fry) 🥔",
    description: "Crispy, savory potato cubes that pair beautifully with rice or bread.",
    cuisine: "Indian / Side Dish",
    cookingTime: "12 mins",
    required: ["potato"],
    optional: ["onion", "chilli", "butter"],
    missing: ["Oil", "Salt", "Turmeric powder", "Chilli powder"],
    steps: [
      "Wash, peel, and cut the potatoes into small, even-sized cubes.",
      "Heat 1-2 tablespoons of oil or butter in a pan. Add chopped chillies or onions if available.",
      "Add the potato cubes, salt, and a pinch of turmeric powder. Mix well.",
      "Cover and cook on medium-low heat for 8 minutes, stirring occasionally until potatoes are tender.",
      "Uncover and fry on high heat for 2 minutes to get a crispy golden exterior. Serve hot!"
    ]
  },

  // --- CHEESE MAPPINGS ---
  {
    title: "Gourmet Cheese Toast 🍞🧀",
    description: "Crispy toasted bread loaded with warm, bubbling, melted cheese.",
    cuisine: "Quick Snack / Easy",
    cookingTime: "5 mins",
    required: ["bread", "cheese"],
    optional: ["butter", "chilli", "onion", "ketchup"],
    missing: ["Pepper or Oregano"],
    steps: [
      "Lightly toast a slice of bread on one side in a pan.",
      "Flip, cover the toasted side with cheese slice or shredded cheese.",
      "Sprinkle chopped chillies or onions if available.",
      "Cover the pan with a lid and cook on low heat until the cheese is beautifully melted and gooey."
    ]
  },
  {
    title: "Gooey Cheese Sandwich 🥪🧀",
    description: "Ultimate comfort cheese pocket toasted until golden.",
    cuisine: "Beginner cooking / Fast Food",
    cookingTime: "5 mins",
    required: ["bread", "cheese"],
    optional: ["butter", "onion", "tomato", "chilli", "mayonnaise", "ketchup"],
    missing: ["Salt", "Pepper"],
    steps: [
      "Place cheese (slices or grated) between two slices of bread.",
      "If you have onions, tomatoes, or mayonnaise, layer them inside as well.",
      "Spread butter on the outside slices and grill on a pan on medium-low heat.",
      "Press down gently until the bread is golden-brown and cheese melts completely."
    ]
  },
  {
    title: "Fluffy Cheese Omelette 🍳🧀",
    description: "Protein-rich eggs folded with a rich melting cheese center.",
    cuisine: "Breakfast / High-protein",
    cookingTime: "6 mins",
    required: ["egg", "cheese"],
    optional: ["butter", "onion", "chilli", "tomato"],
    missing: ["Salt", "Black Pepper"],
    steps: [
      "Whisk eggs with a pinch of salt and pepper.",
      "Pour into a hot greased pan (use butter for best flavor).",
      "When the base sets, place cheese in the center.",
      "Fold the sides over the cheese, cook for 1 minute until cheese liquefies, and serve hot."
    ]
  },
  {
    title: "Double Cheese Maggi 🍜🧀",
    description: "Creamy, cheesy street-style instant noodles that melt in your mouth.",
    cuisine: "Hostel-style / Indulgent",
    cookingTime: "6 mins",
    required: ["maggi", "cheese"],
    optional: ["butter", "onion", "chilli", "tomato", "ketchup"],
    missing: ["Water"],
    steps: [
      "Cook Maggi with its tastemaker and optional chopped veggies.",
      "Just before water evaporates, lay a slice of cheese or grated cheese on top.",
      "Cover the pot for 1 minute to let it steam and melt, then stir it gently to make it super creamy!"
    ]
  },
  {
    title: "Cheesy Butter Rice 🍚🧀",
    description: "A quick, warm comfort bowl blending melted cheese and butter.",
    cuisine: "Quick Snack / Comfort Food",
    cookingTime: "5 mins",
    required: ["rice", "cheese"],
    optional: ["butter", "garlic", "chilli"],
    missing: ["Salt", "Black Pepper"],
    steps: [
      "Ensure your steamed rice is hot.",
      "Stir in a dollop of butter, salt, and pepper.",
      "Stir in grated cheese or cheese chunks until the residual heat melts it into the rice grains."
    ]
  },

  // --- BUTTER MAPPINGS ---
  {
    title: "Crispy Butter Toast 🍞🧈",
    description: "Warm, buttery, golden toasted bread. Simple yet delicious.",
    cuisine: "Quick Snack / Breakfast",
    cookingTime: "3 mins",
    required: ["bread", "butter"],
    optional: ["sugar", "jam"],
    missing: [],
    steps: [
      "Melt butter on a medium-hot pan.",
      "Place bread slices on the pan and press down to absorb the butter.",
      "Toast until golden, flip, apply a bit more butter, and toast the other side."
    ]
  },
  {
    title: "Savory Garlic Butter Spread 🧄🧈",
    description: "Fragrant garlic butter toasted bread that mimics high-end garlic bread.",
    cuisine: "Beginner cooking / Side",
    cookingTime: "5 mins",
    required: ["bread", "butter", "garlic"],
    optional: ["chilli"],
    missing: ["Salt"],
    steps: [
      "Mix softened butter with grated garlic and a pinch of salt/chilli flakes.",
      "Spread the garlic butter mixture generously on bread slices.",
      "Toast in a hot pan until crispy and highly aromatic."
    ]
  },
  {
    title: "Warm Butter Garlic Rice 🍚🧈",
    description: "Savory, buttery rice cooked with sautéed aromatic garlic.",
    cuisine: "Quick Meal / Vegetarian",
    cookingTime: "8 mins",
    required: ["rice", "butter", "garlic"],
    optional: ["chilli", "onion", "egg"],
    missing: ["Salt", "Oil"],
    steps: [
      "Melt butter in a pan with a drop of oil to prevent burning.",
      "Sauté chopped garlic and green chillies until golden.",
      "Add cooked rice, sprinkle salt, and stir fry for 3 minutes to coat perfectly in garlic butter."
    ]
  },

  // --- JAM MAPPINGS ---
  {
    title: "Classic Sweet Jam Bread 🍞🍓",
    description: "Sweet, fruity fruit spread sandwich that requires zero cooking.",
    cuisine: "No-Cook / Quick Snack",
    cookingTime: "2 mins",
    required: ["bread", "jam"],
    optional: ["butter", "banana"],
    missing: [],
    steps: [
      "Take two fresh soft bread slices.",
      "Spread a generous layer of sweet jam on one slice.",
      "Drizzle with sliced banana if available, close the sandwich, and enjoy!"
    ]
  },
  {
    title: "Sweet Butter-Jam Toast 🍞🍓🧈",
    description: "Crispy warm toast with melting butter and sweet fruit jam.",
    cuisine: "Quick Snack / Breakfast",
    cookingTime: "4 mins",
    required: ["bread", "jam", "butter"],
    optional: [],
    missing: [],
    steps: [
      "Toast bread in a pan with butter until crispy.",
      "While the toast is steaming hot, spread a layer of sweet jam over it.",
      "The melting butter and jam blend into an amazing sweet-savory bite!"
    ]
  },
  {
    title: "Sweet & Nutty Sandwich 🥪🍓🥜",
    description: "Rich peanut butter paired with sweet fruit jam between bread slices.",
    cuisine: "Quick Snack / High-protein",
    cookingTime: "3 mins",
    required: ["bread", "jam", "peanut butter"],
    optional: ["butter", "banana"],
    missing: [],
    steps: [
      "Spread peanut butter on one slice of bread.",
      "Spread fruit jam on another slice of bread.",
      "Tuck in sliced bananas if available, join them together, and toast or eat fresh!"
    ]
  },

  // --- MAYONNAISE MAPPINGS ---
  {
    title: "Creamy Mayo Sandwich 🥪⚪",
    description: "An incredibly quick, creamy, and cool sandwich filling.",
    cuisine: "Quick Snack / No-Cook",
    cookingTime: "4 mins",
    required: ["bread", "mayonnaise"],
    optional: ["onion", "tomato", "chilli", "cheese"],
    missing: ["Salt", "Pepper"],
    steps: [
      "Finely chop onions and tomatoes.",
      "Mix them in a bowl with 2 tablespoons of mayonnaise, salt, and pepper.",
      "Spread the creamy filling between bread slices and enjoy directly, or toast with butter!"
    ]
  },
  {
    title: "Tangy Mayo Dip 🍟⚪🍅",
    description: "The ultimate dipping sauce for potato chips, biscuits, or snacks.",
    cuisine: "Dips & Dressings / Fast",
    cookingTime: "2 mins",
    required: ["mayonnaise", "ketchup"],
    optional: ["garlic", "chilli"],
    missing: ["Black Pepper"],
    steps: [
      "Mix mayonnaise and ketchup in a 2:1 ratio in a small bowl.",
      "Add a pinch of pepper and finely grated garlic for a gourmet touch.",
      "Use as a dip for chips, lays, biscuits, or french fries."
    ]
  },
  {
    title: "Creamy Mayo Cheese Toast 🍞⚪🧀",
    description: "Crispy toast layered with smooth mayo and melted cheese.",
    cuisine: "Quick Snack / Indulgent",
    cookingTime: "5 mins",
    required: ["bread", "mayonnaise", "cheese"],
    optional: ["butter", "chilli"],
    missing: ["Black Pepper"],
    steps: [
      "Spread a thin layer of mayonnaise on a slice of bread.",
      "Place a cheese slice or grated cheese on top.",
      "Toast in a covered pan on low heat until the bottom is crispy and cheese is melted."
    ]
  },

  // --- PEANUT BUTTER MAPPINGS ---
  {
    title: "Peanut Butter Banana Toast 🍞🥜🍌",
    description: "High-protein, energy-dense breakfast toast perfect for students.",
    cuisine: "Quick Snack / Healthy",
    cookingTime: "3 mins",
    required: ["bread", "peanut butter"],
    optional: ["banana", "honey", "butter"],
    missing: [],
    steps: [
      "Toast a slice of bread in a pan (optionally with butter).",
      "Spread a thick layer of creamy peanut butter over the warm toast.",
      "Top with sliced banana and a drizzle of honey if available."
    ]
  },
  {
    title: "High-Protein Peanut Butter Smoothie 🥛🥜🍌",
    description: "Thick, creamy smoothie loaded with plant protein.",
    cuisine: "Healthy / Drink",
    cookingTime: "3 mins",
    required: ["milk", "peanut butter"],
    optional: ["banana", "apple", "sugar"],
    missing: [],
    steps: [
      "Add 1 cup of cold milk to a blender.",
      "Add 1 sliced banana (or apple) and 1-2 big tablespoons of peanut butter.",
      "Blend on high speed until completely rich, thick, and smooth."
    ]
  },

  // --- YOGURT / CURD MAPPINGS ---
  {
    title: "Sweet Yogurt Fruit Bowl 🥛🍎🍌",
    description: "Refreshing yogurt topped with fresh fruit chunks and honey.",
    cuisine: "Healthy / Breakfast",
    cookingTime: "4 mins",
    required: ["curd", "banana"],
    optional: ["apple", "mango", "sugar", "peanut butter"],
    missing: ["Honey (optional)"],
    steps: [
      "Whisk yogurt or curd in a bowl until smooth (add a little sugar if desired).",
      "Chop bananas, apples, or mangoes into bite-sized pieces.",
      "Layer the fruits over the yogurt, top with a spoonful of peanut butter or honey, and serve cold."
    ]
  },
  {
    title: "Quick Onion-Tomato Raita 🥛🧅🍅",
    description: "Cooling Indian yogurt condiment that pairs perfectly with spicy fried rice or aloo fry.",
    cuisine: "Indian / Side Dish",
    cookingTime: "5 mins",
    required: ["curd"],
    optional: ["onion", "tomato", "chilli", "coriander"],
    missing: ["Salt", "Roasted Cumin Powder"],
    steps: [
      "Whisk curd with a splash of water until smooth.",
      "Stir in finely chopped onions, tomatoes, and green chillies.",
      "Season with salt and cumin powder.",
      "Serve chilled alongside your hot meals."
    ]
  },

  // --- SOY SAUCE MAPPINGS ---
  {
    title: "Umami Soy Garlic Rice 🍚🥢🧄",
    description: "Quick Chinese-style garlic stir-fried rice using soy sauce.",
    cuisine: "Quick Meal / Indo-Chinese",
    cookingTime: "8 mins",
    required: ["rice", "soy sauce", "garlic"],
    optional: ["onion", "chilli", "egg", "chicken", "butter"],
    missing: ["Oil", "Salt"],
    steps: [
      "Sauté chopped garlic, onions, and green chillies in hot oil or butter.",
      "If you have eggs or chicken, cook them in the pan now.",
      "Add cooked rice, pour 1 tablespoon of soy sauce, and toss on high heat for 2 minutes."
    ]
  },
  {
    title: "Street-Style Soy Sauce Noodles 🍜🥢",
    description: "Elevate your instant noodles with savory, deep soy umami flavor.",
    cuisine: "Hostel-style / Fast Food",
    cookingTime: "6 mins",
    required: ["maggi", "soy sauce"],
    optional: ["onion", "chilli", "garlic", "egg", "butter"],
    missing: ["Water"],
    steps: [
      "Boil noodles with tastemaker.",
      "In the final minute of cooking, drizzle 1/2 tablespoon of soy sauce into the pot.",
      "Stir well to let the soy glaze coat the noodles, giving them a darker, richer taste."
    ]
  }
];

// Explicit possible uses for targeted items (at least 3 suggestions each!)
const POSSIBLE_USES_DB: Record<string, { title: string; description: string; steps: string[] }[]> = {
  cheese: [
    {
      title: "Quick Cheese Toast 🍞🧀",
      description: "Melted cheese slice on crispy pan-toasted bread.",
      steps: [
        "Lightly toast bread on a pan.",
        "Add cheese on top, cover with a lid on low heat for 1 minute until melted.",
        "Serve warm."
      ]
    },
    {
      title: "Cheesy Omelette Fold 🍳🧀",
      description: "Eggs cooked flat and folded around gooey cheese.",
      steps: [
        "Pour scrambled seasoned eggs into a buttered pan.",
        "Place cheese in the center as it sets.",
        "Fold, cook for 1 minute, and serve."
      ]
    },
    {
      title: "Cheesy Maggi Hack 🍜🧀",
      description: "Melt cheese into your noodles for supreme creaminess.",
      steps: [
        "Cook Maggi as usual.",
        "Lay a slice of cheese on top 30 seconds before serving.",
        "Mix it in once melted."
      ]
    }
  ],
  butter: [
    {
      title: "Golden Butter Toast 🍞🧈",
      description: "Simple, highly satisfying buttered toasted bread.",
      steps: [
        "Spread soft butter on both sides of a bread slice.",
        "Grill on a pan until golden and crispy."
      ]
    },
    {
      title: "Garlic Butter Glaze 🧄🧈",
      description: "Fragrant garlic-infused butter to spread on anything.",
      steps: [
        "Mix butter with minced garlic and a pinch of salt.",
        "Heat on a pan for 30 seconds to release the aroma.",
        "Brush on toasted bread."
      ]
    },
    {
      title: "Buttery Hot Rice 🍚🧈",
      description: "Glaze hot rice with melting butter and pepper.",
      steps: [
        "Add 1 tbsp of butter into a bowl of steaming hot rice.",
        "Sprinkle black pepper and salt, then mix thoroughly."
      ]
    }
  ],
  jam: [
    {
      title: "Sweet Jam Sandwich 🥪🍓",
      description: "Fruity sweet sandwich requiring zero heat.",
      steps: [
        "Spread fruit jam on fresh bread slices.",
        "Close, cut diagonally, and enjoy instantly."
      ]
    },
    {
      title: "Crispy Jam Toast 🍞🍓",
      description: "Spread cold sweet jam over hot crispy toasted bread.",
      steps: [
        "Dry-toast bread in a pan until crispy.",
        "Spread jam immediately while toast is hot."
      ]
    },
    {
      title: "Jam and Butter Roll 🍞🍓🧈",
      description: "Spread butter and jam together on a soft bread slice and roll it up.",
      steps: [
        "Spread a thin layer of butter on soft bread.",
        "Spread sweet jam over it.",
        "Roll up tightly and eat like a dessert roll!"
      ]
    }
  ],
  mayonnaise: [
    {
      title: "Gourmet Mayo Dip 🍟⚪",
      description: "Creamy dipping sauce for potato chips or french fries.",
      steps: [
        "Spoon mayonnaise into a small bowl.",
        "Stir in pepper and optionally a splash of vinegar or garlic.",
        "Serve as a gourmet dip."
      ]
    },
    {
      title: "Creamy Mayo Toast 🍞⚪",
      description: "Crispy bread with a rich, caramelized toasted mayo top.",
      steps: [
        "Spread mayo on bread.",
        "Toast dry side down first, then lightly sear the mayo side for a savory glaze."
      ]
    },
    {
      title: "Simple Mayo Salad Spread 🥪⚪",
      description: "Sautéed or raw onions mixed with mayo to stuff in bread.",
      steps: [
        "Mix mayo with chopped onions and pepper.",
        "Use as a creamy sandwich spread."
      ]
    }
  ],
  mayo: [
    {
      title: "Gourmet Mayo Dip 🍟⚪",
      description: "Creamy dipping sauce for potato chips or french fries.",
      steps: [
        "Spoon mayonnaise into a small bowl.",
        "Stir in pepper and optionally a splash of vinegar or garlic.",
        "Serve as a gourmet dip."
      ]
    },
    {
      title: "Creamy Mayo Toast 🍞⚪",
      description: "Crispy bread with a rich, caramelized toasted mayo top.",
      steps: [
        "Spread mayo on bread.",
        "Toast dry side down first, then lightly sear the mayo side for a savory glaze."
      ]
    },
    {
      title: "Simple Mayo Salad Spread 🥪⚪",
      description: "Sautéed or raw onions mixed with mayo to stuff in bread.",
      steps: [
        "Mix mayo with chopped onions and pepper.",
        "Use as a creamy sandwich spread."
      ]
    }
  ],
  ketchup: [
    {
      title: "Tangy Snack Dipping Companion 🍟🍅",
      description: "Perfect sweet-sour pairing for any crispy snack.",
      steps: [
        "Pour ketchup into a dipping bowl.",
        "Dip lays, chips, or biscuits."
      ]
    },
    {
      title: "Sweet Ketchup Glaze 🥪🍅",
      description: "Zesty spread to layer in plain bread.",
      steps: [
        "Spread ketchup on soft bread.",
        "Top with sliced boiled potatoes if available."
      ]
    },
    {
      title: "Tangy Maggi Hack 🍜🍅",
      description: "Mix ketchup into cooked Maggi for street-style flavor.",
      steps: [
        "Drizzle 1 tbsp of ketchup over hot Maggi.",
        "Stir to coat the noodles in a tangy glaze."
      ]
    }
  ],
  'peanut butter': [
    {
      title: "Protein Peanut Butter Toast 🍞🥜",
      description: "Toasted bread with a highly filling peanut butter glaze.",
      steps: [
        "Toast a bread slice until golden.",
        "Apply a thick coating of peanut butter while warm so it softens."
      ]
    },
    {
      title: "Peanut Butter Smoothie Add-in 🥛🥜",
      description: "Add high-quality protein to plain milk.",
      steps: [
        "Add milk and a big scoop of peanut butter to a blender or shaker.",
        "Shake vigorously until fully dissolved."
      ]
    },
    {
      title: "PB & Banana Slices 🍌🥜",
      description: "Direct, healthy student snack with zero cooking.",
      steps: [
        "Slice a banana.",
        "Dip banana slices directly into peanut butter for a quick energy kick."
      ]
    }
  ],
  curd: [
    {
      title: "Simple Curd Rice 🍚🥛",
      description: "Mash cooked rice with fresh cooling curd and salt.",
      steps: [
        "Mix cold cooked rice with 3 tbsp of curd.",
        "Season with salt and enjoy."
      ]
    },
    {
      title: "Refreshing Sweet Lassi 🥛✨",
      description: "Frothy yogurt beverage.",
      steps: [
        "Whisk curd, sugar, and cold water until bubbly.",
        "Drink cold."
      ]
    },
    {
      title: "Cooling Cucumber Raita 🥛🥒",
      description: "Perfect side dressing to reduce spice.",
      steps: [
        "Whisk curd with salt.",
        "Add chopped onions or tomatoes, stir, and serve."
      ]
    }
  ],
  yogurt: [
    {
      title: "Simple Curd Rice 🍚🥛",
      description: "Mash cooked rice with fresh cooling curd and salt.",
      steps: [
        "Mix cold cooked rice with 3 tbsp of curd.",
        "Season with salt and enjoy."
      ]
    },
    {
      title: "Refreshing Sweet Lassi 🥛✨",
      description: "Frothy yogurt beverage.",
      steps: [
        "Whisk curd, sugar, and cold water until bubbly.",
        "Drink cold."
      ]
    },
    {
      title: "Cooling Cucumber Raita 🥛🥒",
      description: "Perfect side dressing to reduce spice.",
      steps: [
        "Whisk curd with salt.",
        "Add chopped onions or tomatoes, stir, and serve."
      ]
    }
  ],
  'soy sauce': [
    {
      title: "Soy Garlic Rice Glaze 🍚🥢",
      description: "Drizzle soy sauce over plain warm rice.",
      steps: [
        "Heat cooked rice in a pan.",
        "Add a splash of soy sauce and toss until warm and glistening."
      ]
    },
    {
      title: "Soy Noodle Booster 🍜🥢",
      description: "Inject savory Chinese street-style flavor into noodles.",
      steps: [
        "Add a splash of soy sauce to boiling instant noodles."
      ]
    },
    {
      title: "Savory Vegetable Glaze 🥔🧅🥢",
      description: "Stir-fry potato or onion cubes with soy sauce.",
      steps: [
        "Pan-fry chopped veggies in oil.",
        "Add a dash of soy sauce in the last minute to caramelize."
      ]
    }
  ],
  mango: [
    {
      title: "Fresh Mango Slices 🥭",
      description: "Sweet, juicy ripe mango cheeks.",
      steps: ["Wash, cut vertically around the pit, score crosswise, and scoop out pulp."]
    },
    {
      title: "Sweet Mango Pulp 🍧",
      description: "Direct cooling dessert.",
      steps: ["Mash ripe mango pulp in a bowl with a spoon. Serve cold."]
    },
    {
      title: "Mango Toast Glaze 🍞🥭",
      description: "Spread mango pulp directly over toasted bread for a sweet treat.",
      steps: ["Toast bread, spread mashed sweet mango pulp on top."]
    }
  ],
  bread: [
    {
      title: "Golden Butter Toast 🍞",
      description: "Crispy buttery toasted bread.",
      steps: ["Toast bread on a pan with butter on both sides until golden brown."]
    },
    {
      title: "Sweet Milk Bread 🥛🍞",
      description: "Drizzle warm sweetened milk over toasted bread.",
      steps: ["Pour 3 tbsp of warm sweetened milk over toast to soften."]
    },
    {
      title: "Pan Dry Toast 🍞",
      description: "Perfect base for any spreads.",
      steps: ["Heat bread slice on a dry tawa until crunchy on both sides."]
    }
  ],
  egg: [
    {
      title: "Perfect Boiled Egg 🥚",
      description: "High-protein, highly satisfying meal in minutes.",
      steps: ["Boil egg in water for 9-10 mins, peel, slice, and season with salt."]
    },
    {
      title: "Classic Sunny Side Up 🍳",
      description: "Quick fried egg with a beautiful runny yolk.",
      steps: ["Crack egg in hot buttered pan, cook for 3 mins until whites are set."]
    },
    {
      title: "Hostel Scrambled Eggs 🍳",
      description: "Light, fluffy scrambled eggs cooked in a pan.",
      steps: ["Crack eggs in a buttered pan, stir constantly on low heat until softly set."]
    }
  ],
  milk: [
    {
      title: "Golden Turmeric Milk 🥛✨",
      description: "Warm soothing immunity booster.",
      steps: ["Boil a cup of milk with turmeric powder, pepper, and sugar. Serve warm."]
    },
    {
      title: "Hot Sweet Milk 🥛",
      description: "Simple comforting night drink.",
      steps: ["Boil milk, stir in sugar, and enjoy immediately."]
    },
    {
      title: "Milk Biscuit Dip 🥛🍪",
      description: "Classic study break energy snack.",
      steps: ["Pour a cup of warm milk and dip sweet biscuits into it."]
    }
  ]
};

/**
 * Intelligent Recipe & Pairing Generator
 * Scans available inventory items, rates compatibility, filters noise,
 * and returns safe, logical recipes. Provides fallbacks for all supporting items.
 */
export interface RecipeDebugLog {
  recipeTitle: string;
  matchedIngredients: string[];
  unmatchedIngredients: string[];
  normalizedInventory: string[];
  aliasReplacements: string[];
}

export type IngredientRole =
  | 'main'
  | 'supporting'
  | 'seasoning'
  | 'spice'
  | 'condiment'
  | 'sauce'
  | 'beverage_base'
  | 'cooking_base'
  | 'pantry_staple'
  | 'utility';

export function getIngredientRole(name: string): IngredientRole {
  const norm = getNormalizedBase(name);
  
  if (['water', 'ice', 'ice cube', 'ice cubes'].includes(norm)) return 'utility';
  
  if (['oil', 'butter', 'ghee', 'lard', 'margarine', 'olive oil', 'cooking oil', 'mustard oil', 'sunflower oil', 'refined oil'].includes(norm)) return 'cooking_base';
  
  if (['salt', 'sugar', 'honey', 'pepper', 'black pepper', 'pepper powder', 'peppercorn'].includes(norm)) return 'seasoning';
  
  if (['chilli', 'chili', 'turmeric', 'cumin', 'mustard seed', 'mustard seeds', 'masala', 'cardamom', 'ginger', 'garlic', 'chilli flakes', 'chili flakes', 'chilli powder', 'chili powder', 'oregano'].includes(norm)) return 'spice';
  
  if (['ketchup', 'mayonnaise', 'mayo', 'mustard', 'vinegar', 'dip'].includes(norm)) return 'condiment';
  
  if (['soy sauce', 'chilli sauce', 'schezwan', 'chutney', 'pesto', 'marinara', 'sauce'].includes(norm)) return 'sauce';
  
  if (['milk', 'curd', 'yogurt', 'dahi', 'tea', 'coffee', 'juice', 'soda', 'coke', 'pepsi'].includes(norm)) return 'beverage_base';
  
  if (['flour', 'atta', 'suji', 'ravva'].includes(norm)) return 'pantry_staple';
  
  if (['onion', 'tomato', 'carrot', 'coriander', 'mint', 'spinach', 'palak', 'cabbage', 'capsicum', 'pepper', 'bell pepper', 'mushroom', 'cheese', 'cheese slice', 'cheese slices', 'cheddar', 'mozzarella'].includes(norm)) return 'supporting';
  
  return 'main';
}

export function checkCulinaryCompatibility(ingredients: string[]): { compatible: boolean; reason?: string } {
  const normalized = ingredients.map(i => getNormalizedBase(i));
  
  const hasMango = normalized.some(i => i.includes('mango'));
  const hasBanana = normalized.some(i => i.includes('banana'));
  const hasApple = normalized.some(i => i.includes('apple'));
  
  const hasEgg = normalized.some(i => i.includes('egg'));
  const hasChicken = normalized.some(i => i.includes('chicken') || i.includes('meat') || i.includes('mutton'));
  const hasFish = normalized.some(i => i.includes('fish'));
  const hasOnion = normalized.some(i => i.includes('onion') || i.includes('garlic'));
  const hasTomato = normalized.some(i => i.includes('tomato'));
  const hasChilli = normalized.some(i => i.includes('chilli') || i.includes('chili'));
  const hasMilk = normalized.some(i => i.includes('milk'));
  
  // Fruit + Savory Protein/Alliums conflicts (Requirement 3, 4, 5)
  if (hasMango && (hasEgg || hasChicken || hasFish || hasOnion || hasTomato)) {
    return { compatible: false, reason: "Fruit (Mango) should not be combined with savory proteins, eggs, or onions/tomatoes in main courses." };
  }
  
  if (hasBanana && (hasEgg || hasChicken || hasFish || hasOnion || hasTomato || hasChilli)) {
    return { compatible: false, reason: "Fruit (Banana) is incompatible with hot spices, onions, tomatoes, or savory meats/eggs." };
  }
  
  if (hasApple && (hasEgg || hasChicken || hasFish || hasOnion || hasTomato)) {
    return { compatible: false, reason: "Fruit (Apple) should not be paired with savory proteins, onions, or tomatoes." };
  }
  
  if (hasMilk && hasFish) {
    return { compatible: false, reason: "Milk and fish combination is clinically and culinarily avoided." };
  }
  
  return { compatible: true };
}

export function generateRecipesForInventory(availableItems: { item_name: string }[]): {
  recipes: Recipe[];
  unrelatedWarning: string | null;
  possibleUses: PossibleUse[];
  debugLogs: DebugLog[];
  recipeDebugs?: RecipeDebugLog[];
} {
  const debugLogs: DebugLog[] = [];
  const recipeDebugs: RecipeDebugLog[] = [];

  if (availableItems.length === 0) {
    return {
      recipes: [],
      unrelatedWarning: "Add items expiring soon to see personalized recipe suggestions!",
      possibleUses: [],
      debugLogs: [],
      recipeDebugs: []
    };
  }

  // 1. Analyze and classify roles of all available ingredients (Requirement 1 & 2)
  const activeRoles = availableItems.map(i => ({
    name: i.item_name,
    norm: getNormalizedBase(i.item_name),
    role: getIngredientRole(i.item_name)
  }));

  // Filter out core main or primary supporting items (e.g. cheese, curd, paneer)
  const coreIngredients = activeRoles.filter(
    i => i.role === 'main' || 
         (i.role === 'supporting' && ['cheese', 'curd', 'yogurt', 'paneer'].some(kw => i.norm.includes(kw)))
  );

  // If there are NO main core ingredients, suppress standard meals entirely (Requirement 2 & 9)
  if (coreIngredients.length === 0) {
    const fallbackWarning = "Your active inventory only contains supporting items or seasonings/sauces. Add a core ingredient like bread, eggs, rice, paneer, banana, or mango to unlock full meal suggestions!";
    
    // Generate Possible Uses as normal (Requirement 6 & 11)
    const possibleUses = generatePossibleUsesList(availableItems);
    
    // Populate debug logs
    populateDebugLogsList(availableItems, [], debugLogs);

    return {
      recipes: [],
      unrelatedWarning: fallbackWarning,
      possibleUses: possibleUses.slice(0, 3),
      debugLogs,
      recipeDebugs: []
    };
  }

  // 2. Perform Culinary Compatibility Validation on core inventory (Requirement 4 & 5)
  const coreNames = coreIngredients.map(i => i.name);
  const coreCompat = checkCulinaryCompatibility(coreNames);

  // 3. Match against the registry
  const matchedRecipes: Recipe[] = [];

  for (const registryItem of RECIPE_REGISTRY) {
    let matchedRequiredCount = 0;
    const usedIngredients: string[] = [];
    const matchedIngsDebug: string[] = [];
    const unmatchedIngsDebug: string[] = [];
    const aliasReplacementsDebug: string[] = [];

    // Verify required ingredients match
    for (const reqIngredient of registryItem.required) {
      const found = availableItems.find(invItem => isIngredientMatch(invItem.item_name, reqIngredient));
      if (found) {
        matchedRequiredCount++;
        const prettyName = found.item_name.charAt(0).toUpperCase() + found.item_name.slice(1);
        if (!usedIngredients.includes(prettyName)) {
          usedIngredients.push(prettyName);
        }
        matchedIngsDebug.push(`${reqIngredient} (via "${found.item_name}")`);
        if (getNormalizedBase(found.item_name) !== getNormalizedBase(reqIngredient)) {
          aliasReplacementsDebug.push(`"${found.item_name}" ➜ "${reqIngredient}"`);
        }
      } else {
        unmatchedIngsDebug.push(reqIngredient);
      }
    }

    const compatibilityScore = matchedRequiredCount / registryItem.required.length;

    // Filter Standalone Spices / Condiments as meals (Requirement 2 & 9)
    let hasValidCore = false;
    for (const ing of registryItem.required) {
      const role = getIngredientRole(ing);
      if (role === 'main' || ing === 'cheese' || ing === 'curd' || ing === 'paneer') {
        hasValidCore = true;
      }
    }

    if (compatibilityScore >= 0.5) {
      if (!hasValidCore) {
        continue;
      }

      // Add optional items that the user possesses
      for (const optIngredient of registryItem.optional) {
        const found = availableItems.find(invItem => isIngredientMatch(invItem.item_name, optIngredient));
        if (found) {
          const prettyName = found.item_name.charAt(0).toUpperCase() + found.item_name.slice(1);
          if (!usedIngredients.includes(prettyName)) {
            usedIngredients.push(prettyName);
          }
          matchedIngsDebug.push(`${optIngredient} (optional, via "${found.item_name}")`);
          if (getNormalizedBase(found.item_name) !== getNormalizedBase(optIngredient)) {
            aliasReplacementsDebug.push(`"${found.item_name}" ➜ "${optIngredient}"`);
          }
        }
      }

      // Check culinary compatibility of matched ingredients in this specific recipe (Requirement 4)
      const compatCheck = checkCulinaryCompatibility(usedIngredients);
      if (!compatCheck.compatible) {
        aliasReplacementsDebug.push(`REJECTED: ${compatCheck.reason}`);
        recipeDebugs.push({
          recipeTitle: registryItem.title,
          matchedIngredients: matchedIngsDebug,
          unmatchedIngredients: unmatchedIngsDebug,
          normalizedInventory: availableItems.map(i => `"${i.item_name}" ➜ "${getNormalizedBase(i.item_name)}"`),
          aliasReplacements: aliasReplacementsDebug
        });
        continue;
      }

      // Build missing elements list: check required and optional staples (Requirement 12)
      const missingElements: string[] = [];
      registryItem.required.forEach(req => {
        const hasIt = availableItems.some(invItem => isIngredientMatch(invItem.item_name, req));
        if (!hasIt) {
          missingElements.push(req.charAt(0).toUpperCase() + req.slice(1));
        }
      });

      registryItem.missing.forEach(staple => {
        const hasIt = availableItems.some(invItem => isIngredientMatch(invItem.item_name, staple));
        if (!hasIt) {
          missingElements.push(staple.charAt(0).toUpperCase() + staple.slice(1));
        }
      });

      matchedRecipes.push({
        title: registryItem.title,
        description: registryItem.description,
        cuisine: registryItem.cuisine,
        ingredients: usedIngredients,
        missing: Array.from(new Set(missingElements)),
        steps: registryItem.steps,
        cookingTime: registryItem.cookingTime,
        compatibilityScore
      });
    }

    recipeDebugs.push({
      recipeTitle: registryItem.title,
      matchedIngredients: matchedIngsDebug,
      unmatchedIngredients: unmatchedIngsDebug,
      normalizedInventory: availableItems.map(i => `"${i.item_name}" ➜ "${getNormalizedBase(i.item_name)}"`),
      aliasReplacements: aliasReplacementsDebug
    });
  }

  // Sort recipes by compatibility score
  matchedRecipes.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  let unrelatedWarning: string | null = null;
  
  if (!coreCompat.compatible && coreCompat.reason) {
    unrelatedWarning = `⚠️ Culinary conflict in inventory: ${coreCompat.reason}`;
  } else if (availableItems.length >= 2 && matchedRecipes.length === 0) {
    unrelatedWarning = "Your ingredient combination is safe, but no recipes match. Try adding eggs, bread, rice, or cheese!";
  }

  // Generate Possible Uses
  const possibleUses = generatePossibleUsesList(availableItems);

  // Populate debug logs for individual ingredients
  populateDebugLogsList(availableItems, matchedRecipes, debugLogs);

  return {
    recipes: matchedRecipes.slice(0, 3),
    unrelatedWarning,
    possibleUses: possibleUses.slice(0, 3),
    debugLogs,
    recipeDebugs
  };
}

// Helper to generate possible uses list
function generatePossibleUsesList(availableItems: { item_name: string }[]): PossibleUse[] {
  const possibleUses: PossibleUse[] = [];

  for (const invItemObj of availableItems) {
    const invItem = getNormalizedBase(invItemObj.item_name);
    const category = getIngredientCategory(invItem);
    const role = getIngredientRole(invItemObj.item_name);
    
    const foundKey = Object.keys(POSSIBLE_USES_DB).find(key => 
      invItem.includes(getNormalizedBase(key)) || getNormalizedBase(key).includes(invItem)
    );

    let suggestionsList: { title: string; description: string; steps: string[] }[] = [];

    if (foundKey) {
      suggestionsList = [...POSSIBLE_USES_DB[foundKey]];
    } else {
      const capitalizedName = invItemObj.item_name.charAt(0).toUpperCase() + invItemObj.item_name.slice(1);
      
      // Adapt suggestions template based on ingredient role (Requirement 10 & 11)
      if (role === 'spice' || role === 'seasoning') {
        suggestionsList.push({
          title: `Flavor Enhancer Idea 🧂`,
          description: `Utilize your ${invItemObj.item_name} to lift the taste of basic dishes.`,
          steps: [
            `Add a tiny pinch of ${invItemObj.item_name} to fried rice, scrambled eggs, or butter toast.`,
            `Do not consume directly. Mix thoroughly with hot butter or oil to unlock flavors.`
          ]
        });
      } else if (role === 'condiment' || role === 'sauce') {
        suggestionsList.push({
          title: `Tangy Pairing Dip 🥢`,
          description: `Pair your ${invItemObj.item_name} with simple bread snacks or chips.`,
          steps: [
            `Pour 1 spoonful of ${invItemObj.item_name} into a side cup.`,
            `Use as a direct spread on bread toast, or as a dip for chips and biscuits.`
          ]
        });
      } else if (role === 'utility') {
        suggestionsList.push({
          title: `Utility Usage 💧`,
          description: `Simple essential preparation guidelines for ${invItemObj.item_name}.`,
          steps: [
            `Use purely as a medium for boiling eggs, cooking rice, or brewing tea.`,
            `Keep clean and use as needed for recipe hydration.`
          ]
        });
      } else {
        suggestionsList.push({
          title: `${capitalizedName} Quick Serving Idea 🍽️`,
          description: `Direct and easy snack utilization for your ${invItemObj.item_name}.`,
          steps: [
            `Take a small portion of your fresh ${invItemObj.item_name}.`,
            `Season with a tiny pinch of salt or sugar depending on taste.`,
            `Serve directly as a quick side addition or independent snack.`
          ]
        });
      }

      let compatibleWith = "Bread, Eggs, or Rice";
      if (category === 'fruits') compatibleWith = "Milk, Curd, or other sweet fruits";
      else if (category === 'dairy') compatibleWith = "Bread, Maggi, or hot Rice";
      else if (category === 'condiments' || category === 'sauces') compatibleWith = "Snacks, Chips, Bread, or Fried Rice";
      else if (category === 'cooking_essentials') compatibleWith = "Any potato stir-fry or scrambled eggs";

      suggestionsList.push({
        title: `Perfect Pairing Ideas 🤝`,
        description: `Discover what foods pair beautifully with your ${invItemObj.item_name}.`,
        steps: [
          `Compatible additions: ${compatibleWith}.`,
          `Layer or stir in a small amount of ${invItemObj.item_name} to instantly elevate the meal.`,
          `Combine with these staples to unlock smart recipe suggestions.`
        ]
      });
    }

    possibleUses.push({
      itemName: invItemObj.item_name.charAt(0).toUpperCase() + invItemObj.item_name.slice(1),
      suggestions: suggestionsList.slice(0, 2)
    });
  }

  return possibleUses;
}

// Helper to populate ingredient debug lists
function populateDebugLogsList(
  availableItems: { item_name: string }[],
  matchedRecipes: Recipe[],
  debugLogs: DebugLog[]
) {
  for (const invItemObj of availableItems) {
    const invItem = getNormalizedBase(invItemObj.item_name);
    const category = getIngredientCategory(invItem);
    
    const rejectedForThisItem: { title: string; reason: string; score: number }[] = [];
    RECIPE_REGISTRY.forEach(r => {
      const hasReq = r.required.some(req => isIngredientMatch(invItemObj.item_name, req));
      const hasOpt = r.optional.some(opt => isIngredientMatch(invItemObj.item_name, opt));
      
      if (hasReq || hasOpt) {
        let reqMatched = 0;
        r.required.forEach(req => {
          if (availableItems.some(i => isIngredientMatch(i.item_name, req))) reqMatched++;
        });
        const score = reqMatched / r.required.length;
        if (score < 0.5) {
          rejectedForThisItem.push({
            title: r.title,
            reason: `Missing required ingredients: ${r.required.filter(req => !availableItems.some(i => isIngredientMatch(i.item_name, req))).join(', ')}`,
            score
          });
        }
      }
    });

    debugLogs.push({
      ingredient: invItemObj.item_name,
      recognized: category !== 'other',
      category: category.toUpperCase(),
      matchedRecipesCount: matchedRecipes.filter(r => 
        r.ingredients.some(ing => isIngredientMatch(invItemObj.item_name, ing))
      ).length,
      rejectedRecipes: rejectedForThisItem.slice(0, 3)
    });
  }
}

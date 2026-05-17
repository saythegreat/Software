"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { InventoryList } from './InventoryList';
import { StatsCards } from './StatsCards';
import { Button } from '../ui/Button';
import { Plus, List, Refrigerator, LayoutGrid, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { getExpiryStatus } from '../../utils/dateUtils';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const { items, fetchItems, fetchCategories, categories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Inventory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[] | null>(null);
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  const tabs = [
    { name: 'Inventory', icon: List },
    { name: 'My Fridge', icon: Refrigerator },
    { name: 'Categories', icon: LayoutGrid },
    { name: 'Recipes', icon: UtensilsCrossed },
  ];

  const expiringItems = items.filter(i => getExpiryStatus(i.expiry_date) === 'expiring' || getExpiryStatus(i.expiry_date) === 'expired');
  const fridgeItems = items.filter(i => i.fridge);

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    try {
      const itemNames = items.length > 0 ? items.map(i => i.item_name.trim().toLowerCase()) : ['ingredients'];
      const uniqueItems = Array.from(new Set(itemNames));
      // Shuffle the array to ensure diverse suggestions
      const shuffled = [...uniqueItems].sort(() => 0.5 - Math.random());
      
      const item1 = shuffled[0] || 'ingredients';
      const item2 = shuffled.length > 1 ? shuffled[1] : item1;
      
      // Reset expanded state when generating new recipes
      setExpandedRecipeIndex(null);

      const fetchRecipeForIngredient = async (ingredient: string, fallbackTitle: string) => {
        try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
          const data = await res.json();
          if (!data.meals) throw new Error("No meals");
          
          const randomMeal = data.meals[Math.floor(Math.random() * data.meals.length)];
          const mealRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${randomMeal.idMeal}`);
          const mealData = await mealRes.json();
          const meal = mealData.meals[0];

          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            if (meal[`strIngredient${i}`] && meal[`strIngredient${i}`].trim()) {
              ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
            }
          }

          return {
            title: meal.strMeal,
            description: `A delicious ${meal.strArea || ''} dish highlighting your ${ingredient}.`,
            ingredients: ingredients.slice(0, 6),
            steps: meal.strInstructions.split(/\r?\n/).filter((s: string) => s.trim().length > 0).slice(0, 5)
          };
        } catch {
          return {
            title: fallbackTitle,
            description: `A creative way to use your ${ingredient}.`,
            ingredients: [ingredient, "Pantry staples (oil, salt, pepper)"],
            steps: [
              `Decide if ${ingredient} is best enjoyed as a quick snack, a side, or the star of a meal.`,
              "Gather any complementary items from your fridge or pantry.",
              "Combine them to create a balanced flavor profile.",
              "Serve beautifully and enjoy your creative pairing!"
            ]
          };
        }
      };

      const recipe1 = await fetchRecipeForIngredient(item1, `${item1.charAt(0).toUpperCase() + item1.slice(1)} Delight`);
      const recipe2 = item1 !== item2 
        ? await fetchRecipeForIngredient(item2, `${item2.charAt(0).toUpperCase() + item2.slice(1)} Special`)
        : await fetchRecipeForIngredient(item1, `Another ${item1.charAt(0).toUpperCase() + item1.slice(1)} Idea`);

      // Recipe 3: Combination
      let comboRecipe;
      const hasBakingItems = (item1.includes('milk') && item2.includes('egg')) || (item1.includes('egg') && item2.includes('milk'));
      
      if (hasBakingItems) {
        comboRecipe = {
          title: "Homemade Cake or Pancakes 🥞",
          description: `Since you have both ${item1} and ${item2}, you have the perfect base for baking!`,
          ingredients: [item1, item2, "Flour", "Sugar", "Butter"],
          steps: [
            "Mix the dry ingredients (flour, sugar) in a bowl.",
            `Whisk the ${item1} and ${item2} together, then fold into the dry mix.`,
            "Bake in an oven or cook on a skillet until golden brown.",
            "Top with syrup, frosting, or fresh fruits and enjoy!"
          ]
        };
      } else {
        comboRecipe = {
          title: `${item1.charAt(0).toUpperCase() + item1.slice(1)} & ${item2.charAt(0).toUpperCase() + item2.slice(1)} Fusion 🥘`,
          description: `Combine your ${item1} and ${item2} for a unique fusion dish!`,
          ingredients: [item1, item2, "Favorite seasonings", "A base (rice, pasta, or greens)"],
          steps: [
            `Prepare both ${item1} and ${item2} by washing and chopping if necessary.`,
            "Cook the ingredients together in a pan with some olive oil or butter.",
            "Add your favorite seasonings and let the flavors meld.",
            "Serve hot over your chosen base!"
          ]
        };
      }

      setGeneratedRecipes([recipe1, comboRecipe, recipe2]);

    } catch (error) {
      console.error(error);
      setGeneratedRecipes([{
        title: "Creative Free-style",
        description: `Here's a general guide for unique items!`,
        ingredients: ["Your available items"],
        steps: [
          `Decide if your items are best enjoyed as a quick snack, a side, or the star of a meal.`,
          "Gather any complementary items from your fridge or pantry.",
          "Combine them to create a balanced flavor profile.",
          "Serve beautifully and enjoy your creative pairing!"
        ]
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
              activeTab === tab.name 
                ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <StatsCards />

      <div className="flex items-center justify-between gap-4">
         <h2 className="text-xl font-bold text-gray-800">{activeTab}</h2>
         <Button 
           onClick={() => setIsModalOpen(true)}
           className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
         >
           <Plus className="w-4 h-4 mr-2" /> Add item
         </Button>
      </div>

      {activeTab === 'Inventory' && <InventoryList />}

      {activeTab === 'My Fridge' && (
        <div className="space-y-4">
          {fridgeItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {/* Reuse InventoryList logic but filtered for fridge */}
              <InventoryList fridgeOnly={true} />
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-[2rem] border border-gray-100/50 card-shadow">
              <Refrigerator className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Fridge Empty</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'Categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.length > 0 ? (
            categories.map(category => (
              <div key={category.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between card-shadow hover:scale-[1.02] transition-all">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <LayoutGrid className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800">{category.category_name}</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                       {items.filter(i => i.category === category.category_name).length} items
                     </p>
                   </div>
                 </div>
              </div>
            ))
          ) : (
            // If no categories in DB, show unique categories from items
            Array.from(new Set(items.map(i => i.category || 'General'))).map(catName => (
              <div key={catName} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between card-shadow">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                      <LayoutGrid className="w-6 h-6" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800">{catName}</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                       {items.filter(i => (i.category || 'General') === catName).length} items
                     </p>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      )}
      
      {activeTab === 'Recipes' && (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 text-center space-y-6">
          <UtensilsCrossed className="w-12 h-12 text-emerald-100 mx-auto" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Smart Recipes</h3>
            <p className="text-gray-400 text-sm">AI-powered suggestions based on what's expiring.</p>
          </div>

          {items.length > 0 ? (
            <div className="space-y-6">
              {!generatedRecipes ? (
                <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100/50">
                  <p className="text-emerald-800 text-sm leading-relaxed mb-6">
                    You have <strong>{items.length}</strong> items in your inventory. Let's find something amazing to cook with what you have!
                  </p>
                  <Button 
                    onClick={handleGenerateRecipe}
                    disabled={isGenerating}
                    className="bg-emerald-600 w-full rounded-2xl py-6 text-sm font-bold shadow-lg shadow-emerald-200"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing Ingredients...
                      </div>
                    ) : "Generate Smart Recipes"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {generatedRecipes.map((recipe, index) => {
                    const isExpanded = expandedRecipeIndex === index;
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "text-left bg-emerald-50/30 rounded-[2.5rem] border border-emerald-100 overflow-hidden transition-all duration-300",
                          isExpanded ? "shadow-md" : "hover:border-emerald-200"
                        )}
                      >
                        {/* Accordion Header */}
                        <div 
                          className="p-8 cursor-pointer flex items-center justify-between"
                          onClick={() => setExpandedRecipeIndex(isExpanded ? null : index)}
                        >
                          <div className="space-y-1">
                            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                              Option {index + 1}
                            </div>
                            <h4 className="font-black text-xl text-emerald-900">{recipe.title}</h4>
                            <p className="text-emerald-700/60 text-sm font-medium">{recipe.description}</p>
                          </div>
                          <div className="ml-4 w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-emerald-500 shadow-sm border border-emerald-50">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>

                        {/* Accordion Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-8 pb-8 space-y-6"
                            >
                              <div className="h-px w-full bg-emerald-100/50 mb-6" />
                              
                              <div className="space-y-3">
                                <h5 className="font-bold text-xs uppercase tracking-widest text-emerald-800/50">Ingredients Needed</h5>
                                <div className="flex flex-wrap gap-2">
                                  {recipe.ingredients.map((ing: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-emerald-700 border border-emerald-100 shadow-sm">{ing}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <h5 className="font-bold text-xs uppercase tracking-widest text-emerald-800/50">Instructions</h5>
                                <div className="space-y-3">
                                  {recipe.steps.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-4">
                                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm">{i + 1}</span>
                                      <p className="text-sm text-emerald-800/80 font-medium leading-relaxed">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  <Button 
                    onClick={() => setGeneratedRecipes(null)}
                    className="w-full bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 rounded-2xl py-4 text-xs font-bold"
                  >
                    Try Other Recipes
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">Add items expiring soon to see personalized recipe suggestions!</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};


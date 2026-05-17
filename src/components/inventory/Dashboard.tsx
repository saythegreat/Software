"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { InventoryList } from './InventoryList';
import { StatsCards } from './StatsCards';
import { Button } from '../ui/Button';
import { Plus, List, Refrigerator, LayoutGrid, UtensilsCrossed } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { getExpiryStatus } from '../../utils/dateUtils';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const Dashboard = () => {
  const { items, fetchItems, fetchCategories, categories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Inventory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

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
      const itemPool = items.length > 0 ? items : [{ item_name: 'Available Ingredients' }];
      const randomItem = itemPool[Math.floor(Math.random() * itemPool.length)];
      const mainIngredient = randomItem.item_name;
      
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${mainIngredient.trim().toLowerCase()}`);
      const data = await res.json();

      if (!data.meals) {
        // Fallback for unknown ingredients like "ggg"
        setGeneratedRecipe({
          title: "Creative Free-style",
          description: `We couldn't find a standard recipe specifically for "${mainIngredient}". However, here's a general guide for unique items!`,
          ingredients: [mainIngredient, ...items.filter(i => i.item_name !== mainIngredient).slice(0, 2).map(i => i.item_name)],
          steps: [
            `Decide if ${mainIngredient} is best enjoyed as a quick snack, a side, or the star of a meal.`,
            "Gather any complementary items from your fridge or pantry.",
            "Combine them to create a balanced flavor profile.",
            "Serve beautifully and enjoy your creative pairing!"
          ]
        });
        return;
      }

      // Pick a random meal from the results
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

      setGeneratedRecipe({
        title: meal.strMeal,
        description: `A delicious ${meal.strArea || ''} dish to use your ${mainIngredient}.`,
        ingredients: ingredients.slice(0, 10), // Limit to 10
        steps: meal.strInstructions.split(/\r?\n/).filter((s: string) => s.trim().length > 0).slice(0, 6)
      });

    } catch (error) {
      console.error(error);
      const itemPool = items.length > 0 ? items : [{ item_name: 'Available Ingredients' }];
      const mainIngredient = itemPool[0].item_name;
      setGeneratedRecipe({
        title: `${mainIngredient} Special Mix`,
        description: `A delicious and healthy way to use your ${mainIngredient.toLowerCase()}.`,
        ingredients: items.slice(0, 3).map(i => i.item_name),
        steps: [
          `Prepare the ${mainIngredient.toLowerCase()} by washing and cutting.`,
          "Sauté with some garlic and olive oil.",
          "Season with salt and pepper to taste.",
          "Serve hot and enjoy!"
        ]
      });
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
              {!generatedRecipe ? (
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
                    ) : "Generate Smart Recipe"}
                  </Button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left space-y-6 bg-emerald-50/30 p-8 rounded-[2.5rem] border border-emerald-100"
                >
                  <div className="space-y-1">
                    <h4 className="font-black text-2xl text-emerald-900">{generatedRecipe.title}</h4>
                    <p className="text-emerald-700/60 text-sm font-medium">{generatedRecipe.description}</p>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-widest text-emerald-800/50">Ingredients Needed</h5>
                    <div className="flex flex-wrap gap-2">
                      {generatedRecipe.ingredients.map((ing: string) => (
                        <span key={ing} className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-emerald-700 border border-emerald-100">{ing}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-bold text-xs uppercase tracking-widest text-emerald-800/50">Instructions</h5>
                    <div className="space-y-3">
                      {generatedRecipe.steps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                          <p className="text-sm text-emerald-800/80 font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setGeneratedRecipe(null)}
                    className="w-full bg-white text-emerald-600 border border-emerald-100 hover:bg-emerald-50 rounded-2xl py-4 text-xs font-bold"
                  >
                    Try Another Recipe
                  </Button>
                </motion.div>
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


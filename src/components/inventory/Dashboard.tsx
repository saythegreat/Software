"use client";

import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { InventoryList } from './InventoryList';
import { StatsCards } from './StatsCards';
import { Button } from '../ui/Button';
import { Plus, List, Refrigerator, LayoutGrid, UtensilsCrossed, ChevronDown, ChevronUp, ScanLine, Utensils, Milk, Egg, Carrot, Beef } from 'lucide-react';
import { AddItemModal } from './AddItemModal';
import { ScannerModal } from './ScannerModal';
import { getExpiryStatus, getDaysLeft, getExpiryLabel } from '../../utils/dateUtils';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRecipesForInventory, Recipe, PossibleUse, DebugLog } from '../../lib/recipeGenerator';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { items, fetchItems, fetchCategories, categories } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Inventory');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<Recipe[] | null>(null);
  const [possibleUses, setPossibleUses] = useState<PossibleUse[]>([]);
  const [unrelatedWarning, setUnrelatedWarning] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState<number | null>(null);
  const [expandedUseIndex, setExpandedUseIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [fetchItems, fetchCategories]);

  // Reactive recipe generation whenever active items update!
  useEffect(() => {
    const activeItems = items.filter(i => !i.consumed && !i.wasted);
    if (activeItems.length > 0) {
      const result = generateRecipesForInventory(activeItems);
      setGeneratedRecipes(result.recipes);
      setUnrelatedWarning(result.unrelatedWarning);
      setPossibleUses(result.possibleUses);
      setDebugLogs(result.debugLogs || []);
    } else {
      setGeneratedRecipes([]);
      setPossibleUses([]);
      setUnrelatedWarning(null);
      setDebugLogs([]);
    }
  }, [items]);

  const tabs = [
    { name: 'Inventory', icon: List },
    { name: 'My Fridge', icon: Refrigerator },
    { name: 'Categories', icon: LayoutGrid },
    { name: 'Recipes', icon: UtensilsCrossed },
  ];

  const expiringItems = items.filter(i => !i.consumed && !i.wasted && (getExpiryStatus(i.expiry_date) === 'expiring' || getExpiryStatus(i.expiry_date) === 'expired'));
  const fridgeItems = items.filter(i => i.fridge && !i.consumed && !i.wasted);

  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('milk') || cat.includes('dairy')) return <Milk className="w-5 h-5 text-blue-500" />;
    if (cat.includes('egg')) return <Egg className="w-5 h-5 text-yellow-600" />;
    if (cat.includes('veg') || cat.includes('carrot')) return <Carrot className="w-5 h-5 text-orange-500" />;
    if (cat.includes('meat') || cat.includes('chicken') || cat.includes('beef')) return <Beef className="w-5 h-5 text-red-500" />;
    if (cat.includes('fruit') || cat.includes('apple') || cat.includes('banana')) return <span className="text-lg">🍎</span>;
    return <Utensils className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'expired') return 'bg-red-50 text-red-500 border-red-100';
    if (status === 'expiring') return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-green-50 text-green-600 border-green-100';
  };

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setExpandedRecipeIndex(null);
    setExpandedUseIndex(null);
    
    // Short realistic scanning/analyzing delay
    await new Promise(r => setTimeout(r, 800));

    try {
      const activeItems = items.filter(i => !i.consumed && !i.wasted);
      const result = generateRecipesForInventory(activeItems);
      
      setGeneratedRecipes(result.recipes);
      setUnrelatedWarning(result.unrelatedWarning);
      setPossibleUses(result.possibleUses);
      setDebugLogs(result.debugLogs || []);
      toast.success('Recipes refreshed instantly!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze inventory ingredients.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Pre-compute derived state before JSX (avoids IIFE in JSX which Turbopack rejects)
  const activeItems = items.filter(i => !i.consumed && !i.wasted);
  const catNames = categories.length > 0
    ? categories.map(c => c.category_name)
    : Array.from(new Set(activeItems.map(i => i.category || 'General')));
  const visibleCategories = catNames.filter(catName =>
    activeItems.some(i => (i.category || 'General') === catName)
  );

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
         <div className="flex items-center gap-2">
           <Button
             onClick={() => setIsScannerOpen(true)}
             className="rounded-xl bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold text-xs"
           >
             <ScanLine className="w-4 h-4 mr-2" /> Scan
           </Button>
           <Button 
             onClick={() => setIsModalOpen(true)}
             className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
           >
             <Plus className="w-4 h-4 mr-2" /> Add item
           </Button>
         </div>
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
        <div className="space-y-3">
          {visibleCategories.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-[2rem] border border-gray-100/50 card-shadow">
              <LayoutGrid className="w-16 h-16 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No categories yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleCategories.map(catName => {
                const catItems = activeItems.filter(i => (i.category || 'General') === catName);
                const isExpanded = selectedCategory === catName;
                return (
                  <motion.div key={catName} layout className="overflow-hidden">
                    <button
                      onClick={() => setSelectedCategory(isExpanded ? null : catName)}
                      className={cn(
                        "w-full bg-white p-5 rounded-3xl border flex items-center justify-between card-shadow transition-all",
                        isExpanded ? "border-emerald-200 rounded-b-none" : "border-gray-100 hover:border-emerald-100"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                          {getCategoryIcon(catName)}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-800">{catName}</h3>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            {catItems.length} active {catItems.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                        isExpanded ? "bg-emerald-100 text-emerald-600" : "bg-gray-50 text-gray-400"
                      )}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-t-0 border-emerald-200 rounded-b-3xl bg-emerald-50/30 overflow-hidden"
                        >
                          {catItems.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm font-medium py-8">No items in this category.</p>
                          ) : (
                            <div className="divide-y divide-emerald-100/50">
                              {catItems.map(item => {
                                const status = getExpiryStatus(item.expiry_date);
                                const days = getDaysLeft(item.expiry_date);
                                const label = getExpiryLabel(days);
                                return (
                                  <div key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                                      {getCategoryIcon(item.category || item.item_name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-sm text-gray-700 truncate">{item.item_name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        {item.quantity || 'N/A'}
                                      </p>
                                    </div>
                                    <span className={cn(
                                      "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase",
                                      getStatusColor(status)
                                    )}>{label}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
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

          {activeItems.length === 0 ? (
            <div className="bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">
                {items.length > 0
                  ? 'All your items are consumed or wasted — add new items to generate recipes!'
                  : 'Add items expiring soon to see personalized recipe suggestions!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Unrelated Match warning */}
              {unrelatedWarning && (
                <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-2xl text-left text-xs text-orange-800 space-y-1 mb-6">
                  <span className="font-extrabold flex items-center gap-1.5 text-orange-950">⚠️ COMPATIBILITY NOTE</span>
                  <p className="font-semibold text-orange-800">{unrelatedWarning}</p>
                </div>
              )}

              {/* Standard Matches */}
              {generatedRecipes && generatedRecipes.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-left font-bold text-xs uppercase tracking-widest text-emerald-800/40">Compatible Recipes Found</div>
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
                          isExpanded ? "shadow-md shadow-emerald-500/5 border-emerald-200" : "hover:border-emerald-200"
                        )}
                      >
                        {/* Accordion Header */}
                        <div 
                          className="p-8 cursor-pointer flex items-center justify-between"
                          onClick={() => setExpandedRecipeIndex(isExpanded ? null : index)}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                                {recipe.cuisine}
                              </div>
                              <div className="inline-block px-3 py-1 rounded-full bg-white text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                                ⏱️ {recipe.cookingTime}
                              </div>
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
                                <h5 className="font-bold text-xs uppercase tracking-widest text-emerald-800/50">Ingredients Used</h5>
                                <div className="flex flex-wrap gap-2">
                                  {recipe.ingredients.map((ing: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-white rounded-xl text-xs font-bold text-emerald-700 border border-emerald-100 shadow-sm">{ing}</span>
                                  ))}
                                </div>
                              </div>

                              {recipe.missing.length > 0 && (
                                <div className="space-y-3">
                                  <h5 className="font-bold text-xs uppercase tracking-widest text-orange-800/50">Optional Pantry Staples Needed</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {recipe.missing.map((ing: string, i: number) => (
                                      <span key={i} className="px-3 py-1.5 bg-orange-50/50 rounded-xl text-xs font-bold text-orange-700 border border-orange-100 shadow-sm">{ing}</span>
                                    ))}
                                  </div>
                                </div>
                              )}

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
                </div>
              ) : (
                <div className="bg-gray-50/50 p-8 rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 text-sm font-medium">
                    No fully matching recipes. Try adding more ingredients to unlock dishes!
                  </p>
                </div>
              )}

              {/* Single Ingredients / Practical Possible Uses */}
              {possibleUses.length > 0 && (
                <div className="space-y-6 pt-6 text-left">
                  <div className="h-px w-full bg-gray-100 mb-6" />
                  <div className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Practical Item Suggestions</div>
                  <div className="space-y-4">
                    {possibleUses.map((use, index) => {
                      const isUseExpanded = expandedUseIndex === index;
                      return (
                        <div key={index} className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden">
                          <div 
                            className="p-6 cursor-pointer flex justify-between items-center hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedUseIndex(isUseExpanded ? null : index)}
                          >
                            <div>
                              <h4 className="font-extrabold text-base text-gray-800">{use.itemName} Ideas</h4>
                              <p className="text-xs text-gray-400 font-medium">Simple uses & preparations for your {use.itemName}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm border border-gray-100 flex-shrink-0">
                              {isUseExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isUseExpanded && (
                              <div className="px-6 pb-6 space-y-4">
                                <div className="h-px bg-gray-200/50 mb-2" />
                                {use.suggestions.map((suggestion, sIdx) => (
                                  <div key={sIdx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                      <h5 className="font-bold text-sm text-emerald-800">{suggestion.title}</h5>
                                      <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Use Idea</span>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed">{suggestion.description}</p>
                                    
                                    <div className="space-y-2 pt-2 border-t border-gray-50">
                                      {suggestion.steps.map((step, stIdx) => (
                                        <div key={stIdx} className="flex gap-2 text-xs">
                                          <span className="text-emerald-500 font-bold">•</span>
                                          <p className="text-gray-600 font-medium leading-relaxed">{step}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Debug Panel Section */}
              {debugLogs.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6 text-left">
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-[10px] font-bold text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 px-3 py-2 rounded-xl transition-all uppercase tracking-wider border border-gray-100"
                  >
                    {showDebug ? 'Hide Engine Debug Logs ⚙️' : 'Show Engine Debug Logs ⚙️'}
                  </button>
                  
                  <AnimatePresence>
                    {showDebug && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 bg-gray-900 text-gray-300 p-6 rounded-3xl font-mono text-[11px] space-y-4 border border-gray-800 overflow-hidden leading-relaxed"
                      >
                        <div className="text-emerald-400 font-bold border-b border-gray-800 pb-2 flex justify-between text-xs">
                          <span>⚙️ RECIPE INTELLIGENCE ENGINE</span>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Live Debugger</span>
                        </div>
                        {debugLogs.map((log, lIdx) => (
                          <div key={lIdx} className="space-y-1.5 border-b border-gray-800/40 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-extrabold">🔍 {log.ingredient}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider",
                                log.recognized ? "bg-emerald-950/80 text-emerald-400 border-emerald-900" : "bg-red-950/80 text-red-400 border-red-900"
                              )}>
                                {log.recognized ? `${log.category}` : 'UNRECOGNIZED'}
                              </span>
                            </div>
                            <div className="pl-4 text-gray-400 text-[10px] space-y-1.5">
                              <div>Matched Recipes: <span className="text-emerald-400 font-black">{log.matchedRecipesCount}</span></div>
                              {log.rejectedRecipes && log.rejectedRecipes.length > 0 && (
                                <div className="space-y-1 pt-1">
                                  <span className="text-orange-400 font-bold">Rejected Candidates:</span>
                                  {log.rejectedRecipes.map((rej: any, rIdx: number) => (
                                    <div key={rIdx} className="pl-2 text-gray-500">
                                      • <strong className="text-gray-400">{rej.title}</strong>: {rej.reason} (Score: {(rej.score * 100).toFixed(0)}%)
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isModalOpen && <AddItemModal onClose={() => setIsModalOpen(false)} />}
      {isScannerOpen && <ScannerModal onClose={() => setIsScannerOpen(false)} />}
    </div>
  );
};


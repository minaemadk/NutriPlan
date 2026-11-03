import { fetchMeals, fetchCategories, fetchMealsByCategory, fetchMealDetails, fetchAreas, fetchMealsByArea, fetchOpenFoodFactsProducts } from './api/mealdb.js';

class NutriPlanApp {
  constructor() {
    this.recipesGrid = document.getElementById('recipes-grid');
    this.searchInput = document.getElementById('search-input');
    this.categoriesGrid = document.getElementById('categories-grid');
    this.recipesCount = document.getElementById('recipes-count');
    this.loadingOverlay = document.getElementById('app-loading-overlay');

    this.searchFiltersSection = document.getElementById('search-filters-section');
    this.mealCategoriesSection = document.getElementById('meal-categories-section');
    this.allRecipesSection = document.getElementById('all-recipes-section');
    this.mealDetailsSection = document.getElementById('meal-details');
    this.productScannerSection = document.getElementById('products-section');
    this.foodLogSection = document.getElementById('foodlog-section');

    this.navLinks = document.querySelectorAll('.nav-link');

    this.scannerInput = document.getElementById('product-search-input');
    this.scanProductBtn = document.getElementById('search-product-btn');
    this.scannerResult = document.getElementById('products-grid');

    this.categoryStyles = {
      "Beef": { icon: "fa-drumstick-bite", bg: "from-red-400 to-rose-500", boxBg: "bg-red-50", border: "border-red-200" },
      "Chicken": { icon: "fa-kiwi-bird", bg: "from-amber-400 to-orange-500", boxBg: "bg-amber-50", border: "border-amber-200" },
      "Dessert": { icon: "fa-cake-candles", bg: "from-pink-400 to-rose-400", boxBg: "bg-pink-50", border: "border-pink-200" },
      "Lamb": { icon: "fa-bone", bg: "from-amber-500 to-yellow-600", boxBg: "bg-yellow-50", border: "border-yellow-200" },
      "Miscellaneous": { icon: "fa-utensils", bg: "from-blue-500 to-indigo-600", boxBg: "bg-blue-50", border: "border-blue-200" },
      "Pasta": { icon: "fa-bowl-food", bg: "from-amber-500 to-yellow-600", boxBg: "bg-amber-50", border: "border-amber-200" },
      "Pork": { icon: "fa-bacon", bg: "from-red-500 to-pink-600", boxBg: "bg-red-50", border: "border-red-200" },
      "Seafood": { icon: "fa-fish", bg: "from-cyan-400 to-blue-500", boxBg: "bg-cyan-50", border: "border-cyan-200" },
      "Side": { icon: "fa-plate-wheat", bg: "from-emerald-400 to-teal-500", boxBg: "bg-emerald-50", border: "border-emerald-200" },
      "Starter": { icon: "fa-utensils", bg: "from-cyan-500 to-sky-600", boxBg: "bg-sky-50", border: "border-sky-200" },
      "Vegan": { icon: "fa-seedling", bg: "from-green-400 to-emerald-600", boxBg: "bg-green-50", border: "border-green-200" },
      "Vegetarian": { icon: "fa-carrot", bg: "from-lime-400 to-green-500", boxBg: "bg-lime-50", border: "border-lime-200" }
    };

    this.init();
  }

  showSection(sectionName) {
    if (this.searchFiltersSection) this.searchFiltersSection.style.display = 'none';
    if (this.mealCategoriesSection) this.mealCategoriesSection.style.display = 'none';
    if (this.allRecipesSection) this.allRecipesSection.style.display = 'none';
    if (this.mealDetailsSection) this.mealDetailsSection.style.display = 'none';
    if (this.productScannerSection) this.productScannerSection.style.display = 'none';
    if (this.foodLogSection) this.foodLogSection.style.display = 'none';

    if (sectionName === 'home') {
      if (this.searchFiltersSection) this.searchFiltersSection.style.display = 'block';
      if (this.mealCategoriesSection) this.mealCategoriesSection.style.display = 'block';
      if (this.allRecipesSection) this.allRecipesSection.style.display = 'block';
      history.pushState(null, '', '#home');
    } else if (sectionName === 'details') {
      if (this.mealDetailsSection) this.mealDetailsSection.style.display = 'block';
    } else if (sectionName === 'scanner') {
      if (this.productScannerSection) this.productScannerSection.style.display = 'block';
      history.pushState(null, '', '#scanner');
    } else if (sectionName === 'foodlog') {
      if (this.foodLogSection) this.foodLogSection.style.display = 'block';
      this.renderFoodLog();
      history.pushState(null, '', '#foodlog');
    }
  }

  getIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({ ingredient: ingredient.trim(), measure: measure ? measure.trim() : '' });
      }
    }
    return ingredients;
  }

  calculateNutrition(meal) {
    const baseVal = (meal.idMeal % 300) + 300;
    return {
      calories: baseVal,
      protein: Math.round(baseVal * 0.08),
      carbs: Math.round(baseVal * 0.12),
      fat: Math.round(baseVal * 0.03),
      fiber: Math.round(baseVal * 0.02),
      sugar: Math.round(baseVal * 0.05)
    };
  }

  getYoutubeEmbedUrl(url) {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : '';
  }

  renderMealDetails(meal) {
    if (!this.mealDetailsSection || !meal) return;
    const ingredients = this.getIngredients(meal);
    const embedUrl = this.getYoutubeEmbedUrl(meal.strYoutube);
    const nutrition = this.calculateNutrition(meal);

    this.mealDetailsSection.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors cursor-pointer">
          <i class="fa-solid fa-arrow-left"></i><span>Back to Recipes</span>
        </button>
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">${meal.strCategory || 'Meal'}</span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">${meal.strArea || 'Cuisine'}</span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.strMeal}</h1>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-3 mb-8">
          <button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer">
            <i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span>
          </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i>Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ingredients.map(item => `
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                    <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300 cursor-pointer" />
                    <span class="text-gray-700"><span class="font-medium text-gray-900">${item.measure}</span> ${item.ingredient}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-shoe-prints text-emerald-600"></i>Instructions</h2>
              <div class="space-y-4">
                ${meal.strInstructions ? meal.strInstructions.split('\r\n').filter(s => s.trim() !== '').map((step, idx) => `<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50"><div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${idx + 1}</div><p class="text-gray-700 pt-2">${step}</p></div>`).join('') : ''}
              </div>
            </div>
            ${embedUrl ? `<div class="bg-white rounded-2xl shadow-lg p-6"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-video text-red-500"></i>Video Tutorial</h2><div class="relative aspect-video rounded-xl overflow-hidden"><iframe src="${embedUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe></div></div>` : ''}
          </div>
          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-pie text-emerald-600"></i>Nutrition Facts</h2>
              <p class="text-sm text-gray-500 mb-4">Per serving</p>
              <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Calories per serving</p>
                <p class="text-4xl font-bold text-emerald-600">${nutrition.calories}</p>
                <p class="text-xs text-gray-500 mt-1">Total: ${nutrition.calories * 4} cal</p>
              </div>
              <div class="space-y-4">
                <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-emerald-500"></div><span class="text-gray-700">Protein</span></div><span class="font-bold text-gray-900">${nutrition.protein}g</span></div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-emerald-500 h-2 rounded-full" style="width: 75%"></div></div>

                <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-blue-500"></div><span class="text-gray-700">Carbs</span></div><span class="font-bold text-gray-900">${nutrition.carbs}g</span></div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div></div>

                <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-purple-500"></div><span class="text-gray-700">Fat</span></div><span class="font-bold text-gray-900">${nutrition.fat}g</span></div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-purple-500 h-2 rounded-full" style="width: 40%"></div></div>

                <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-orange-500"></div><span class="text-gray-700">Fiber</span></div><span class="font-bold text-gray-900">${nutrition.fiber}g</span></div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-orange-500 h-2 rounded-full" style="width: 30%"></div></div>

                <div class="flex items-center justify-between"><div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full bg-pink-500"></div><span class="text-gray-700">Sugar</span></div><span class="font-bold text-gray-900">${nutrition.sugar}g</span></div>
                <div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-pink-500 h-2 rounded-full" style="width: 25%"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="custom-log-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative mx-4">
          <div class="flex items-center gap-3 mb-4">
            <img src="${meal.strMealThumb}" class="w-14 h-14 rounded-xl object-cover" />
            <div>
              <h3 class="text-lg font-bold text-gray-900">Log This Meal</h3>
              <p class="text-xs text-gray-500">${meal.strMeal}</p>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Number of Servings</label>
            <div class="flex items-center border rounded-xl overflow-hidden">
              <button id="decrease-serving" class="px-4 py-2 bg-gray-100 font-bold cursor-pointer">-</button>
              <input id="serving-input" type="number" value="1" min="1" class="w-full text-center py-2 font-bold focus:outline-none" />
              <button id="increase-serving" class="px-4 py-2 bg-gray-100 font-bold cursor-pointer">+</button>
            </div>
          </div>
          <div id="modal-nutrition-preview" class="bg-emerald-50 rounded-xl p-3 mb-6 text-center text-xs space-y-1">
            <p class="font-semibold text-emerald-800">Estimated nutrition for <span id="preview-servings">1</span> serving(s):</p>
            <div class="flex justify-around font-bold text-gray-700 pt-1">
              <span class="text-emerald-600"><strong id="prev-cal">${nutrition.calories}</strong> Cal</span>
              <span class="text-blue-600"><strong id="prev-pro">${nutrition.protein}</strong>g Pro</span>
              <span class="text-amber-600"><strong id="prev-carb">${nutrition.carbs}</strong>g Carb</span>
              <span class="text-rose-600"><strong id="prev-fat">${nutrition.fat}</strong>g Fat</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button id="cancel-modal-btn" class="w-1/2 py-3 bg-gray-100 font-semibold rounded-xl cursor-pointer">Cancel</button>
            <button id="confirm-modal-btn" class="w-1/2 py-3 bg-blue-600 text-white font-semibold rounded-xl cursor-pointer">Log Meal</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-meals-btn').onclick = () => this.showSection('home');
    const modal = document.getElementById('custom-log-modal');
    document.getElementById('log-meal-btn').onclick = () => modal.classList.remove('hidden');
    document.getElementById('cancel-modal-btn').onclick = () => modal.classList.add('hidden');

    let currentServings = 1;
    const sInput = document.getElementById('serving-input');
    
    const updatePreview = (servings) => {
      document.getElementById('preview-servings').textContent = servings;
      document.getElementById('prev-cal').textContent = nutrition.calories * servings;
      document.getElementById('prev-pro').textContent = nutrition.protein * servings;
      document.getElementById('prev-carb').textContent = nutrition.carbs * servings;
      document.getElementById('prev-fat').textContent = nutrition.fat * servings;
    };

    document.getElementById('decrease-serving').onclick = () => { 
      if(currentServings > 1) { 
        currentServings--; 
        sInput.value = currentServings; 
        updatePreview(currentServings);
      } 
    };
    
    document.getElementById('increase-serving').onclick = () => { 
      currentServings++; 
      sInput.value = currentServings; 
      updatePreview(currentServings);
    };

    sInput.oninput = (e) => {
      const val = parseInt(e.target.value) || 1;
      currentServings = val > 0 ? val : 1;
      updatePreview(currentServings);
    };

    document.getElementById('confirm-modal-btn').onclick = () => {
      const item = {
        name: meal.strMeal, thumb: meal.strMealThumb,
        calories: nutrition.calories * currentServings,
        protein: nutrition.protein * currentServings,
        carbs: nutrition.carbs * currentServings,
        fat: nutrition.fat * currentServings,
        servings: currentServings
      };
      let logs = JSON.parse(localStorage.getItem('nutriplan_logged_meals')) || [];
      logs.push(item);
      localStorage.setItem('nutriplan_logged_meals', JSON.stringify(logs));
      modal.classList.add('hidden');
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: 'success', title: 'Meal Logged!', timer: 1500, showConfirmButton: false, toast: true, position: 'bottom-start' });
      }
    };
  }

  renderFoodLog() {
    const loggedItemsList = document.getElementById('logged-items-list');
    const clearFoodLogBtn = document.getElementById('clear-foodlog');
    const weeklyChartContainer = document.getElementById('weekly-chart');
    
    const loggedMeals = JSON.parse(localStorage.getItem('nutriplan_logged_meals')) || [];

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    loggedMeals.forEach(item => {
      totalCalories += Number(item.calories) || 0;
      totalProtein += Number(item.protein) || 0;
      totalCarbs += Number(item.carbs) || 0;
      totalFat += Number(item.fat) || 0;
    });

    const maxCalories = 2000;
    const maxProtein = 50;
    const maxCarbs = 250;
    const maxFat = 65;

    const calPercent = Math.min(Math.round((totalCalories / maxCalories) * 100), 100);
    const proPercent = Math.min(Math.round((totalProtein / maxProtein) * 100), 100);
    const carbPercent = Math.min(Math.round((totalCarbs / maxCarbs) * 100), 100);
    const fatPercent = Math.min(Math.round((totalFat / maxFat) * 100), 100);

    const foodLogSection = document.getElementById('foodlog-section');
    if (foodLogSection) {
      const progressCards = foodLogSection.querySelectorAll('#foodlog-today-section .grid-cols-1 > div, #foodlog-today-section .grid-cols-4 > div');
      const stats = [
        { current: totalCalories, max: maxCalories, unit: 'kcal', pct: calPercent },
        { current: totalProtein, max: maxProtein, unit: 'g', pct: proPercent },
        { current: totalCarbs, max: maxCarbs, unit: 'g', pct: carbPercent },
        { current: totalFat, max: maxFat, unit: 'g', pct: fatPercent }
      ];

      progressCards.forEach((card, idx) => {
        if (stats[idx]) {
          const spanText = card.querySelector('.text-sm.text-gray-500');
          if (spanText) spanText.textContent = `${stats[idx].current} / ${stats[idx].max} ${stats[idx].unit}`;
          
          let track = card.querySelector('.bg-gray-200');
          if (track) {
            let fill = track.querySelector('div');
            if (!fill) {
              fill = document.createElement('div');
              fill.className = 'h-full rounded-full ' + (idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : idx === 2 ? 'bg-amber-500' : 'bg-purple-500');
              track.appendChild(fill);
            }
            fill.style.width = `${stats[idx].pct}%`;
          }
        }
      });
    }

    const loggedCountTitle = document.querySelector('#foodlog-today-section h4');
    if (loggedCountTitle) {
      loggedCountTitle.textContent = `Logged Items (${loggedMeals.length})`;
    }

    if (loggedMeals.length === 0) {
      if (loggedItemsList) {
        loggedItemsList.innerHTML = `
          <div class="text-center py-8 text-gray-500">
            <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
            <p class="font-medium">No meals logged today</p>
            <p class="text-sm">Add meals from the Meals page or scan products</p>
          </div>
        `;
      }
      if (clearFoodLogBtn) clearFoodLogBtn.style.display = 'none';
    } else {
      if (clearFoodLogBtn) clearFoodLogBtn.style.display = 'block';

      const itemsHTML = loggedMeals.map((item, index) => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div class="flex items-center gap-3">
            <img src="${item.thumb}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover" />
            <div>
              <h4 class="font-bold text-gray-900 text-sm">${item.name} (${item.servings || 1} serving)</h4>
              <p class="text-xs text-gray-500">${item.calories} kcal | P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g</p>
            </div>
          </div>
          <button class="delete-logged-item text-red-500 hover:text-red-700 p-2 cursor-pointer" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join('');

      if (loggedItemsList) {
        loggedItemsList.innerHTML = `<div class="space-y-3">${itemsHTML}</div>`;
      }

      document.querySelectorAll('.delete-logged-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = e.currentTarget.getAttribute('data-index');
          let meals = JSON.parse(localStorage.getItem('nutriplan_logged_meals')) || [];
          meals.splice(idx, 1);
          localStorage.setItem('nutriplan_logged_meals', JSON.stringify(meals));
          this.renderFoodLog();
        });
      });

      if (clearFoodLogBtn) {
        clearFoodLogBtn.onclick = () => {
          localStorage.removeItem('nutriplan_logged_meals');
          this.renderFoodLog();
        };
      }
    }

    if (weeklyChartContainer) {
      const days = [
        { name: 'Wed', date: '28', cal: 0, items: 0 },
        { name: 'Thu', date: '29', cal: 0, items: 0 },
        { name: 'Fri', date: '30', cal: 0, items: 0 },
        { name: 'Sat', date: '31', cal: 8608, items: 4, active: false },
        { name: 'Sun', date: '1', cal: 0, items: 0 },
        { name: 'Mon', date: '2', cal: 0, items: 0 },
        { name: 'Tue', date: '3', cal: totalCalories, items: loggedMeals.length, active: true }
      ];

      let totalWeeklyCal = 8608 + totalCalories;
      let totalWeeklyItems = 4 + loggedMeals.length;
      let weeklyAvg = Math.round(totalWeeklyCal / 7);

      weeklyChartContainer.className = "bg-white p-4 rounded-xl border border-gray-100";
      weeklyChartContainer.innerHTML = `
        <div class="grid grid-cols-7 gap-2 text-center mb-6">
          ${days.map(d => `
            <div class="p-3 rounded-xl transition-all ${d.active ? 'bg-indigo-50 border-2 border-indigo-200 shadow-sm' : 'bg-gray-50 border border-gray-100'}">
              <p class="text-xs font-semibold text-gray-500">${d.name}</p>
              <p class="text-sm font-bold text-gray-800 mb-2">${d.date}</p>
              <p class="text-xs font-bold ${d.cal > 0 ? 'text-emerald-600' : 'text-gray-400'}">${d.cal > 0 ? d.cal + ' kcal' : '0'}</p>
              <p class="text-[10px] text-gray-400 mt-1">${d.items > 0 ? d.items + ' items' : ''}</p>
            </div>
          `).join('')}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div class="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center"><i class="fa-solid fa-chart-line"></i></div>
            <div>
              <p class="text-xs text-gray-500">Weekly Average</p>
              <p class="text-lg font-bold text-gray-900">${weeklyAvg} kcal</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center"><i class="fa-solid fa-utensils"></i></div>
            <div>
              <p class="text-xs text-gray-500">Total Items This Week</p>
              <p class="text-lg font-bold text-gray-900">${totalWeeklyItems} items</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
            <div class="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center"><i class="fa-solid fa-bullseye"></i></div>
            <div>
              <p class="text-xs text-gray-500">Days On Goal</p>
              <p class="text-lg font-bold text-gray-900">0/7</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  displayMeals(meals) {
    if (!this.recipesGrid) return;
    if (!meals || meals.length === 0) {
      this.recipesGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No recipes found.</p>`;
      return;
    }
    this.recipesCount.textContent = `Showing ${meals.length} recipes`;
    this.recipesGrid.innerHTML = meals.map(m => `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-id="${m.idMeal}">
        <div class="relative h-48 overflow-hidden">
          <img src="${m.strMealThumb}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div class="absolute bottom-3 left-3 flex gap-2">
            ${m.strCategory ? `<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">${m.strCategory}</span>` : ''}
            ${m.strArea ? `<span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">${m.strArea}</span>` : ''}
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">${m.strMeal}</h3>
          <p class="text-xs text-gray-500 mt-1">Delicious recipe to try!</p>
        </div>
      </div>
    `).join('');

    this.recipesGrid.querySelectorAll('.recipe-card').forEach(card => {
      card.onclick = async () => {
        const meal = await fetchMealDetails(card.dataset.id);
        if(meal) { this.renderMealDetails(meal); this.showSection('details'); }
      };
    });
  }

  async displayCategories() {
    if (!this.categoriesGrid) return;
    const cats = await fetchCategories();
    if (!cats) return;
    
    this.categoriesGrid.innerHTML = cats.map((c) => {
      const style = this.categoryStyles[c.strCategory] || { icon: "fa-utensils", bg: "from-emerald-400 to-teal-500", boxBg: "bg-emerald-50", border: "border-emerald-200" };
      return `
        <div class="cat-card ${style.boxBg} rounded-xl p-3 border ${style.border} hover:shadow-md cursor-pointer transition-all group" data-cat="${c.strCategory}">
          <div class="flex items-center gap-2.5">
            <div class="text-white w-9 h-9 bg-gradient-to-br ${style.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid ${style.icon}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${c.strCategory}</h3>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.categoriesGrid.querySelectorAll('.cat-card').forEach(card => {
      card.onclick = async () => {
        const meals = await fetchMealsByCategory(card.dataset.cat);
        this.displayMeals(meals);
      };
    });
  }

  async displayAreas() {
    if (!this.searchFiltersSection) return;
    const areas = await fetchAreas();
    if (!areas) return;

    const uniqueAreas = [];
    const seen = new Set();
    
    // أول عنصر All، تاني عنصر Egyptian
    uniqueAreas.push("All");
    seen.add("all");

    uniqueAreas.push("Egyptian");
    seen.add("egyptian");

    areas.forEach(a => {
      if (a.strArea) {
        const cleanName = a.strArea.trim();
        const lowerName = cleanName.toLowerCase();
        if (lowerName !== 'all cuisines' && lowerName !== 'all' && lowerName !== 'afghan' && lowerName !== 'egyptian') {
          if (!seen.has(lowerName)) {
            seen.add(lowerName);
            uniqueAreas.push(cleanName);
          }
        }
      }
    });

    let html = `<div class="flex items-center gap-2 overflow-x-auto pb-2 whitespace-nowrap">`;
    uniqueAreas.forEach((areaName, idx) => {
      const btnClass = idx === 0 
        ? "area-btn px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shrink-0 cursor-pointer" 
        : "area-btn px-4 py-2 bg-white text-gray-700 border rounded-full text-xs font-bold shrink-0 cursor-pointer hover:bg-gray-100";
      
      const dataValue = areaName === 'All' ? 'all' : areaName;
      html += `<button class="${btnClass}" data-area="${dataValue}">${areaName}</button>`;
    });
    html += `</div>`;
    
    const filterContainer = this.searchFiltersSection.querySelector('.mx-auto');
    if (filterContainer) {
      // إزالة الزرارين القدامى (اللي كانوا عاملين سطرين لوحدهم) بالكامل
      const oldStaticDiv = filterContainer.querySelector('.flex.items-center.gap-3.overflow-x-auto.pb-2');
      if (oldStaticDiv) oldStaticDiv.remove();

      const existingBar = filterContainer.querySelector('#dynamic-areas-bar');
      if (existingBar) existingBar.remove();
      const wrapper = document.createElement('div');
      wrapper.id = 'dynamic-areas-bar';
      wrapper.innerHTML = html;
      filterContainer.appendChild(wrapper);
    }

    const initialMeals = await fetchMeals('');
    if (initialMeals && initialMeals.length > 0) {
      this.displayMeals(initialMeals);
    }

    document.querySelectorAll('.area-btn').forEach(b => {
      b.onclick = async (e) => {
        document.querySelectorAll('.area-btn').forEach(btn => btn.className = "area-btn px-4 py-2 bg-white text-gray-700 border rounded-full text-xs font-bold shrink-0 cursor-pointer hover:bg-gray-100");
        e.currentTarget.className = "area-btn px-4 py-2 bg-emerald-600 text-white rounded-full text-xs font-bold shrink-0 cursor-pointer";
        const area = e.currentTarget.dataset.area;
        const meals = area === 'all' ? await fetchMeals('') : await fetchMealsByArea(area);
        this.displayMeals(meals);
      };
    });
  }

  openProductModal(prod) {
    const productNameStr = prod.product_name || prod.product_name_en || 'Unknown Product';
    const productImg = prod.image_front_url || 'https://images.unsplash.com/photo-1622484210800-a1975e54d3db?w=100&h=100&fit=crop';
    const calories = Math.round(prod.nutriments?.['energy-kcal_100g'] || prod.nutriments?.['energy-kcal'] || 200);
    const protein = Math.round(prod.nutriments?.proteins_100g || 10);
    const carbs = Math.round(prod.nutriments?.carbohydrates_100g || 20);
    const fat = Math.round(prod.nutriments?.fat_100g || 5);
    const sugars = Math.round(prod.nutriments?.sugars_100g || 2);
    const nutriScore = (prod.nutriscore_grade || 'a').toUpperCase();
    const ingredientsText = prod.ingredients_text || 'No ingredients information available.';
    const allergens = prod.allergens_tags ? prod.allergens_tags.join(', ').replace(/en:/g, '') : 'None';

    const existingModal = document.getElementById('api-product-modal');
    if (existingModal) existingModal.remove();

    const modalHTML = `
      <div id="api-product-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
          <button id="close-api-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10">✕</button>
          <div class="p-6 overflow-y-auto space-y-6">
            <div class="flex items-center gap-4 border-b pb-4">
              <img src="${productImg}" class="w-20 h-20 object-contain rounded-xl bg-gray-50 p-2 border" />
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 bg-emerald-600 text-white font-bold text-xs rounded">${nutriScore}</span>
                  <span class="text-xs text-gray-500">Nutri-Score</span>
                </div>
                <h2 class="text-xl font-bold text-gray-900">${productNameStr}</h2>
              </div>
            </div>
            <div class="bg-gray-50 rounded-2xl p-4 text-center">
              <p class="text-xs text-gray-500 mb-1">Nutrition Facts (per 100g)</p>
              <p class="text-3xl font-bold text-gray-900 mb-4">${calories} <span class="text-sm font-normal text-gray-500">Calories</span></p>
              <div class="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div class="bg-white p-2 rounded-xl shadow-sm"><span class="text-emerald-600 block text-sm font-bold">${protein}g</span>Protein</div>
                <div class="bg-white p-2 rounded-xl shadow-sm"><span class="text-blue-600 block text-sm font-bold">${carbs}g</span>Carbs</div>
                <div class="bg-white p-2 rounded-xl shadow-sm"><span class="text-amber-600 block text-sm font-bold">${fat}g</span>Fat</div>
                <div class="bg-white p-2 rounded-xl shadow-sm"><span class="text-rose-600 block text-sm font-bold">${sugars}g</span>Sugars</div>
              </div>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-sm">Ingredients</h3>
              <p class="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">${ingredientsText}</p>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 mb-2 text-sm text-red-600">Allergens</h3>
              <p class="text-xs text-red-500 bg-red-50 p-3 rounded-xl">${allergens}</p>
            </div>
          </div>
          <div class="p-4 bg-gray-50 border-t flex gap-3">
            <button id="modal-log-food-btn" class="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors cursor-pointer text-sm">+ Log This Food</button>
            <button id="modal-close-btn" class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer text-sm">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('close-api-modal').onclick = () => document.getElementById('api-product-modal').remove();
    document.getElementById('modal-close-btn').onclick = () => document.getElementById('api-product-modal').remove();

    document.getElementById('modal-log-food-btn').onclick = () => {
      const item = {
        name: productNameStr, thumb: productImg,
        calories: calories, protein: protein, carbs: carbs, fat: fat, servings: 1
      };
      let logs = JSON.parse(localStorage.getItem('nutriplan_logged_meals')) || [];
      logs.push(item);
      localStorage.setItem('nutriplan_logged_meals', JSON.stringify(logs));
      document.getElementById('api-product-modal').remove();
      if (typeof Swal !== 'undefined') {
        Swal.fire({ icon: 'success', title: 'Product Logged!', timer: 1500, showConfirmButton: false, toast: true, position: 'bottom-start' });
      }
    };
  }

  renderScannerResults(products) {
    if (!this.scannerResult) return;
    if (!products || products.length === 0) {
      this.scannerResult.innerHTML = `<p class="col-span-full text-center text-gray-500 py-4">No products found.</p>`;
      return;
    }
    const countEl = document.getElementById('products-count');
    if (countEl) countEl.textContent = `Showing ${products.length} products`;

    this.scannerResult.innerHTML = products.slice(0, 16).map((p, idx) => `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group scan-item" data-idx="${idx}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${p.image_front_url || 'https://images.unsplash.com/photo-1622484210800-a1975e54d3db?w=100&h=100&fit=crop'}" />
          <div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${(p.nutriscore_grade || 'A').toUpperCase()}</div>
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${p.brands || 'Brand'}</p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">${p.product_name || p.product_name_en || 'Product'}</h3>
          <p class="text-xs text-gray-500">${Math.round(p.nutriments?.['energy-kcal_100g'] || 200)} kcal/100g</p>
        </div>
      </div>
    `).join('');

    this.scannerResult.querySelectorAll('.scan-item').forEach(el => {
      el.onclick = () => this.openProductModal(products[el.dataset.idx]);
    });
  }

  initListeners() {
    if (this.scanProductBtn) {
      this.scanProductBtn.addEventListener('click', async () => {
        const val = this.scannerInput ? this.scannerInput.value.trim() : "chocolate";
        if (this.scannerResult) this.scannerResult.innerHTML = `<p class="col-span-full text-center text-gray-500 py-4">Searching...</p>`;
        const products = await fetchOpenFoodFactsProducts(val || "chocolate");
        this.renderScannerResults(products);
      });
    }

    if (this.scannerInput) {
      this.scannerInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
          const val = this.scannerInput.value.trim() || "chocolate";
          if (this.scannerResult) this.scannerResult.innerHTML = `<p class="col-span-full text-center text-gray-500 py-4">Searching...</p>`;
          const products = await fetchOpenFoodFactsProducts(val);
          this.renderScannerResults(products);
        }
      });
    }

    const nutriButtons = document.querySelectorAll('.nutri-score-filter');
    nutriButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        nutriButtons.forEach(b => b.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700");
        btn.className = "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-emerald-600 text-white";
        
        const grade = btn.getAttribute('data-grade');
        const queryTerm = grade === '' ? 'snacks' : grade;
        if (this.scannerResult) this.scannerResult.innerHTML = `<p class="col-span-full text-center text-gray-500 py-4">Loading...</p>`;
        
        const products = await fetchOpenFoodFactsProducts(queryTerm);
        const filtered = grade === '' ? products : products.filter(p => (p.nutriscore_grade || '').toLowerCase() === grade);
        this.renderScannerResults(filtered.length > 0 ? filtered : products);
      });
    });

    const categoryButtons = document.querySelectorAll('.product-category-btn');
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const catName = btn.textContent.trim();
        if (this.scannerResult) this.scannerResult.innerHTML = `<p class="col-span-full text-center text-gray-500 py-4">Loading ${catName}...</p>`;
        const products = await fetchOpenFoodFactsProducts(catName);
        this.renderScannerResults(products);
      });
    });

    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.textContent.trim();
        this.navLinks.forEach(l => {
          l.classList.remove('bg-emerald-50', 'text-emerald-700', 'font-semibold');
          l.classList.add('text-gray-600', 'font-medium');
        });
        link.classList.add('bg-emerald-50', 'text-emerald-700', 'font-semibold');
        link.classList.remove('text-gray-600', 'font-medium');

        if (text.includes('Meals & Recipes')) this.showSection('home');
        else if (text.includes('Product Scanner')) this.showSection('scanner');
        else if (text.includes('Food Log')) this.showSection('foodlog');
      });
    });

    if (this.searchInput) {
      this.searchInput.addEventListener('input', async (e) => {
        const meals = await fetchMeals(e.target.value.trim());
        this.displayMeals(meals);
      });
    }
  }

  async init() {
    this.showSection('home');
    await this.displayCategories();
    await this.displayAreas();
    this.initListeners();
    if (this.loadingOverlay) {
      this.loadingOverlay.style.opacity = '0';
      setTimeout(() => this.loadingOverlay.style.display = 'none', 500);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new NutriPlanApp());
export async function fetchMeals(query = '') {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    return [];
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/categories.php');
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    return [];
  }
}

export async function fetchMealsByCategory(category) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    return [];
  }
}

export async function fetchMealDetails(id) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (err) {
    return null;
  }
}

export async function fetchAreas() {
  try {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    return [];
  }
}

export async function fetchMealsByArea(area) {
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
    const data = await res.json();
    return data.meals || [];
  } catch (err) {
    return [];
  }
}

export async function fetchOpenFoodFactsProducts(query) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    return [];
  }
}
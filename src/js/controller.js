import * as model from '../js/model';
import { MODAL_CLOSE_SEC } from './config';
import ReceipeView from './Views/receipeViews.js';
import SearchView from './Views/searchView.js';
import ResultsView from './Views/resultsView';
import paginationView from './Views/paginationView';
import bookmarksView from './Views/bookmarksView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
import resultsView from './Views/resultsView';
import addRecipeView from './Views/addRecipeView.js';
import receipeViews from './Views/receipeViews.js';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    ReceipeView.renderSpinner();
    // 0. update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. LOADING RECIPE

    await model.loadRecipe(id);

    // 2. RENDERING RECIPE
    ReceipeView.render(model.state.recipe);

    // bookmarks view
  } catch (err) {
    ReceipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    ResultsView.renderSpinner();

    // 1.  Get search query
    const query = SearchView.getQuery();

    if (!query) return;

    // 2. Load search
    await model.loadSearchResult(query);

    // 3. render result

    ResultsView.render(model.getSearchResultsPage());

    //4. render intial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    ResultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1. render new result

  ResultsView.render(model.getSearchResultsPage(goToPage));

  //2. render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings (state)
  model.updateServings(newServings);

  // update thr recipe view
  // ReceipeView.render(model.state.recipe);
  ReceipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2. update  recipe view
  ReceipeView.update(model.state.recipe);

  //3. Render bookmark
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // upload the new recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recepie
    ReceipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //Rendeer the bookmark View

    bookmarksView.render(model.state.bookmarks);

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  ReceipeView.addHandlerRender(controlRecipes);
  ReceipeView.addHandlerUpdateServings(controlServings);
  ReceipeView.addHandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  console.log('Welcome Home');
};
init();

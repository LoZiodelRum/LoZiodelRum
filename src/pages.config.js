/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AddArticle from './pages/AddArticle';
import AddBartender from './pages/AddBartender';
import AddDrink from './pages/AddDrink';
import AddReview from './pages/AddReview';
import AddVenue from './pages/AddVenue';
import ArticleDetail from './pages/ArticleDetail';
import Community from './pages/Community';
import CommunityFeed from './pages/CommunityFeed';
import Dashboard from './pages/Dashboard';
import DrinkDetail from './pages/DrinkDetail';
import Drinks from './pages/Drinks';
import EditArticle from './pages/EditArticle';
import EditBartender from './pages/EditBartender';
import EditDrink from './pages/EditDrink';
import EditReview from './pages/EditReview';
import EditVenue from './pages/EditVenue';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Magazine from './pages/Magazine';
import Map from './pages/Map';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import VenueDetail from './pages/VenueDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AddArticle": AddArticle,
    "AddBartender": AddBartender,
    "AddDrink": AddDrink,
    "AddReview": AddReview,
    "AddVenue": AddVenue,
    "ArticleDetail": ArticleDetail,
    "Community": Community,
    "CommunityFeed": CommunityFeed,
    "Dashboard": Dashboard,
    "DrinkDetail": DrinkDetail,
    "Drinks": Drinks,
    "EditArticle": EditArticle,
    "EditBartender": EditBartender,
    "EditDrink": EditDrink,
    "EditReview": EditReview,
    "EditVenue": EditVenue,
    "Explore": Explore,
    "Home": Home,
    "Magazine": Magazine,
    "Map": Map,
    "Privacy": Privacy,
    "Profile": Profile,
    "VenueDetail": VenueDetail,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
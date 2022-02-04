import * as FirebaseAuth from './controller/firebase_auth.js';
import * as Home from './viewpage/home_page.js'
import * as About from './viewpage/about_page.js'
import * as SearchPage from './viewpage/search_page.js'
import {routing} from './controller/route.js'
     
FirebaseAuth.addEventListener();
Home.addEventListeners();
About.addEventListeners();
SearchPage.addEventListeners();
window.onload = () => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;

    routing(pathname, hash);
};

window.addEventListener('popstate', e => {
 e.preventDefault(); //no refreshing
 const pathname = e.target.location.pathname;
 const hash = e.target.location.hash;

 routing(pathname,hash);
});
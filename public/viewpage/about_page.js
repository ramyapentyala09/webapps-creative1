import * as Elements from './elements.js'
import { routePath } from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import * as ProtectedMessage from './protected_message.js';

export function addEventListeners(){
    Elements.menuAbout.addEventListener('click', () => {
        history.pushState(null,null, routePath.ABOUT);
        about_page();
    });
}

export function about_page(){
    if(!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }
    Elements.root.innerHTML = `
    <div class="text-center">
              <img
                class="rounded float"
                src="https://t4.ftcdn.net/jpg/00/67/67/67/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
                alt="image"
                style="width: 200px; height: 200px;"
              />
            </div>
    <h3 class ="text-center">Logged in as: ${currentUser.email} </h3>
    `;
}
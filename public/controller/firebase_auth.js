import {
    getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/9.6.3/firebase-auth.js'
import * as Elements from '../viewpage/elements.js'
import * as Util from '../viewpage/util.js'
import * as Constants from '../model/constants.js'
import { routing, routePath } from './route.js';
import * as WelcomeMessage from '../viewpage/welcome_message.js'

const auth = getAuth();

export let currentUser = null;

export function addEventListener() {

    Elements.formSignIn.addEventListener('submit', async e => {
        e.preventDefault(); // keeps from refreshing the current page.
        const email = e.target.email.value;
        const password = e.target.password.value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            Elements.modalSignin.hide();
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            Util.info('Sign in Error', JSON.stringify(error), Elements.modalSignin);
            if (Constants.DEV)
                console.log(`sign Error: ${errorCode} | ${errorMessage}`);
        }

    });

    Elements.formCreateAccount.addEventListener('submit', async e => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const passwordConfirm = e.target.passwordConfirm.value;

        if (password !== passwordConfirm) {
            alert('password and its confirm do not match');
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            e.target.reset();
            Util.info('Account Created', `You are now signed in as ${email}`, Elements.modalCreateAccount);
        } catch (e) {
            if (Constants.DEV) console.log(e);
            Util.info('Failed to create account', JSON.stringify(e), Elements.modalCreateAccount);

        }


    })

    Elements.menuSignOut.addEventListener('click', async () => {
        //signout from firebase auth
        try {
            await signOut(auth);
        } catch (e) {
            Util.info('Sign Out Error', JSON.stringify(e));
            if (Constants.Dev)
                console.log('sign out error ' + e);
        }
    });

    onAuthStateChanged(auth, authStateChangedObserver);
}

function authStateChangedObserver(user) {
    if (user) {
        //signed in
        currentUser = user;
        let elements = document.getElementsByClassName('modal-preauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none';
        }
        elements = document.getElementsByClassName('modal-postauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block';
        }
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        routing(pathname, hash);

    } else {
        //signed out
        currentUser = null;
        let elements = document.getElementsByClassName('modal-preauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'block';
        }
        elements = document.getElementsByClassName('modal-postauth');
        for (let i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none';
        }

        history.pushState(null, null, routePath.HOME);

        Elements.root.innerHTML = WelcomeMessage.html;
    }
}
import * as Elements from './elements.js'
import { routePath } from '../controller/route.js';
import { currentUser } from '../controller/firebase_auth.js';
import * as ProtectedMessage from './protected_message.js'
import { Thread } from '../model/thread.js';
import * as Constants from '../model/constants.js'
import * as FirestoreController from '../controller/firestore_controller.js'
import * as Util from './util.js'
import * as ThreadPage from './thread_page.js'

let updateDocId;

export function addEventListeners() {
    Elements.menuHome.addEventListener('click', async () => {
        history.pushState(null, null, routePath.HOME);
        const label = Util.disableButton(Elements.menuHome);
        await home_page();
        // await Util.sleep(1000);
        Util.enableButton(Elements.menuHome, label);
    });

    Elements.formCreateThread.addEventListener('submit', addNewThread);
    Elements.formUpdateThread.addEventListener('submit', updateTheThread)
    document.addEventListener('click', function (event) {
        // If the clicked element doesn't have the right selector, bail
        if (event.target.matches('.deleteT')) {
            var thread = event.target.value
            // Don't follow the link
            event.preventDefault();
            // Log the clicked element in the console
            FirestoreController.delThread(thread).then(value => {
                Util.info('Success', ' Successfully Deleted Thread', Elements.modalCreateThread);
                // window.location.reload()
                // Success!
                home_page()
            }, reason => {
                Util.info('Error', ' Your are not the owner of this thread so you cannot delete this.', Elements.modalCreateThread);
            });
        }
        if (event.target.matches('.updateT')) {
            event.preventDefault()
            var thread = event.target.value
            updateDocId = thread;
            // // Don't follow the link
            // event.preventDefault();
            // // Log the clicked element in the console
            //  FirestoreController.updateThread(thread).then(value => {
            //     Util.info('Success', ' Successfully Deleted Thread', Elements.modalCreateThread);
            //     // window.location.reload()
            //     // Success!
            //     home_page()
            //   }, reason => {
            //     Util.info('Error', ' Your are not the owner of this thread so you cannot update this.', Elements.modalCreateThread);
            //   });
            // console.log(event.target.value)
        }
        if (event.target.matches('.delit')) {
            var reply = event.target.value
            // Don't follow the link
            event.preventDefault();
            // Log the clicked element in the console
            FirestoreController.deleteReply(reply).then(value => {
                Util.info('Success', ' Successfully Deleted Reply', Elements.modalCreateThread);
                home_page()
                // Success!

            }, reason => {
                Util.info('Error', ' Your are not the creator of this reply so you cannot delete this.', Elements.modalCreateThread);
            });

        }
        else {
            return
        }




    }, false);


}
async function updateTheThread(e) {
    e.preventDefault()
    const updateButton = e.target.getElementsByTagName('button')[0];
    const label = Util.disableButton(updateButton);
    const title = e.target.title.value;
    const content = e.target.content.value;
    const keywords = e.target.keywords.value;
    const uid = currentUser.uid;
    const email = currentUser.email;
    const timestamp = Date.now();
    const keywordsArray = keywords.toLowerCase().match(/\S+/g);

    const thread = new Thread({
        title, uid, content, email, timestamp, keywordsArray
    });
    try {
        FirestoreController.updateThread(updateDocId, thread).then(value => {
            thread.set_docId(value);
            e.target.parentElement.parentElement.children[0].children[1].click()
            Util.info('Success', ' Thread has been updated', Elements.modalCreateThread);
            // window.location.reload()
            // Success!
            home_page()
        }, reason => {
            e.target.parentElement.parentElement.children[0].children[1].click()
            Util.info('Error', ' Your are not the owner of this thread so you cannot update this.', Elements.modalCreateThread);
        });
        //         const docId = await FirestoreController.addThread(thread);
        //         thread.set_docId(docId);
        //         // home_page(); // this will be improved later
        //         const trTag = document.createElement('tr'); // <tr></tr>
        //         trTag.innerHTML = buildThreadView(thread);        
        //         const tableBodyTag = document.getElementById('thread-view-table-body');
        //         tableBodyTag.prepend(trTag);
        // // attach event listener to the new thread form
        const viewForms = document.getElementsByClassName('thread-view-form');

        ThreadPage.attachViewFormEventListener(viewForms[0]);
        e.target.reset(); // clears entries in the form
        const noThreadFound = document.getElementById('no-thread-found');
        if (noThreadFound) {
            noThreadFound.remove();
        }
        // Util.info('Success', ' A new thread has been added', Elements.modalCreateThread);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Util.info('Failed', JSON.stringify(e), Elements.modalCreateThread);
    }

    Util.enableButton(updateButton, label);

}

async function addNewThread(e) {
    e.preventDefault();

    const createButton = e.target.getElementsByTagName('button')[0];
    const label = Util.disableButton(createButton);

    const title = e.target.title.value;
    const content = e.target.content.value;
    const keywords = e.target.keywords.value;
    const uid = currentUser.uid;
    const email = currentUser.email;
    const timestamp = Date.now();
    const keywordsArray = keywords.toLowerCase().match(/\S+/g);

    const thread = new Thread({
        title, uid, content, email, timestamp, keywordsArray
    });

    try {
        const docId = await FirestoreController.addThread(thread);
        thread.set_docId(docId);
        // home_page(); // this will be improved later
        const trTag = document.createElement('tr'); // <tr></tr>
        trTag.innerHTML = buildThreadView(thread);
        const tableBodyTag = document.getElementById('thread-view-table-body');
        tableBodyTag.prepend(trTag);
        // attach event listener to the new thread form
        const viewForms = document.getElementsByClassName('thread-view-form');

        ThreadPage.attachViewFormEventListener(viewForms[0]);
        e.target.reset(); // clears entries in the form
        const noThreadFound = document.getElementById('no-thread-found');
        if (noThreadFound) {
            noThreadFound.remove();
        }
        Util.info('Success', ' A new thread has been added', Elements.modalCreateThread);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Util.info('Failed', JSON.stringify(e), Elements.modalCreateThread);
    }

    Util.enableButton(createButton, label);
}

export async function home_page() {
    if (!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }
    //read all threads from DB and render
    let threadList;
    try {
        threadList = await FirestoreController.getThreadList();

    } catch (e) {
        if (Constants.DEV) console.log(e);
        Util.info('Error to get thread list', JSON.stringify(e));
        return;
    }

    buildHomeScreen(threadList);
}

export function buildHomeScreen(threadList) {
    let html = '';
    html += `
        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal-create-thread">
        + New Thread</button>
        
    `
    html += `
    <table class="table table-striped">
    <thead>
    <tr>
      <th scope="col">Actions</th>
      <th scope="col">Title</th>
      <th scope="col">Keywords</th>
      <th scope="col">Posted By</th>
      <th scope="col">Content</th>
      <th scope="col">Posted At</th>
    </tr>
  </thead>
  <tbody id="thread-view-table-body">
    `;

    threadList.forEach(thread => {
        html += `
            <tr>
                ${buildThreadView(thread)}
            </tr>
            `;
    });

    html += '</tbody></table>';

    if (threadList.length == 0) {
        html += '<h4 id="no-thread-found"> No Threads Found</h4>'
    }

    Elements.root.innerHTML = html;

    // attach event listeners to view buttons
    ThreadPage.addViewFormEvents();
}

function buildThreadView(thread) {
    return `
        <td>
        <form method="post" class="thread-view-form">
        <input type="hidden" name="threadId" value="${thread.docId}">
        <button type="submit" class="btn btn-primary">View</button>
        <button type="deleteT" class="btn btn-danger deleteT" value="${thread.docId}">Delete</button>
        <button type ="updateT" class="btn btn-info updateT" data-bs-toggle="modal" data-bs-target="#modal-update-thread" value="${thread.docId}">
        + Update</button>
        </form>
        </td>
        <td>${thread.title}</td>
        <td>${!thread.keywordsArray || !Array.isArray(thread.keywordsArray) ? '' : thread.keywordsArray.join(' ')}</td>
        <td>${thread.email}</td>
        <td>${thread.content}</td>
        <td>${new Date(thread.timestamp).toString()}</td>
    `;
}
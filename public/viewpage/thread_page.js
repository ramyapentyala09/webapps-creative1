import { currentUser } from "../controller/firebase_auth.js";
import * as ProtectedMessage from './protected_message.js'
import * as Elements from './elements.js'
import * as Util from './util.js'
import * as FirestoreController from '../controller/firestore_controller.js';
import * as Constants from '../model/constants.js'
import { Reply } from "../model/reply.js";
import {routePath} from '../controller/route.js'

export function addViewFormEvents() {
    const viewForms = document.getElementsByClassName('thread-view-form');
    for (let i = 0; i < viewForms.length; i++) {
        attachViewFormEventListener(viewForms[i]);
    }
}

export function attachViewFormEventListener(form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);
        const threadId = e.target.threadId.value;
        history.pushState(null, null, routePath.THREAD + '#' + threadId);
        await thread_page(threadId);
        // await Util.sleep(1000);
        Util.enableButton(button, label);
    });
}
export async function thread_page(threadId) {
    if (!currentUser) {
        Elements.root.innerHTML = ProtectedMessage.html;
        return;
    }
    if (!threadId) {
        Util.info('Error', 'Thread is null; invalid access');
        return;
    }

    // TO-DO list
    // 1. get thread from Firestore by threadId
    // 2. get all replies to this thread
    // 3. display the thread
    // 4. display all replies
    // 5. add a form to post a new reply

    let thread;
    let replies;
    try {
        thread = await FirestoreController.getOneThread(threadId);
        if (!thread) throw `Thread does not exist by id: ${threadId}`;
replies = await FirestoreController.getReplyList(threadId);
    } catch (e) {
        if (Constants.DEV) console.log(e);
        Util.info('Error', JSON.stringify(e));
        return;
}
let html = `
<h4 class="bg-primary text-white">${thread.title}</h4>
<div>${thread.email} (At ${new Date(thread.timestamp).toString()})
</div>
<div class="bg-secondary text-white">${thread.content}
</div>
<hr>
`;
html += '<div id="reply-section">'
// display replies
if (replies && replies.length > 0) {
    replies.forEach(r => {
        html += buildReplyView(r);
    })
}
html += '</div>'
html += `
<div>
<form id="form-add-reply" method="post">
<textarea name="content" required minlength="3" placeholder="Reply to this thread"></textarea>
<br>
<button type="submit" class="btn btn-outline-info">Post reply</button>
</form>
</div>
`;
    Elements.root.innerHTML = html;
    document.getElementById('form-add-reply').addEventListener('submit', async e => {
        e.preventDefault();
        const content = e.target.content.value;
        const uid = currentUser.uid;
        const email = currentUser.email;
     
        const timestamp = Date.now();
        const reply = new Reply({
            uid, email, timestamp, content, threadId,
        });
        const button = e.target.getElementsByTagName('button')[0];
        const label = Util.disableButton(button);
        try {
            const id = await FirestoreController.addReply(reply);
            reply.docId = id;
        } catch (e) {
            if (Constants.DEV) console.log(e);
            Util.info('Error', JSON.stringify(e));
            return;
        }
        // update web browser with added reply
        const replyTag = document.createElement('div');
        replyTag.innerHTML = buildReplyView(reply);
        document.getElementById('reply-section').appendChild(replyTag);
e.target.reset();
Util.enableButton(button, label);
    })
}


function buildReplyView(reply) {
    return `
    <div class="border border-primary">
    <input type="hidden" name="replyId" value="${reply.docId}">
    <div class="bg-info text-white">
    Replied by ${reply.email} (At ${new Date(reply.timestamp).toString()})
    </div>
    <div class="d-flex align-items-center justify-content-between p-2">
    <p style="margin: 0;">${reply.content}</p>
    <button style="height: fit-content;" class="btn btn-danger delit"  value="${reply.docId}"> Delete</button>
    </div>
    </div>
    <hr>
    `;
}
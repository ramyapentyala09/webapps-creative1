import {
    getFirestore, collection, addDoc, getDocs, query, orderBy,
    doc, getDoc, where, deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.6.3/firebase-firestore.js"
import { COLLECTIONS } from "../model/constants.js";
import { Reply } from "../model/reply.js";
import { Thread } from "../model/thread.js";
import { currentUser } from './firebase_auth.js';

const db = getFirestore();

export async function addThread(thread) {
    const docRef = await addDoc(collection(db, COLLECTIONS.THREADS), thread.toFirestore());
    return docRef.id;
}
export async function delThread(threadid) {
    let docRef = doc(db, COLLECTIONS.THREADS, threadid);
    let docSnap = await getDoc(docRef);
    if (docSnap.data().uid === currentUser.uid) {
        const res = await deleteDoc(doc(db, COLLECTIONS.THREADS, threadid));
        return res;
    } else {
        return Promise.reject('You are not owner')
    }

}

export async function updateThread(threadid, content) {
    let docRef = doc(db, COLLECTIONS.THREADS, threadid);
    let docSnap = await getDoc(docRef);
    if (docSnap.data().uid === currentUser.uid) {
        await deleteDoc(doc(db, COLLECTIONS.THREADS, threadid));
        const docRef = await addDoc(collection(db, COLLECTIONS.THREADS), content.toFirestore());
        // const res = await tref.update(content);
        return docRef.id
    } else {
        return Promise.reject('You are not owner')
    }


}
export async function deleteReply(replyid) {
    let docRef = doc(db, COLLECTIONS.REPLIES, replyid);
    let docSnap = await getDoc(docRef);
    let docReff = doc(db, COLLECTIONS.THREADS, docSnap.data().threadId);
    let docSnapp = await getDoc(docReff);
    if (docSnap.data().uid === currentUser.uid || docSnapp.data().uid === currentUser.uid) {
        const res = await deleteDoc(doc(db, COLLECTIONS.REPLIES, replyid));
        return res;
    } else {
        return Promise.reject('You are not owner')
    }
}


export async function getThreadList() {
    let threadList = [];
    const q = query(collection(db, COLLECTIONS.THREADS), orderBy('timestamp', 'desc'));
    const snapShot = await getDocs(q);
    snapShot.forEach(doc => {
        const t = new Thread(doc.data());
        t.set_docId(doc.id);
        threadList.push(t);
    });
    return threadList;
}
export async function getOneThread(threadId) {
    const docRef = doc(db, COLLECTIONS.THREADS, threadId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const t = new Thread(docSnap.data());
    t.set_docId(threadId);
    return t;
}
export async function addReply(reply) {
    const docRef = await addDoc(collection(db, COLLECTIONS.REPLIES), reply.toFirestore());
    return docRef.id;
}
export async function getReplyList(threadId) {
    const q = query(collection(db, COLLECTIONS.REPLIES), where('threadId', '==', threadId), orderBy('timestamp'));
    const snapShot = await getDocs(q);
    const replies = [];
    snapShot.forEach(doc => {
        const r = new Reply(doc.data());
        r.docId = doc.id;
        replies.push(r);
    })

    return replies;

}

export async function searchThreads(keywordsArray) {
    const threadList = [];
    const q = query(collection(db, COLLECTIONS.THREADS),
        where('keywordsArray', 'array-contains-any', keywordsArray),
        orderBy('timestamp', 'desc')
    );
    const snapShot = await getDocs(q);

    snapShot.forEach(doc => {
        const t = new Thread(doc.data());
        t.set_docId(doc.id);
        threadList.push(t);
    })
    return threadList;
}
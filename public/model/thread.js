export class Thread{
    constructor(data){
        this.uid = data.uid;
        this.email = data.email;
        this.title = data.title;
        this.timestamp = data.timestamp;
        this.content = data.content;
        this.keywordsArray = data.keywordsArray;
    }

    set_docId(id) {
        this.docId = id;
    }


    //serilization
    toFirestore() {
        return {
            uid: this.uid,
            email: this.email,
            title: this.title,
            timestamp: this.timestamp,
            content: this.content,
            keywordsArray: this.keywordsArray,
        };
    }
}
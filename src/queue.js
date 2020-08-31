class Queue{
    constructor(){
        this.start = undefined;
        this.end = undefined;
    }

    enqueue(data){
        const node = new Node(data);
        if(this.start === undefined){
            this.start = node;
            this.end = node;
        }
        else{
            this.end.next = node;
            this.end = node;
        }
        this.display();
    }

    dequeue(){
        this.display();
        if(this.start === undefined){
            return('Queue Empty');
        }
        else if(this.start === this.end){
            const node = this.start;
            this.start = undefined;
            this.end = undefined;
            return node;
        }
        else{
            const node = this.start;
            this.start = this.start.next;
            return node;
        }


    }

    display(){
        let node = this.start;
        while(node !== undefined){
            node = node.next;
        }
    }

}

class Node{
    constructor(data){
        this.data = data;
        this.next = undefined;
    }
}

module.exports = Queue;


class Queue {
    constructor() {
        this.queue = [];
        this.free = true;
        this._update = this.update.bind(this);
    }

    update() {
        if (!this.free || this.queue.length == 0) return;
        this.free = false;
        const cur = this.queue.shift();
        cur.f()
            .then(it => {
                this.free = true;
                this.update();
                cur.resolve(it);
            }, it => {
                this.free = true;
                this.update();
                cur.reject(it);
            })
    }

    add(f) {
        return new Promise((resolve, reject) => {
            this.queue.push({f, resolve, reject});
            this.update();
        });
    }
}

module.exports = Queue
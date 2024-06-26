export class EventEmitter {
    #subscribers = {
        // eventName : [callback]
    }
    addEventListener (eventName, callback) {
        this.subscribe(eventName, callback)
    }
    on (eventName, callback) {
        this.subscribe(eventName, callback)
    }

    subscribe (eventName, callback) {
        if(!this.#subscribers[eventName]) {
            this.#subscribers[eventName] = []
        }
        this.#subscribers[eventName].push(callback)
        // Реализация отписки
        return () => {
            this.#subscribers[eventName] = this.#subscribers[eventName].filter(cb => callback !== cb)
        }
    }
    emit (eventName, data= null) {
        this.#subscribers[eventName]?.forEach(callback => callback(data))
    }
    // Реализация отдетного метода для отписки
    off (eventName, callback) {
        this.#subscribers[eventName] = this.#subscribers[eventName].filter(cb => callback !== cb)
    }
}
// module.exports ={
//     EventEmitter
// }
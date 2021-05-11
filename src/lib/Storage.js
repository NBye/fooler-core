const { getData, setData } = require('./Utils');
class Storage {
    set(key, data) {
        if (data === undefined) {
            Object.assign(this, key);
        } else {
            setData(this, key, data);
        }
    }
    get(key) {
        return getData(this, key);
    }
}
module.exports = Storage;
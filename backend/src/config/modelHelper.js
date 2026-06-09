export const addIdAlias = (model) => {
    const originalToJSON = model.prototype.toJSON;
    model.prototype.toJSON = function () {
        const values = originalToJSON ? originalToJSON.call(this) : { ...this.get() };
        values._id = values.id;
        return values;
    };
};

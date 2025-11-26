const applyVirtualId = (schema, virtualField) => {
  schema.virtual(virtualField).get(function getVirtualId() {
    return this._id?.toString();
  });

  const transform = (_, ret) => {
    if (ret._id && !ret[virtualField]) {
      ret[virtualField] = ret._id.toString();
    }
    delete ret._id;
    return ret;
  };

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform
  });
};

module.exports = applyVirtualId;


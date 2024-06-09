class BaseService {
  constructor(Model) {
    this.BaseModel = Model
  }

  list(where) {
    return this.BaseModel.find(where)
  }

  findOne(where) {
    return this.BaseModel.findOne(where)
  }

  create(data) {
    return new this.BaseModel(data).save()
  }

  update(id, data) {
    return this.BaseModel.findByIdAndUpdate(id, data, { new: true })
  }

  updateWhere(where, data) {
    return this.BaseModel.findOneAndUpdate(where, data)
  }

  delete(where) {
    return this.BaseModel.findOneAndDelete(where)
  }
}

module.exports = BaseService

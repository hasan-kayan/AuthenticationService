
//USER MODEL
username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }



// SENSOR MODEL 

sensorName: {
    type: String,
    required: true
  },
  sensorType: {
    type: String,
    required: true
  },
  sensorID: {
    type: String,
    required: true,
    unique: true
  },
  sensorSystemID: {
    type: String,
    required: true
  },
  sensorLocation: {
    type: String,
    required: true
  },
  sensorStatus: {
    type: String,
    required: true
  },
  sensorValue: {
    type: Number,
    required: true
  },
  sensorUnit: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }


  // SYSTEM MODEL

  systemName: {
    type: String,
    required: true
  },
  systemID: {
    type: String,
    required: true,
    unique: true
  },
  systemLocation: {
    type: String,
    required: true
  },
  systemStatus: {
    type: String,
    required: true
  },
  systemValue: {
    type: Number,
    required: true
  },
  systemUnit: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

  // READER MODEL

  readerName: {
    type: String,
    required: true
  },
  readerID: {
    type: String,
    required: true,
    unique: true
  },
  readerLocation: {
    type: String,
    required: true
  },
  readerStatus: {
    type: String,
    required: true
  },
  readerValue: {
    type: Number,
    required: true
  },
  readerUnit: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  


import mongoose from 'mongoose';

export function createModels(connection) {
  const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true, maxlength: 80 },
    version: { type: Number, required: true, default: 0 },
  }, { timestamps: true, versionKey: false, bufferCommands: false });

  const strokeSchema = new mongoose.Schema({
    strokeId: { type: String, required: true },
    roomId: { type: String, required: true },
    authorId: { type: String, required: true },
    tool: { type: String, enum: ['pen', 'rectangle', 'ellipse', 'line', 'arrow', 'text'], required: true },
    color: { type: String, required: true },
    width: { type: Number, required: true },
    points: { type: [[Number]], default: [] },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    w: { type: Number, default: 0 },
    h: { type: Number, default: 0 },
    fillColor: { type: String, default: 'transparent' },
    text: { type: String, default: '' },
    fontSize: { type: Number, default: 18 },
    createdAt: { type: Date, required: true },
    version: { type: Number, required: true },
    active: { type: Boolean, default: true },
  }, { versionKey: false, bufferCommands: false });

  strokeSchema.index({ roomId: 1, strokeId: 1 }, { unique: true });
  strokeSchema.index({ roomId: 1, version: 1 }, { unique: true });

  return { 
    Room: connection.model('Room', roomSchema), 
    Stroke: connection.model('Stroke', strokeSchema) 
  };
}

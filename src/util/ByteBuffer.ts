/**
 * Growable byte buffer for binary data manipulation.
 * Used for reading/writing dictionary binary data.
 */
export class ByteBuffer {
  private buffer: ArrayBuffer;
  private view: DataView;
  private position: number;

  constructor(arg?: number | Uint8Array) {
    if (arg instanceof Uint8Array) {
      const isShared =
        typeof SharedArrayBuffer !== "undefined" && arg.buffer instanceof SharedArrayBuffer;
      const src = isShared
        ? new ArrayBuffer(arg.byteLength)
        : (arg.buffer as ArrayBuffer).slice(arg.byteOffset, arg.byteOffset + arg.byteLength);
      if (isShared) {
        new Uint8Array(src).set(arg);
      }
      this.buffer = src;
      this.view = new DataView(this.buffer);
      this.position = 0;
    } else {
      const size = arg ?? 1024;
      this.buffer = new ArrayBuffer(size);
      this.view = new DataView(this.buffer);
      this.position = 0;
    }
  }

  private ensureCapacity(additional: number): void {
    const required = this.position + additional;
    if (required <= this.buffer.byteLength) return;

    let newSize = this.buffer.byteLength;
    while (newSize < required) {
      newSize *= 2;
    }
    const newBuffer = new ArrayBuffer(newSize);
    new Uint8Array(newBuffer).set(new Uint8Array(this.buffer));
    this.buffer = newBuffer;
    this.view = new DataView(this.buffer);
  }

  size(): number {
    return this.position;
  }

  getPosition(): number {
    return this.position;
  }

  setPosition(pos: number): void {
    this.position = pos;
  }

  getInt8(pos: number): number {
    return this.view.getInt8(pos);
  }

  getInt16(pos: number): number {
    return this.view.getInt16(pos, true);
  }

  getInt32(pos: number): number {
    return this.view.getInt32(pos, true);
  }

  getUint8(pos: number): number {
    return this.view.getUint8(pos);
  }

  getUint16(pos: number): number {
    return this.view.getUint16(pos, true);
  }

  getUint32(pos: number): number {
    return this.view.getUint32(pos, true);
  }

  putInt8(value: number): void {
    this.ensureCapacity(1);
    this.view.setInt8(this.position, value);
    this.position += 1;
  }

  putInt16(value: number): void {
    this.ensureCapacity(2);
    this.view.setInt16(this.position, value, true);
    this.position += 2;
  }

  putInt32(value: number): void {
    this.ensureCapacity(4);
    this.view.setInt32(this.position, value, true);
    this.position += 4;
  }

  putUint8(value: number): void {
    this.ensureCapacity(1);
    this.view.setUint8(this.position, value);
    this.position += 1;
  }

  putUint16(value: number): void {
    this.ensureCapacity(2);
    this.view.setUint16(this.position, value, true);
    this.position += 2;
  }

  putUint32(value: number): void {
    this.ensureCapacity(4);
    this.view.setUint32(this.position, value, true);
    this.position += 4;
  }

  readInt8(): number {
    const value = this.view.getInt8(this.position);
    this.position += 1;
    return value;
  }

  readInt16(): number {
    const value = this.view.getInt16(this.position, true);
    this.position += 2;
    return value;
  }

  readInt32(): number {
    const value = this.view.getInt32(this.position, true);
    this.position += 4;
    return value;
  }

  readUint8(): number {
    const value = this.view.getUint8(this.position);
    this.position += 1;
    return value;
  }

  readUint16(): number {
    const value = this.view.getUint16(this.position, true);
    this.position += 2;
    return value;
  }

  readUint32(): number {
    const value = this.view.getUint32(this.position, true);
    this.position += 4;
    return value;
  }

  readString(length: number): string {
    const bytes = new Uint8Array(this.buffer, this.position, length * 2);
    this.position += length * 2;
    const chars: string[] = [];
    for (let i = 0; i < length; i++) {
      chars.push(
        String.fromCharCode(bytes[i * 2] | (bytes[i * 2 + 1] << 8))
      );
    }
    return chars.join("");
  }

  putString(str: string): void {
    this.ensureCapacity(str.length * 2);
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      this.view.setUint8(this.position++, code & 0xff);
      this.view.setUint8(this.position++, (code >> 8) & 0xff);
    }
  }

  shrink(): Uint8Array {
    return new Uint8Array(this.buffer, 0, this.position);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer, 0, this.position);
  }

  getArrayBuffer(): ArrayBuffer {
    return this.buffer;
  }

  getDataView(): DataView {
    return this.view;
  }
}

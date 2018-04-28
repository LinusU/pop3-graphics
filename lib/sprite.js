const toDataView = require('to-data-view')

const Palette = require('./palette')

const magicNumber = 0x42465350

class Sprite {
  /**
   * @param {'raw' | 'compressed'} type
   * @param {Int8Array} data
   * @param {number} width
   * @param {number} height
   */
  constructor (type, data, width, height) {
    this.type = type
    this.data = data
    this.width = width
    this.height = height
  }

  /**
   * @param {Palette | null} palette
   */
  render (palette) {
    if (palette == null) palette = Palette.default

    const canvas = document.createElement('canvas')

    canvas.width = this.width
    canvas.height = this.height

    this.draw(canvas.getContext('2d'), palette, 0, 0)

    return canvas
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {Palette | null} palette
   * @param {number} dx
   * @param {number} dy
   */
  draw (context, palette, dx, dy) {
    if (palette == null) palette = Palette.default

    if (this.type === 'compressed') return this._drawCompressed(context, palette, dx, dy)
    if (this.type === 'raw') return this._drawRaw(context, palette, dx, dy)
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} context
   * @param {Palette} palette
   * @param {number} dx
   * @param {number} dy
   */
  _drawCompressed (context, palette, dx, dy) {
    let pos = 0

    const udata = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.length)

    for (let y = dy; y < dy + this.height; y++) {
      let x = dx

      while (1) {
        const counter = this.data[pos]; pos += 1

        if (counter === 0) {
          break
        }

        if (counter < 0) {
          x += -counter
        }

        if (counter > 0) {
          for (let i = 0; i < counter; i++) {
            const pixelIndex = udata[pos]; pos += 1
            palette.drawPixel(context, pixelIndex, x, y); x += 1
          }
        }
      }
    }
  }

  /**
   * @private
   * @param {CanvasRenderingContext2D} context
   * @param {Palette} palette
   * @param {number} dx
   * @param {number} dy
   */
  _drawRaw (context, palette, dx, dy) {
    let pos = 0

    const udata = new Uint8Array(this.data.buffer, this.data.byteOffset, this.data.length)

    for (let y = dy; y < dy + this.height; y++) {
      for (let x = dx; x < dx + this.width; x++) {
        const pixelIndex = udata[pos]; pos += 1
        palette.drawPixel(context, pixelIndex, x, y)
      }
    }
  }
}

/**
 * @param {ArrayBuffer} buffer
 * @param {number} byteOffset
 * @param {number} width
 * @param {number} height
 */
Sprite.compressedByteLength = function compressedByteLength (buffer, byteOffset, width, height) {
  let pos = 0

  const data = new Int8Array(buffer, byteOffset)

  for (let y = 0; y < height; y++) {
    while (1) {
      const counter = data[pos]; pos += 1

      if (counter === 0) {
        break
      }

      if (counter > 0) {
        pos += counter
      }
    }
  }

  return pos
}

/**
 * @param {ArrayBuffer | Uint8Array} source
 */
Sprite.loadSpriteFile = function loadSpriteFile (source) {
  const view = toDataView(source)

  if (view.getUint32(0, true) !== magicNumber) {
    throw new Error(`File did not start with the magic number, expected ${magicNumber.toString(16)} got ${view.getUint32(0).toString(16)}`)
  }

  let pos = 8
  const spriteCount = view.getUint32(4, true)

  return Array.from({ length: spriteCount }, () => {
    const width = view.getUint16(pos, true); pos += 2
    const height = view.getUint16(pos, true); pos += 2
    const offset = view.getUint32(pos, true); pos += 4
    const length = Sprite.compressedByteLength(view.buffer, offset, width, height)

    return new Sprite('compressed', new Int8Array(view.buffer, offset, length), width, height)
  })
}

module.exports = Sprite

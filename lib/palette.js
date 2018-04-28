/* global ImageData */

const toDataView = require('to-data-view')

function generateDefaultPalette () {
  return new Palette(Uint32Array.from({ length: 256 }, (_, idx) => {
    return (0x00 << 24) | (idx << 16) | (idx << 8) | idx
  }))
}

class Palette {
  /**
   * @param {Uint32Array} colors
   */
  constructor (colors) {
    this.colors = colors
  }

  /**
   * @param {number} index
   */
  getPixelData (index) {
    const color = this.colors[index]
    const data = new Uint8ClampedArray(4)

    data[0] = (color >> 0) & 0xff
    data[1] = (color >> 8) & 0xff
    data[2] = (color >> 16) & 0xff
    data[3] = 0xff - (color >> 24) & 0xff

    return new ImageData(data, 1, 1)
  }

  /**
   * @param {number} index
   */
  getPixelColorString (index) {
    const color = this.colors[index]
    const data = new Uint8ClampedArray(4)

    data[0] = (color >> 0) & 0xff
    data[1] = (color >> 8) & 0xff
    data[2] = (color >> 16) & 0xff
    data[3] = 0xff - ((color >> 24) & 0xff)

    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${(data[3] / 255).toFixed(3)})`
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} index
   * @param {number} x
   * @param {number} y
   */
  drawPixel (context, index, x, y) {
    context.fillStyle = this.getPixelColorString(index)
    context.fillRect(x, y, 1, 1)
  }
}

Palette.default = generateDefaultPalette()

/**
 * @param {ArrayBuffer | Uint8Array} source
 */
Palette.loadPalette = function loadPalette (source) {
  const view = toDataView(source)

  return new Palette(new Uint32Array(view.buffer, 0, 256))
}

module.exports = Palette

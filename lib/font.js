const Sprite = require('./sprite') // eslint-disable-line no-unused-vars
const Palette = require('./palette') // eslint-disable-line no-unused-vars

class Font {
  /**
   * @param {Sprite[]} sprites
   * @param {Palette} palette
   */
  constructor (sprites, palette) {
    this.sprites = sprites
    this.palette = palette
  }

  /**
   * @param {string} text
   */
  renderText (text) {
    const { height, width } = this.measureText(text)
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    this.drawText(canvas.getContext('2d'), text, 0, 0)

    return canvas
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {string} text
   * @param {number} x
   * @param {number} y
   */
  drawText (context, text, x, y) {
    let offset = 0

    for (const char of text) {
      const sprite = this.sprites[char.codePointAt(0) - 32]

      if (!sprite) {
        throw new Error(`Unsupported char code: ${char.codePointAt(0)}`)
      }

      sprite.draw(context, this.palette, x + offset, y)
      offset += sprite.width
    }
  }

  /**
   * @param {string} text
   */
  measureText (text) {
    let width = 0
    let height = 0

    for (const char of text) {
      const sprite = this.sprites[char.codePointAt(0) - 32]

      if (!sprite) {
        throw new Error(`Unsupported char code: ${char.codePointAt(0)}`)
      }

      width += sprite.width
      height = Math.max(height, sprite.height)
    }

    return { width, height }
  }
}

module.exports = Font

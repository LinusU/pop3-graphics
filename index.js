const toDataView = require('to-data-view')

const Font = require('./lib/font')
const Palette = require('./lib/palette')
const Sprite = require('./lib/sprite')

class Manager {
  /**
   * @param {Map<string, ArrayBuffer | Uint8Array>} files
   */
  constructor (files) {
    this.files = files
  }

  /**
   * @param {string} spriteName
   * @param {number} width
   * @param {number} height
   */
  getRawSprite (spriteName, width, height) {
    const view = toDataView(this.files.get(spriteName))
    const data = new Int8Array(view.buffer, view.byteOffset, view.byteLength)

    return new Sprite('raw', data, width, height)
  }

  /**
   * @param {string} spriteFileName
   * @param {string | null} paletteName
   */
  getFont (spriteFileName, paletteName = null) {
    const sprites = Sprite.loadSpriteFile(this.files.get(spriteFileName))
    const palette = this.getPalette(paletteName)

    return new Font(sprites, palette)
  }

  /**
   * @param {string | null} paletteName
   */
  getPalette (paletteName = null) {
    return paletteName ? Palette.loadPalette(this.files.get(paletteName)) : Palette.default
  }

  /**
   * @param {string} spriteFileName
   */
  getSprites (spriteFileName) {
    return Sprite.loadSpriteFile(this.files.get(spriteFileName))
  }
}

/**
 * @param {Map<string, ArrayBuffer | Uint8Array>} files
 */
module.exports = function init (files) {
  return new Manager(files)
}

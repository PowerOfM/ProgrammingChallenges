// Terminal emulator

// using namespace PC
var PC = window.PC = PC || {}

var TE = PC.TerminalEmulator = function (canvas, w, h) {
  this.canvas = canvas
  var ctx = this.ctx = canvas.getContext('2d')
  this.w = w
  this.h = h
  this.x = 0
  this.y = 0
  this.colorPairs = [{ fg: 'white', bg: 'black' }]

  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight

  this.cw = Math.floor(canvas.width / w)
  this.ch = Math.floor(canvas.height / h)
  this.offsetY = Math.floor(this.ch / 2)

  ctx.font = Math.floor(this.ch) + 'px Space Mono'
  ctx.textBaseline = 'middle'

  this.clear()
}
TE.prototype = {
  constructor: TE,

  clear: function (cp) {
    var ctx = this.ctx
    cp = cp || this.colorPairs[0]
    ctx.fillStyle = cp.bg
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  },
  randomFill: function () {
    var keys = Object.keys(PC.COLORS)
    for (var x = 0; x < this.w; x++) {
      for (var y = 0; y < this.h; y++) {
        this.ctx.fillStyle = PC.COLORS[keys[randInt(0, 148)]]
        this.ctx.fillRect(x * this.cw, y * this.ch, this.cw, this.ch)
      }
    }
  },
  addColor: function (fg, bg) {
    return this.colorPairs.push({ fg, bg })
  },

  fillCell: function (char, x, y, cp, bold) {
    var ctx = this.ctx
    x *= this.cw
    y *= this.ch
    cp = cp || this.colorPairs[0]
    ctx.fillStyle = cp.bg
    ctx.fillRect(x, y, this.cw, this.ch)
    ctx.fillStyle = cp.fg
    ctx.fillText(char, x, y + this.offsetY)
  },
  drawCell: function (char, x, y, cp, bold) {
    var ctx = this.ctx
    x *= this.cw
    y *= this.ch
    cp = cp || this.colorPairs[0]
    ctx.fillStyle = cp.bg
    ctx.fillRect(x, y, this.cw, this.ch)
    ctx.fillStyle = cp.fg
    ctx.fillText(char, x, y + this.offsetY)
  },

  wmove: function (y, x) {
    this.x = x
    this.y = y
  },
  waddch: function (char, cpID, bold) {
    this.drawCell(char, this.x, this.y, this.colorPairs[cpID], bold)

    this.x = (this.x + 1) % this.w
    if (this.x === 0) this.y = (this.y + 1) % this.h
  },
  waddstr: function (str, cpID, bold) {
    var x = this.x
    var y = this.y
    var cp = this.colorPairs[cpID]
    for (var i = 0; i < str.length; i++) {
      this.drawCell(str.charAt(i), x, y, cp, bold)
      x = (x + 1) % this.w
      if (x === 0) y = (y + 1) % this.h
    }
  }
}

function randInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

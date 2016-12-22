// JS port of Trolls/main.cpp by Sam Tyson

// using namespace PC
var PC = window.PC = PC || {}

// Terminal Emulator instance
var te

// Game state
var width
var height
var gg = false
var ggWin = false

// Character positions
var charPosX
var charPosY

// Map Sizes
var MAP_SIZES = ['S', 'M', 'L']
var mapSize = 1

// Trolls
var MAX_TROLLS = 9
var numTrolls = 5
var trolls

// Menu navigation
var selection = 0

var map

function main (canvas) {
  // Window Creation //
  te = new PC.TerminalEmulator(canvas, 80, 40)

  te.addColor('red', 'black')
  te.addColor('black', 'lime')
  te.addColor('black', 'aqua')

  drawMenu()
}

function drawMenu () {
  // Split this part up so it could be recalled without re-initializing TE
  te.clear()

  te.wmove(5, 5)
  te.waddstr('T R O L L S', 1, true)

  te.wmove(8, 8)
  te.waddstr('Start')

  te.wmove(10, 6)
  te.waddstr('Size  :')
  te.wmove(10, 14)
  te.waddch('M')

  te.wmove(12, 6)
  te.waddstr('Trolls:')
  te.wmove(12, 14)
  te.waddch('5')

  te.wmove(14, 8)
  te.waddstr('Leave')

  te.wmove(8, 3)
  te.waddstr('>', 3)

  document.addEventListener('keydown', menuKeyListener)
}

function menuKeyListener (event) {
  te.wmove(8 + (selection * 2), 3)
  te.waddstr(' ', 0)

  switch (event.key) {
    case 'ArrowUp':
      selection--
      if (selection < 0) selection = 3
      return menuUpdate()

    case 'ArrowDown':
      selection = (selection + 1) % 4
      return menuUpdate()

    case 'ArrowLeft':
      if (selection === 1) {
        mapSize--
        if (mapSize < 0) mapSize = MAP_SIZES.length - 1
      } else if (selection === 2) {
        numTrolls--
        if (numTrolls < 1) numTrolls = MAX_TROLLS
      }
      return menuUpdate()

    case 'ArrowRight':
      if (selection === 1) {
        mapSize++
        if (mapSize === MAP_SIZES.length) mapSize = 0
      } else if (selection === 2) {
        numTrolls++
        if (numTrolls > MAX_TROLLS) numTrolls = 1
      }
      return menuUpdate()

    case 'Enter':
      if (selection === 0) return startGame()
      if (selection === 3) endwin()
      return menuUpdate()

    default:
      break
  }
}

function startGame () {
  document.removeEventListener('keydown', menuKeyListener)
  te.clear()
  mapGen(mapSize)

  // Character Placement //
  var charPos = mapGetPlace()
  charPosX = charPos.x
  charPosY = charPos.y
  map[charPosY][charPosX] = '^'

  trolls = []
  for (var i = 0; i < numTrolls; i++) {
    let t = mapGetPlace()
    trolls.push(t)
    map[t.y][t.x] = 'T'
  }

  printMap()
  te.wmove(charPosX, charPosY)

  document.addEventListener('keydown', gameKeyListener)
}

function mapGetPlace () {
  var x, y
  do {
    x = randInt(0, width - 1)
    y = randInt(0, height - 1)
  } while (map[y][x] !== ' ')
  return {x, y}
}

function gameKeyListener (event) {
  // JS OPTIMIZATION
  // Redrawing the entire map is really laggy, so instead only draw changes
  var changes = []
  changes.push({ x: charPosX, y: charPosY, c: ' ' })

  switch (event.key) {
    case 'ArrowUp':
      if (map[charPosY - 1][charPosX] === 'X') {
        gg = true
        ggWin = true
      } else if (charPosY > 2 && map[charPosY - 1][charPosX] === '#' && map[charPosY - 2][charPosX] === ' ') {
        changes.push({ y: charPosY - 1, x: charPosX, c: ' ' })
        changes.push({ y: charPosY - 2, x: charPosX, c: '#' })
        charPosY--
      } else if (map[charPosY - 1][charPosX] === ' ') charPosY--
      changes.push({ y: charPosY, x: charPosX, c: '^' })
      break

    case 'ArrowDown':
      if (map[charPosY + 1][charPosX] === 'X') {
        gg = true
        ggWin = true
      } else if (charPosY < height - 2 && map[charPosY + 1][charPosX] === '#' && map[charPosY + 2][charPosX] === ' ') {
        changes.push({ x: charPosX, y: charPosY + 1, c: ' ' })
        changes.push({ x: charPosX, y: charPosY + 2, c: '#' })
        charPosY++
      } else if (map[charPosY + 1][charPosX] === ' ') charPosY++
      changes.push({ y: charPosY, x: charPosX, c: 'v' })
      break

    case 'ArrowLeft':
      if (map[charPosY][charPosX - 1] === 'X') {
        gg = true
        ggWin = true
      } else if (map[charPosY][charPosX - 1] === '#' && map[charPosY][charPosX - 2] === ' ') {
        changes.push({ y: charPosY, x: charPosX - 1, c: ' ' })
        changes.push({ y: charPosY, x: charPosX - 2, c: '#' })
        charPosX--
      } else if (map[charPosY][charPosX - 1] === ' ') charPosX--
      changes.push({ y: charPosY, x: charPosX, c: '<' })
      break

    case 'ArrowRight':
      if (map[charPosY][charPosX + 1] === 'X') {
        gg = true
        ggWin = true
      } else if (map[charPosY][charPosX + 1] === '#' && map[charPosY][charPosX + 2] === ' ') {
        changes.push({ y: charPosY, x: charPosX + 1, c: ' ' })
        changes.push({ y: charPosY, x: charPosX + 2, c: '#' })
        charPosX++
      } else if (map[charPosY][charPosX + 1] === ' ') charPosX++
      changes.push({ y: charPosY, x: charPosX, c: '>' })
      break

    default:
      break
  }

  changes.push(...trollMove(trolls))
  printMapChanges(changes)

  if (gg) gameOver()
}

function trollMove (trolls) {
  var changes = []

  for (var i = 0; i < numTrolls; i++) {
    let t = trolls[i]
    changes.push({ y: t.y, x: t.x, c: ' ' })

    // Check if troll should move up
    if (map[t.y - 1][t.x] === ' ' && t.y > charPosY) t.y--
    else if (map[t.y + 1][t.x] === ' ' && t.y < charPosY) t.y++
    else if (map[t.y][t.x - 1] === ' ' && t.x > charPosX) t.x--
    else if (map[t.y][t.x + 1] === ' ' && t.x < charPosX) t.x++

    changes.push({ y: t.y, x: t.x, c: 'T' })
    if (t.x === charPosX && t.y === charPosY) {
      gg = true
      ggWin = false
    }
  }

  return changes
}

function mapGen (mapSize) {
  switch (mapSize) {
    case 0:
      map = chopMap([
        '#####################################',
        '# #       #       #     #         # #',
        '# # ##### # ### ##### ### ### ### # #',
        '#       #   # #     #     # # #   # #',
        '##### # ##### ##### ### # # # ##### #',
        '#   # #       #     # # # # #     # #',
        '# # ####### # # ##### ### # ##### # #',
        '# #       # # #   #     #     #   # #',
        '# ####### ### ### # ### ##### # ### #',
        '#     #   # #   # #   #     # #     #',
        '# ### ### # ### # ##### # # # #######',
        '#   #   # # #   #   #   # # #   #   #',
        '####### # # # ##### # ### # ### ### #',
        '#     # #     #   # #   # #   #     #',
        '# ### # ##### ### # ### ### ####### #',
        '# #   #     #     #   # # #       # #',
        '# # ##### # ### ##### # # ####### # #',
        '# #     # # # # #     #       # #   #',
        '# ##### # # # ### ##### ##### # #####',
        '# #   # # #     #     # #   #       #',
        '# # ### ### ### ##### ### # ##### # #',
        '# #         #     #       #       # #',
        '#X###################################'])
      break
    case 1:
      map = chopMap([
        '#########################################################################',
        '#   #               #               #           #                   #   #',
        '#   #   #########   #   #####   #########   #####   #####   #####   #   #',
        '#               #       #   #           #           #   #   #       #   #',
        '#########   #   #########   #########   #####   #   #   #   #########   #',
        '#       #   #               #           #   #   #   #   #           #   #',
        '#   #   #############   #   #   #########   #####   #   #########   #   #',
        '#   #               #   #   #       #           #           #       #   #',
        '#   #############   #####   #####   #   #####   #########   #   #####   #',
        '#           #       #   #       #   #       #           #   #           #',
        '#   #####   #####   #   #####   #   #########   #   #   #   #############',
        '#       #       #   #   #       #       #       #   #   #       #       #',
        '#############   #   #   #   #########   #   #####   #   #####   #####   #',
        '#           #   #           #       #   #       #   #       #           #',
        '#   #####   #   #########   #####   #   #####   #####   #############   #',
        '#   #       #           #           #       #   #   #               #   #',
        '#   #   #########   #   #####   #########   #   #   #############   #   #',
        '#   #           #   #   #   #   #           #               #   #       #',
        '#   #########   #   #   #   #####   #########   #########   #   #########',
        '#   #       #   #   #           #           #   #       #               #',
        '#   #   #####   #####   #####   #########   #####   #   #########   #   #',
        '#   #                   #           #               #               #   #',
        '# X #####################################################################'])
      break
    case 2:
      map = chopMap([
        '################################################################',
        '#        #        #                                            #',
        '#  ####  #  #######  ############################  ##########  #',
        '#     #     #        #     #     #              #     #        #',
        '####  #  ####  #######  #  #  #  #  ##########  ####  #  #######',
        '#     #  #     #        #     #  #        #  #  #     #     #  #',
        '#  ####  #  ####  ###################  #######  ##########  ####',
        '#  #     #  #  #  #              #  #  #     #        #  #     #',
        '#  #######  ####  #  ##########  #  #  #  #  ####  #  #######  #',
        '#        #  #     #     #     #  #  #     #     #  #           #',
        '#  ####  #  #  #######  ####  #  #############  #  #############',
        '#  #     #  #        #     #  #              #  #           #  #',
        '#  #  ####  #############  #  #############  #  ####  ####  ####',
        '#  #  #                    #              #  #     #  #  #     #',
        '#  #  #  ######################  #######  ## ####  #  #  ####  #',
        '#  #        #     #                    #  #     #  #     #     #',
        '#  #######  #  #  #  ####  #######  #######  #  #  ####  #  ####',
        '#  #        #  #  #     #        #  #        #  #  #  #  #     #',
        '#  #  #######  #  ####  #  ##########  ##########  #  #  ####  #',
        '#  #  #        #     #  #     #     #           #  #     #  #  #',
        '#  #  #  #############  ####  #  #############  #  ##########  #',
        '#  #                       #  #     #  #  #     #        #  #  #',
        '#  #  ############################  #######  ##########  ####  #',
        '#  #        #     #  #        #  #  #  #              #  #     #',
        '##########  #  #  #  #  ####  ####  ####  ####  #######  #  ####',
        '#     #     #  #  #  #  #  #        #  #  #     #     #  #     #',
        '#  ####  ####  #  #  #  ################  #  ####  #  #  #######',
        '#           #  #  #  #                 #  #  #     #  #        #',
        '##########  ####  #  ################  #  #  ################  #',
        '#                 #                 #     #              #     X',
        '################################################################'])
      break
  }
}

function chopMap (strs) {
  var map = []
  height = strs.length
  width = strs[0].length
  for (var y = 0; y < strs.length; y++) {
    var row = []
    var str = strs[y]
    for (var x = 0; x < width; x++) {
      row.push(str.charAt(x))
    }
    map.push(row)
  }
  return map
}

function printMap () {
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      let c = map[y][x]
      let cp = 0
      if (c === ' ') cp = 1
      else if (c === 'T') cp = 1
      else if (c === 'X') cp = 2
      else if (c === '^' || c === 'v' || c === '<' || c === '>') cp = 3
      te.drawCell(c, x, y, te.colorPairs[cp])
    }
  }
}

function printMapChanges (changes) {
  for (var i = 0; i < changes.length; i++) {
    let c = changes[i]
    map[c.y][c.x] = c.c
    let cp = 0
    if (c.c === ' ') cp = 0
    if (c.c === 'T') cp = 1
    else if (c.c === 'X') cp = 2
    else if (c.c === '^' || c.c === 'v' || c.c === '<' || c.c === '>') cp = 3
    te.drawCell(c.c, c.x, c.y, te.colorPairs[cp])
  }
}

function menuUpdate () {
  te.wmove(10, 14)
  te.waddch(MAP_SIZES[mapSize])

  te.wmove(12, 14)
  te.waddch(numTrolls + '') // js hacks makes this soooo much easier

  te.wmove(8 + (selection * 2), 3)
  te.waddstr('>', 3)
}

function gameOver () {
  document.removeEventListener('keydown', gameKeyListener)
  te.clear()

  te.wmove(10, width / 2 - 4)
  if (ggWin) {
    te.waddstr('YOU WIN!', 2, true)
  } else {
    te.waddstr('YOU LOSE', 1, true)
  }

  te.wmove(13, width / 2 - 6)
  te.waddstr('ENTER - MENU')

  te.wmove(15, width / 2 - 6)
  te.waddstr('ESC   - QUIT')
  document.addEventListener('keydown', ggKeyListener)
}

function ggKeyListener (event) {
  if (event.key === 'Enter') {
    document.removeEventListener('keydown', ggKeyListener)
    drawMenu()
  }
}

function endwin () {
  PC._endwin = ((PC._endwin || 0) + 1) % (PC._endwinMsgs.length)
  alert(PC._endwinMsgs[PC._endwin])
}

function randInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// START
main(document.getElementById('canvas'))

var debounce = require('debounce')
  , lsb = require('./')
  , encode = lsb.encode
  , decode = lsb.decode

var input = document.getElementById('input').getContext('2d')
  , output = document.getElementById('output').getContext('2d')
  , highlighted = document.getElementById('highlighted').getContext('2d')
  , enlarged = document.getElementById('enlarged').getContext('2d')
  , textarea = document.getElementById('text')

;[input, output, highlighted, enlarged].forEach(function(c) {
  c.canvas.width = 256
  c.canvas.height = 256
})

var nyan = new Image
nyan.onload = function() {
  ;[input, output].forEach(function(c) {
    c.drawImage(nyan, 0, 0, c.canvas.width, c.canvas.height)
  })
  updateText()
}
nyan.src = 'img/nyan.png'

textarea.onkeyup =
textarea.onchange = updateText

function updateText() {
  var stegotext = textarea.value + ''
    , imageData = input.getImageData(0, 0, input.canvas.width, input.canvas.height)

  // Encode image data - ignoring the alpha channel
  // as it would interfere with the RGB channels
  function rgb(n) {
    return n + (n/3)|0
  }
  encode(imageData.data, stegotext, rgb)

  output.putImageData(imageData, 0, 0)

  // Highlight LSBs
  for (var i = rgb(4), l = imageData.data.length; i < l; i += 1) {
    imageData.data[i] = imageData.data[i] & 1 ? 255 : 0
  }
  highlighted.putImageData(imageData, 0, 0)

  // Enlarge the first 100 bits of the image,
  // with R/G/B on seperate pixels
  for (var x = 0; x < 64; x += 1) {
    for (var y = 0; y < 64; y += 1) {
      var val = imageData.data[rgb(x+y*64)]

      enlarged.fillStyle = 'rgb('
        + val + ','
        + val + ','
        + val + ')'

      enlarged.fillRect(x * 8, y * 8, 8, 8)
    }
  }
}

updateText = debounce(updateText, 50, true)

// save png:

$(document).on('click', '#file-export', exportImage)

function exportImage(){
  var image = new Image
  image.src = canvas.toDataURL()
  window.open(image.src, 'export-window')
}
 
// decode:
 
$(document).on('change', '#file-uploader-input', handleFileSelect)
 
function handleFileSelect(evt) {
  var files = evt.target.files
  var file = files[0]
  var parts = file.name.split('.')
  if (parts[parts.length - 1] !== 'png') return
  var reader = new FileReader()
  reader.onloadend = function() {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')
    var width = canvas.width = image.width
    var height = canvas.height = image.height
    var image = new Image
    img.src = reader.result
    ctx.fillStyle = 'rgb(255,255,255)'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0)
    var imageData = ctx.getImageData(0, 0, width, height)
    var text = lsb.decode(imageData.data, pickRGB)
    console.log(text)
  }
  reader.readAsDataURL(file)
}

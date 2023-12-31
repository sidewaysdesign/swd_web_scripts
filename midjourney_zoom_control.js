// midjourney zoom controls
const style = document.createElement('style')
style.textContent = `
:root { --zoom-margin-size: 0; }
.zoom-overlay::-webkit-scrollbar { width: 6px; }
.zoom-overlay::-webkit-scrollbar-track { background: rgba(255,255,255,0.2); }
.zoom-overlay::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.5); }
.zoom-overlay::-webkit-scrollbar-thumb:hover { background: #555; }
.zoom-overlay {
  position: fixed;
  top: var(--zoom-margin-size);
  right: var(--zoom-margin-size);
  bottom: var(--zoom-margin-size);
  left: var(--zoom-margin-size);
  overflow: scroll;
  background: #000;
  z-index: 1000;
  display:flex;
  align-items:center;
  justify-content:center;
}
`
document.head.appendChild(style)

function trackMouseMovement(div) {
  document.addEventListener('mousemove', function (event) {
    const xPercentage = (event.clientX / window.innerWidth) * 100
    const yPercentage = (event.clientY / window.innerHeight) * 100

    div.scrollLeft = (div.scrollWidth - div.clientWidth) * (xPercentage / 100)
    div.scrollTop = (div.scrollHeight - div.clientHeight) * (yPercentage / 100)
  })
}

function createZoomOverlay(img, initialZoomFactor) {
  const zoomedImg = document.createElement('img')
  zoomedImg.src = img.src
  let zoomFactor = initialZoomFactor

  function updateZoom() {
    zoomedImg.style.width = `${img.naturalWidth * zoomFactor}px`
    zoomedImg.style.height = `${img.naturalHeight * zoomFactor}px`
    zoomedImg.style.minWidth = `${img.naturalWidth * zoomFactor}px`
    zoomedImg.style.minHeight = `${img.naturalHeight * zoomFactor}px`
  }

  function handleKeyDown(event) {
    if (event.key === 'Shift') {
      zoomFactor = 2
      updateZoom()
    }
  }

  function handleKeyUp(event) {
    if (event.key === 'Shift') {
      zoomFactor = 1
      updateZoom()
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)

  function createDiv(zoomedImg) {
    const div = document.createElement('div')
    div.classList.add('zoom-overlay')
    div.appendChild(zoomedImg)
    document.body.appendChild(div)

    let mouseMoveHandler

    function updateMouseMoveHandler() {
      if (mouseMoveHandler) {
        document.removeEventListener('mousemove', mouseMoveHandler)
      }

      mouseMoveHandler = function (event) {
        const rect = div.getBoundingClientRect()
        const xPercentage = ((event.clientX - rect.left) / rect.width) * 100
        const yPercentage = ((event.clientY - rect.top) / rect.height) * 100

        div.scrollLeft = (div.scrollWidth - div.clientWidth) * (xPercentage / 100) * zoomFactor
        div.scrollTop = (div.scrollHeight - div.clientHeight) * (yPercentage / 100) * zoomFactor
      }

      document.addEventListener('mousemove', mouseMoveHandler)
    }

    updateMouseMoveHandler()

    document.addEventListener(
      'mouseup',
      function () {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('keyup', handleKeyUp)
        document.body.removeChild(div)
      },
      { once: true }
    )
  }

  if (img.complete) {
    updateZoom()
    createDiv(zoomedImg)
  } else {
    zoomedImg.onload = function () {
      updateZoom()
      createDiv(this)
    }
  }
}

function zoomImage(event) {
  if ((event.metaKey || event.ctrlKey) && event.target.tagName === 'IMG') {
    event.preventDefault()
    createZoomOverlay(event.target, event.shiftKey ? 2 : 1)
  }
}

document.addEventListener('mousedown', zoomImage)

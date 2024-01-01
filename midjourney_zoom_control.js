const style = document.createElement('style')
const fadeOutTime = 1250
style.textContent = `
:root { --zoom-margin-size: 0; }
.zoom-overlay::-webkit-scrollbar { display: none; }
.zoom-overlay {
 position: fixed;
 cursor: move;
 top: var(--zoom-margin-size);
 right: var(--zoom-margin-size);
 bottom: var(--zoom-margin-size);
 left: var(--zoom-margin-size);
 overflow: auto;
 z-index: 1000;
 display: table-cell!important;
 vertical-align: middle;
 text-align: center;
 background-color:#333;
}
.zoom-overlay img {
 display: inline-block;
 font-size:0;
 line-height:0;
 box-shadow: 0 0.75rem 2rem rgba(0,0,0,0.4);
}
.zoom-overlay::after {
 font-family: DM Sans,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif;
 content: attr(data-zoominfo);
 position: fixed;
 bottom: -3rem;
 left: 50%;
 transform:translate(-50%,0);
 background: rgba(0, 0, 0, 0.7);
 color: rgba(255,255,255,0.92);
 padding: 0.375rem 1rem;
 border-radius: 100px;
 opacity: 0;
 font-weight:bolder;
 font-size:0.82rem;
 transition: opacity ${(fadeOutTime / 1000) * 0.75}s ease-in-out, transform ${(fadeOutTime / 1000) * 0.75}s ease-in-out;
 z-index:1001;
}

.zoom-overlay.show-info::after {
 left: 50%;
 transform:translate(-50%,-4rem);
 opacity: 1;
}
`
document.head.appendChild(style)

function createZoomOverlay(img, initialZoomFactor) {
  const zoomedImg = document.createElement('img')
  zoomedImg.src = img.src
  zoomedImg.id = 'zoomedImg'
  let zoomFactor = initialZoomFactor
  const zoomOverlay = document.createElement('div')
  zoomOverlay.classList.add('zoom-overlay')

  let fadeOutTimeout // Declare this at the top of your script

  function updateZoom() {
    zoomedImg.style.width = `${img.naturalWidth * zoomFactor}px`
    zoomedImg.style.height = `${img.naturalHeight * zoomFactor}px`
    zoomedImg.style.minWidth = `${img.naturalWidth * zoomFactor}px`
    zoomedImg.style.minHeight = `${img.naturalHeight * zoomFactor}px`
    setPadding()
    zoomOverlay.setAttribute('data-zoominfo', `Zoom: ${zoomFactor}X  |  Image: ${img.naturalWidth}px × ${img.naturalHeight}px`)
    zoomOverlay.classList.add('show-info')
    clearTimeout(fadeOutTimeout)
    fadeOutTimeout = setTimeout(() => {
      zoomOverlay.classList.remove('show-info')
    }, fadeOutTime)
  }

  function setPadding() {
    const imgRect = zoomedImg.getBoundingClientRect()
    const overlayRect = zoomOverlay.getBoundingClientRect()

    if (imgRect.height < overlayRect.height) {
      const padding = (overlayRect.height - imgRect.height) / 2
      zoomOverlay.style.paddingTop = `${padding}px`
      zoomOverlay.style.paddingBottom = `${padding}px`
    } else {
      zoomOverlay.style.paddingTop = '0'
      zoomOverlay.style.paddingBottom = '0'
    }
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

  const createZoomOverlay = () => {
    zoomOverlay.appendChild(zoomedImg)
    document.body.appendChild(zoomOverlay)

    let mouseMoveHandler

    function updateMouseMoveHandler() {
      if (mouseMoveHandler) {
        document.removeEventListener('mousemove', mouseMoveHandler)
      }

      mouseMoveHandler = function (event) {
        // return // short-circuits to enable inspection
        const zoomOverlayRect = zoomOverlay.getBoundingClientRect()
        const xPercentage = ((event.clientX - zoomOverlayRect.left) / zoomOverlayRect.width) * 100
        const yPercentage = ((event.clientY - zoomOverlayRect.top) / zoomOverlayRect.height) * 100

        zoomOverlay.scrollLeft = (zoomOverlay.scrollWidth - zoomOverlay.clientWidth) * (xPercentage / 100)
        zoomOverlay.scrollTop = (zoomOverlay.scrollHeight - zoomOverlay.clientHeight) * (yPercentage / 100)
      }
      document.addEventListener('mousemove', mouseMoveHandler)
    }

    updateMouseMoveHandler()

    document.addEventListener(
      'mouseup',
      function () {
        // return // short-circuits to enable inspection
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('keyup', handleKeyUp)
        document.body.removeChild(zoomOverlay)
      },
      { once: true }
    )
  }

  if (img.complete) {
    updateZoom()
    createZoomOverlay(zoomedImg)
    setPadding()
  } else {
    zoomedImg.onload = function () {
      updateZoom()
      createZoomOverlay(this)
      setPadding()
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

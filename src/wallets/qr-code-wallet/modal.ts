export default class QRCodeModal {

  private _outer: HTMLElement | undefined = undefined;
  private _inner: HTMLElement | undefined = undefined;

  private _initialized: Boolean = false;

  showLoginQR(loginQr: any) {
    this._initialize()

    const outer = this._outer as HTMLElement

    outer.style.visibility = 'visible'

    const inner = this._inner as HTMLElement
    
    inner.innerHTML = '<h1>Login using QR</h1>'

    loginQr.append(inner)
  }
  
  hide() {
    this._initialize();
    (this._outer as HTMLElement).style.visibility = 'hidden';
  }

  showTransactionQR() {
    this._initialize();
  }

  _initialize() {
    
    if(this._initialized) return
      
    if(typeof document === 'undefined') throw new Error('document is undefined')

    this._outer = document.createElement('div')
    
    this._outer.id = 'qr-code-modal'
    
    const outerStyles = {
      'position': 'fixed',
      'top': '0',
      'left': '0',
      'visibility': 'hidden'
    }

    Object.assign(this._outer.style, outerStyles)

    const bg = document.createElement('div')
    
    const bgStyles = {
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'width': '100vw',
      'height': '100vh',
      'background-color': 'grey',
      'opacity': '0.5'
    }
    
    Object.assign(bg.style, bgStyles)
    
    this._outer.appendChild(bg)

    const innerContainer = document.createElement('div')

    const innerContainerStyles = {
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'display': 'flex',
      'justify-content': 'center',
      'align-items': 'center',
      'height': '100vh',
      'width': '100vw',
    }
    
    Object.assign(innerContainer.style, innerContainerStyles)
    
    this._outer.appendChild(innerContainer)

    this._inner = document.createElement('div')

    const innerStyles = {
      'display': 'flex',
      'flex-direction': 'column',
      'background-color': 'white',
      'padding': '50px',
      'width': '400px',
      'border-radius': '10px',
      'border': '1px solid black',
      'color': 'black',
    }

    Object.assign(this._inner.style, innerStyles)

    innerContainer.appendChild(this._inner)

    document.body.appendChild(this._outer)
    
    this._initialized = true
  }
}

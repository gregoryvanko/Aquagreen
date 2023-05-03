class IconModule{
    constructor(){}

    static Start(Color = "black"){
        return `<svg height="100%" width="100%" stroke-miterlimit="10" style="fill-rule:nonzero;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;" version="1.1" viewBox="0 0 1024 1024" width="100%" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs/>
        <g id="Calque-1">
        <path d="M336.228 786.914C336.228 786.914 293.451 472.473 584.46 436.771C800.875 410.216 967.688 610.265 967.688 610.265C967.688 610.265 847.265 875.59 609.572 905.164C487.946 920.28 383.763 856.797 383.763 856.797" fill="none" opacity="1" stroke="${Color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="15.9734"/>
        <path d="M245.314 938.187C245.314 938.187 319.788 764.875 500.231 668.664C626.213 601.481 783.09 622.975 783.09 622.975M242.845 619.684C156.87 562.171 124.591 470.748 124.591 374.038C124.591 199.5 266.292 46.6375 266.292 46.6375C266.292 46.6375 364.372 162.799 382.097 284.249C402.672 425.264 314.288 525.22 299.754 537.545M251.778 254.335C160.503 481.416 277.954 626.539 258.583 759.337" fill="none" opacity="1" stroke="${Color}" stroke-linecap="round" stroke-linejoin="round" stroke-width="15.9734"/>
        </g>
        </svg>`
    }

    static ThreeDots(Color = "black"){
        return `<svg fill="${Color}" height="100%" width="100%" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
        viewBox="0 0 32.055 32.055" xml:space="preserve">
   <g>
       <path d="M3.968,12.061C1.775,12.061,0,13.835,0,16.027c0,2.192,1.773,3.967,3.968,3.967c2.189,0,3.966-1.772,3.966-3.967
           C7.934,13.835,6.157,12.061,3.968,12.061z M16.233,12.061c-2.188,0-3.968,1.773-3.968,3.965c0,2.192,1.778,3.967,3.968,3.967
           s3.97-1.772,3.97-3.967C20.201,13.835,18.423,12.061,16.233,12.061z M28.09,12.061c-2.192,0-3.969,1.774-3.969,3.967
           c0,2.19,1.774,3.965,3.969,3.965c2.188,0,3.965-1.772,3.965-3.965S30.278,12.061,28.09,12.061z"/>
   </g>
   </svg>`
    }
}
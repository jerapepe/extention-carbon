chrome.runtime.sendMessage({ action: 'getIconData' }, function(response) {
    if (response && response.iconData) {
        chrome.browserAction.setIcon({                
            imageData: response.iconData
        });
    } else {
        console.error('No se recibieron datos de icono válidos.');
    }
});
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action === 'updateIcon' && msg.value && msg.value.color) {
        const iconData = drawIcon(msg.value);
        if (iconData) {
            chrome.browserAction.setIcon({                
                imageData: iconData
            });
        } else {
            console.error('Error al generar los datos del ícono.');
        }
    }
});
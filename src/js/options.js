/* global DPLAYER_VERSION */
import defaultApiBackend from './api.js';

export default (options) => {

    // default options
    const defaultOption = {
        container: options.element || document.getElementsByClassName('dplayer')[0],
        live: false,
        autoplay: false,
        theme: '#b7daff',
        loop: false,
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        screenshot: false,
        hotkey: true,
        preload: 'metadata',
        volume: 0.7,
        apiBackend: defaultApiBackend,
        video: {},
        contextmenu: [],
        mutex: true
    };
    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }
    if (options.video) {
        !options.video.type && (options.video.type = 'auto');
    }

    if (options.lang) {
        options.lang = options.lang.toLowerCase();
    }

    options.contextmenu = options.contextmenu.concat([
        {
            text: `DPlayer v${DPLAYER_VERSION}`,
            link: 'https://github.com/MoePlayer/DPlayer'
        }
    ]);

    return options;
};

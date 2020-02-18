import Icons from './icons';
import tplPlayer from '../template/player.art';

class Template {
    constructor (options) {
        this.container = options.container;
        this.options = options.options;
        this.index = options.index;
        this.tran = options.tran;
        this.init();
    }

    init () {
        this.container.innerHTML = tplPlayer({
            options: this.options,
            index: this.index,
            tran: this.tran,
            icons: Icons,
            video: {
                current: true,
                pic: this.options.video.pic,
                screenshot: this.options.screenshot,
                preload: this.options.preload,
                url: this.options.video.url,
            }
        });

        this.volumeBar = this.container.querySelector('.dplayer-volume-bar-inner');
        this.volumeBarWrap = this.container.querySelector('.dplayer-volume-bar');
        this.volumeBarWrapWrap = this.container.querySelector('.dplayer-volume-bar-wrap');
        this.volumeButton = this.container.querySelector('.dplayer-volume');
        this.volumeButtonIcon = this.container.querySelector('.dplayer-volume-icon');
        this.volumeIcon = this.container.querySelector('.dplayer-volume-icon .dplayer-icon-content');
        this.playedBar = this.container.querySelector('.dplayer-played');
        this.loadedBar = this.container.querySelector('.dplayer-loaded');
        this.playedBarWrap = this.container.querySelector('.dplayer-bar-wrap');
        this.playedBarTime = this.container.querySelector('.dplayer-bar-time');
        this.video = this.container.querySelector('.dplayer-video-current');
        this.bezel = this.container.querySelector('.dplayer-bezel-icon');
        this.playButton = this.container.querySelector('.dplayer-play-icon');
        this.videoWrap = this.container.querySelector('.dplayer-video-wrap');
        this.controllerMask = this.container.querySelector('.dplayer-controller-mask');
        this.ptime = this.container.querySelector('.dplayer-ptime');
        this.mask = this.container.querySelector('.dplayer-mask');
        this.dtime = this.container.querySelector('.dplayer-dtime');
        this.controller = this.container.querySelector('.dplayer-controller');
        this.browserFullButton = this.container.querySelector('.dplayer-full-icon');
        this.webFullButton = this.container.querySelector('.dplayer-full-in-icon');
        this.menu = this.container.querySelector('.dplayer-menu');
        this.menuItem = this.container.querySelectorAll('.dplayer-menu-item');
        this.camareButton = this.container.querySelector('.dplayer-camera-icon');
        this.barPreview = this.container.querySelector('.dplayer-bar-preview');
        this.barWrap = this.container.querySelector('.dplayer-bar-wrap');
        this.notice = this.container.querySelector('.dplayer-notice');
    }
}

export default Template;

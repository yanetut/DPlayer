import Promise from 'promise-polyfill';

import utils from './utils';
import handleOption from './options';
import i18n from './i18n';
import Template from './template';
import Icons from './icons';
import Events from './events';
import FullScreen from './fullscreen';
import Bar from './bar';
import Timer from './timer';
import Bezel from './bezel';
import Controller from './controller';
import HotKey from './hotkey';
import ContextMenu from './contextmenu';
import tplVideo from '../template/video.art';

let index = 0;
const instances = [];

class DPlayer {

    /**
     * DPlayer constructor function
     *
     * @param {Object} options - See README
     * @constructor
     */
    constructor (options) {
        this.options = handleOption(options);

        this.type = 'normal';

        this.tran = new i18n(this.options.lang).tran;
        this.events = new Events();
        this.container = this.options.container;

        this.container.classList.add('dplayer');
        if (this.options.live) {
            this.container.classList.add('dplayer-live');
        }
        if (utils.isMobile) {
            this.container.classList.add('dplayer-mobile');
        }
        this.arrow = this.container.offsetWidth <= 500;
        if (this.arrow) {
            this.container.classList.add('dplayer-arrow');
        }

        this.template = new Template({
            container: this.container,
            options: this.options,
            index: index,
            tran: this.tran,
        });

        this.video = this.template.video;

        this.videos = this.options.videos;
        this.videoIndex = -1;

        this.bar = new Bar(this.template);

        this.bezel = new Bezel(this.template.bezel);

        this.fullScreen = new FullScreen(this);

        this.controller = new Controller(this);

        document.addEventListener('click', () => {
            this.focus = false;
        }, true);
        this.container.addEventListener('click', () => {
            this.focus = true;
        }, true);

        this.paused = true;

        this.timer = new Timer(this);

        this.hotkey = new HotKey(this);

        this.contextmenu = new ContextMenu(this);

        this.initVideos(this.videos);
        this.initVideo(this.video);

        if (this.options.autoplay) {
            this.loadVideo(0);
        }

        index++;
        instances.push(this);
    }

    /**
    * Seek video
    */
    seek (time) {
        time = Math.max(time, 0);
        if (this.videos.duration) {
            time = Math.min(time, this.videos.duration);
        }
        if (this.video.currentTime < time) {
            this.notice(`${this.tran('FF')} ${(time - this.video.currentTime).toFixed(0)} ${this.tran('s')}`);
        }
        else if (this.video.currentTime > time) {
            this.notice(`${this.tran('REW')} ${(this.video.currentTime - time).toFixed(0)} ${this.tran('s')}`);
        }

        // TODO: algorithm
        let seekVideoIndex = this.videos.videoList.findIndex((video) => video.seek > time);
        if (seekVideoIndex === -1) {
            seekVideoIndex = this.videos.videoList.length;
        }

        const seekTimeInVideo = time - this.videos.videoList[seekVideoIndex - 1].seek;
        if (seekVideoIndex - 1 === this.videoIndex) {
            this.video.currentTime =  seekTimeInVideo;
        } else {
            this.loadVideo(seekVideoIndex - 1, seekTimeInVideo);
        }

        this.bar.set('played', time / this.videos.duration, 'width');
        this.template.ptime.innerHTML = utils.secondToTime(time);
    }

    /**
     * Play video
     */
    play () {
        if (this.videoIndex === -1) {
            this.loadVideo(0);
            return;
        }
        this.paused = false;
        if (this.video.paused) {
            this.bezel.switch(Icons.play);
        }

        this.template.playButton.innerHTML = Icons.pause;

        if (this.bar.get('played') > 0.999) {
            this.loadVideo(0);
        } else {
            const playedPromise = Promise.resolve(this.video.play());
            playedPromise.catch(() => {
                this.pause();
            }).then(() => {
            });
        }
        this.timer.enable('loading');
        this.container.classList.remove('dplayer-paused');
        this.container.classList.add('dplayer-playing');

        if (this.options.mutex) {
            for (let i = 0; i < instances.length; i++) {
                if (this !== instances[i]) {
                    instances[i].pause();
                }
            }
        }
    }

    /**
     * Pause video
     */
    pause () {
        this.paused = true;
        this.container.classList.remove('dplayer-loading');

        if (!this.video.paused) {
            this.bezel.switch(Icons.pause);
        }

        this.template.playButton.innerHTML = Icons.play;
        this.video.pause();
        this.timer.disable('loading');
        this.container.classList.remove('dplayer-playing');
        this.container.classList.add('dplayer-paused');
    }

    switchVolumeIcon () {
        if (this.volume() >= 0.95) {
            this.template.volumeIcon.innerHTML = Icons.volumeUp;
        }
        else if (this.volume() > 0) {
            this.template.volumeIcon.innerHTML = Icons.volumeDown;
        }
        else {
            this.template.volumeIcon.innerHTML = Icons.volumeOff;
        }
    }

    /**
     * Set volume
     */
    volume (percentage, nostorage, nonotice) {
        percentage = parseFloat(percentage);
        if (!isNaN(percentage)) {
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.bar.set('volume', percentage, 'width');
            const formatPercentage = `${(percentage * 100).toFixed(0)}%`;
            this.template.volumeBarWrapWrap.dataset.balloon = formatPercentage;
            if (!nonotice) {
                this.notice(`${this.tran('Volume')} ${(percentage * 100).toFixed(0)}%`);
            }

            this.video.volume = percentage;
            if (this.video.muted) {
                this.video.muted = false;
            }
            this.switchVolumeIcon();
        }

        return this.video.volume;
    }

    /**
     * Toggle between play and pause
     */
    toggle () {
        if (this.video.paused) {
            this.play();
        }
        else {
            this.pause();
        }
    }

    /**
     * attach event
     */
    on (name, callback) {
        this.events.on(name, callback);
    }

    /**
     * Switch to a new video
     *
     * @param {Object} video - new video info
     */
    // TODO: switch videos
    switchVideo (video) {
        this.pause();
        this.video.poster = video.pic ? video.pic : '';
        this.video.src = video.url;
    }

    initVideos (videos) {
        this.template.dtime.innerHTML = utils.secondToTime(videos.duration);
    }

    initVideo (video) {

        /**
         * video events
         */
        // show video loaded bar: to inform interested parties of progress downloading the media
        this.on('progress', () => {
            const seeked = this.videos.videoList[this.videoIndex].seek;
            const percentage = video.buffered.length ? (seeked +  video.buffered.end(video.buffered.length - 1)) / this.videos.duration : seeked / this.videos.duration;
            this.bar.set('loaded', percentage, 'width');
        });

        // video download error: an error occurs
        this.on('error', () => {
            if (!this.video.error) {
                // Not a video load error, may be poster load failed, see #307
                return;
            }
            this.tran && this.notice && this.type !== 'webtorrent' & this.notice(this.tran('Video load failed'), -1);
        });

        // single video end
        this.on('ended', () => {
            if (this.videoIndex < this.videos.videoList.length - 1) {
                this.loadVideo(this.videoIndex + 1);
            } else {
                this.bar.set('played', 1, 'width');
            }
        });

        this.on('play', () => {
            if (this.paused) {
                this.play();
            }
        });

        this.on('pause', () => {
            if (!this.paused) {
                this.pause();
            }
        });

        this.on('timeupdate', () => {
            const prevTime = this.videos.videoList[this.videoIndex].seek;
            this.bar.set('played', (this.video.currentTime + prevTime) / this.videos.duration, 'width');
            const currentTime = utils.secondToTime(this.video.currentTime + prevTime);
            if (this.template.ptime.innerHTML !== currentTime) {
                this.template.ptime.innerHTML = currentTime;
            }
        });

        for (let i = 0; i < this.events.videoEvents.length; i++) {
            video.addEventListener(this.events.videoEvents[i], () => {
                this.events.trigger(this.events.videoEvents[i]);
            });
        }
    }

    loadVideo (index, seek = 0) {
        if (this.loadingVideo) {
            return;
        }
        this.loadingVideo = true;
        this.videoIndex = index;
        this.video.pause();
        this.paused = true;
        this.template.playButton.innerHTML = Icons.pause;

        this.container.classList.remove('dplayer-paused');
        this.container.classList.add('dplayer-loading');

        const videoHTML = tplVideo({
            current: false,
            pic: null,
            screenshot: this.options.screenshot,
            preload: 'auto',
            url: this.videos.videoList[index].url,
        });
        const videoEle = new DOMParser().parseFromString(videoHTML, 'text/html').body.firstChild;
        this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName('div')[0]);

        this.prevVideo = this.video;
        this.video = videoEle;
        this.initVideo(this.video);

        if (seek) {
            this.video.currentTime = seek;
        }

        this.video.addEventListener('canplay', () => {
            if (this.loadingVideo) {
                this.template.videoWrap.removeChild(this.prevVideo);
                this.video.classList.add('dplayer-video-current');
                this.paused = false;
                this.container.classList.remove('dplayer-loading');
                this.video.play();
                this.loadingVideo = false;
                this.prevVideo = null;
            }
        });
    }

    notice (text, time = 2000, opacity = 0.8) {
        this.template.notice.innerHTML = text;
        this.template.notice.style.opacity = opacity;
        if (this.noticeTime) {
            clearTimeout(this.noticeTime);
        }
        this.events.trigger('notice_show', text);
        if (time > 0) {
            this.noticeTime = setTimeout(() => {
                this.template.notice.style.opacity = 0;
                this.events.trigger('notice_hide');
            }, time);
        }
    }

    resize () {
        this.events.trigger('resize');
    }

    speed (rate) {
        this.video.playbackRate = rate;
    }

    destroy () {
        instances.splice(instances.indexOf(this), 1);
        this.pause();
        this.controller.destroy();
        this.timer.destroy();
        this.video.src = '';
        this.container.innerHTML = '';
        this.events.trigger('destroy');
    }

    static get version () {
        /* global DPLAYER_VERSION */
        return DPLAYER_VERSION;
    }
}

export default DPlayer;

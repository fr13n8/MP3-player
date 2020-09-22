$(document).ready(function () {
    const { ipcRenderer } = require('electron');
    const openFolder = document.getElementsByClassName('ion-md-folder')[0];
    const {Howl, Howler} = require('howler');
    
    class MusicController {

        constructor( songs ) {
            this.songs = songs;
            this.index = 0;
            this.showDetails();
        }

        static formatTime(secs) {
            let minutes = Math.floor(secs / 60) || 0;
            let seconds = (secs - minutes * 60) || 0;
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }

        showDetails() {
            var song = this.songs[this.index];
            let duration = song.metaData.format.duration;
            $(".duration").html(MusicController.formatTime(Math.round(duration)));
            $(".cover").css('background-image', `url(./assets/${song.fileName})`);
            $(".song-name").html(song.songName);
        }

        play(isPlayed = true) {
            if(!this.songs[this.index].howl){
                this.songs[this.index].howl = new Howl({
                    src: [this.songs[this.index].filepath],
                    // autoplay: true,
                    // loop: true,
                    volume: 0.1,
                    html5: true,
                    onend: function() {
                        this.skip('next');
                    },
                    onseek: () => {
                        requestAnimationFrame(this.step.bind(this));
                    },
                    onplay: () => {
                        requestAnimationFrame(this.step.bind(this));
                    }
                    // autoplay: false
                });
            }
            if(isPlayed) this.songs[this.index].howl.play();
            this.showDetails();
        }

        step() {
            var sound = this.songs[this.index].howl;
            var seek = sound.seek() || 0;
            $(".timer").html(MusicController.formatTime(Math.round(seek)));
            $("#progress-bar").css('width', (((seek / sound.duration()) * 100) || 0) + '%');
            if (sound.playing()) {
                requestAnimationFrame(this.step.bind(this));
            }
        }

        pauseSong() {
            this.songs[this.index].howl.pause();
        }

        stopSong() {
            this.songs[this.index].howl.stop();
        }

        skip(direction) {
            let index = this.index;
            let isPlayed = this.songs[index].howl.playing();
            this.songs[index].howl.stop();
            switch (direction) {
                case 'next':
                    index += 1;
                    if (index >= this.songs.length) {
                        index = 0;
                    }
                    console.log(index);
                    break;
                case 'prev':
                    index -= 1;
                    if (index < 0) {
                        index = this.songs.length - 1;
                    }
                    console.log(index);
                    break;
            }
            this.index = index;
            console.log(isPlayed)
            this.play(isPlayed);
        }

        skipTo(index) {
            let isPlayed = this.songs[this.index].howl ? this.songs[this.index].howl.playing() : false;
            if(isPlayed) this.stopSong();
            this.index = index;
            this.play(isPlayed);
        }

    }
    ipcRenderer.send('openFile', '');
    
    function choosFiles() {
        ipcRenderer.send('choos-files', 'true');
    }
    
    openFolder.addEventListener('click', choosFiles, false);

    let musicFiles, player;
    ipcRenderer.on('fileData', (event, files) => {
        console.log(files);
        musicFiles = files;
        player = new MusicController(musicFiles);
        musicFiles.forEach( ( song, index ) => {
            $(".music-play-list").append(`
            <li data-id=${song.id} class='song-item titlebar-button'>
                <span>${index + 1}</span>
                <span>${song.songName}</span> 
                <span>${MusicController.formatTime(Math.round(song.metaData.format.duration))}</span>
            </li>
            `);
        });
    })

    let checkStatus = true;
    $('.fa-play').click( function (e) {
        e.preventDefault();
        if(!player) {
            console.log('Choose music');
            return;
        };
        if(checkStatus) {
            $(this).removeClass('fa-play');
            $(this).addClass('fa-pause');
            player.play();
        }
        else{
            $(this).removeClass('fa-pause');
            $(this).addClass('fa-play');
            player.pauseSong();
        }
        checkStatus = !checkStatus;
    })

    $(".fa-forward").click(function () {
        if(!player) {
            console.log('Choose music');
            return;
        };
        player.skip('next');
    })

    $(".fa-backward").click(function () {
        if(!player) {
            console.log('Choose music');
            return;
        };
        player.skip('prev');
    })
    
    $(document).on('click', ".song-item", function () {
        if(!player) {
            console.log('Choose music');
            return;
        };
        let index = $(this).attr('data-id');
        scrollDown.setEndValue(0);
        player.skipTo(index);
    })
});
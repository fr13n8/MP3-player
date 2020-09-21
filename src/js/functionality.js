$(document).ready(function () {
    const { ipcRenderer } = require('electron');
    const openFolder = document.getElementsByClassName('ion-md-folder')[0];
    const {Howl, Howler} = require('howler');
    
    class MusicController {

        constructor( songs ) {
            this.songs = songs;
            this.index = 0;
        }

        play(isPlayed = true) {
            if(!this.songs[this.index].howl){
                this.songs[this.index].howl = new Howl({
                    src: [this.songs[this.index].filePath],
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
                        let duration = this.songs[this.index].metaData.format.duration;
                        $(".duration").html(this.formatTime(Math.round(duration)));
                        requestAnimationFrame(this.step.bind(this));
                    }
                    // autoplay: false
                });
            }
            if(isPlayed) this.songs[this.index].howl.play();
        }

        step() {
            var sound = this.songs[this.index].howl;
            var seek = sound.seek() || 0;
            $(".timer").html(this.formatTime(Math.round(seek)));
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
            this.stopSong();
            this.index = index;
            this.play(false);
        }

        formatTime(secs) {
            let minutes = Math.floor(secs / 60) || 0;
            let seconds = (secs - minutes * 60) || 0;
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
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
        musicFiles.forEach( ( file, index ) => {
            $(".music-play-list").append(`
            <li data-id=${file.id} class='song-item titlebar-button'>
                <span>${index + 1}</span>
                <span>${file.fileName}</span> 
                <span>4:44</span>
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
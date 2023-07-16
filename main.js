// Các công việc phải làm
// 1. Render song 
// 2. Scroll top
// 3. Play / pause / seek
// 4. CD rotate
// 5. Next / prev
// 6. Random
// 7. Next / repeat when emded
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F31_PLAYER'

const player = $('.player');
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumd = $('.cd-thumb')
const progress = $('#progress')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const repeatBtn = $('.btn-repeat')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Em Mây',
            singer: 'Hạnh Sino',
            image: './assets/img/song1.jpg',
            path: './assets/music/song1.mp3'
        },
        {
            name: 'Yêu Lại Từ Đầu',
            singer: 'Cover',
            image: './assets/img/song2.jpg',
            path: './assets/music/song2.mp3'
        },
        {
            name: 'Quên Cách Yêu',
            singer: 'Lương Bích Hữu',
            image: './assets/img/song3.jpg',
            path: './assets/music/song3.mp3'
        }
        , {
            name: 'Em Là Kẻ Đáng Thương',
            singer: 'Phát Huy T4',
            image: './assets/img/song4.jpg',
            path: './assets/music/song4.mp3'
        },
        {
            name: 'Một Thuỡ Yêu Người',
            singer: 'Cover',
            image: './assets/img/song5.jpg',
            path: './assets/music/song5.mp3'
        },
        {
            name: 'Con Tim Không Đổi Thay',
            singer: 'Dee Trần',
            image: './assets/img/song6.jpg',
            path: './assets/music/song6.mp3'
        },
        {
            name: 'Anh Mới Chính Là Người Em Yêu',
            singer: 'Lý Hải',
            image: './assets/img/song7.jpg',
            path: './assets/music/song7.mp3'
        },
        {
            name: 'Em Hát Ai Nghe',
            singer: 'Hoàng Diệp',
            image: './assets/img/song8.jpg',
            path: './assets/music/song8.mp3'
        },
        {
            name: 'Nụ Hôn Và Nước Mắt',
            singer: 'Cover',
            image: './assets/img/song9.jpg',
            path: './assets/music/song9.mp3'
        },
        {
            name: 'Lý Do Là Gì',
            singer: 'Nguyễn Vỹ',
            image: './assets/img/song10.jpg',
            path: './assets/music/song10.mp3'
        }
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song,index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    handleEvents: function () {
        const _this = this
        // Xử lý phóng to thu nhỏ
        // Lấy Width của cd
        const cdWidth = cd.offsetWidth

        //Xử lý CD quay / dừng 
        const cdThumdAnimate = cdThumd.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumdAnimate.pause()
        document.onscroll = function () {
            // Kiểm tra chuyển động và tính kích thước
            const ScrollY = window.scrollY || document.documentElement.scrollTop
            const newWidth = cdWidth - ScrollY
            cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
            cd.style.opacity = newWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play 
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumdAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumdAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            //audio.currentTime lấy thời gian hiện tại trong bài hát
            //audio.duration lấy thời lượng của bài hát
            if (audio.duration) {
                const percent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = percent
            }
        }

        // Xử lý khi tua song
        progress.onchange = function (e) {
            const seekTime = (e.target.value / 100) * audio.duration
            audio.currentTime = seekTime
        }

        // Khi next song
        nextBtn.onclick = function () {
            if(_this.isRandom){
                _this.randomSong()
            }
            else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev song
        prevBtn.onclick = function () {
            if(_this.isRandom){
                _this.randomSong()
            }
            else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Xử lý random song
        randomBtn.onclick = function () {
            _this.isRandom =!_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        //Xử lý repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat =!_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        
        //Xử lý next song khi emded
        audio.onended = function () {
            if(_this.isRepeat){
                audio.play()
            }
            else{
                nextBtn.click()
            }
        }

        // Lắng nghe click vào playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            //Kiêm tra trong playlist có class song không từ các ele cha đến các ele con
           if(songNode || e.target.closest('.option')) {
                //Xử lý khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render
                }
                //Xử lý khi click vào option
                if(e.target.closest('.option')){ }
           }
        }

    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    scrollToActiveSong: function () {
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'center'
            })
        },300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumd.style.backgroundImage = `url(${this.currentSong.image}`
        audio.src = this.currentSong.path
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSong: function () {
        var newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)
       this.currentIndex = newIndex
       this.loadCurrentSong()
       
    },
    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();
        // định nghĩa các thuộc tính cho objecrt
        this.defineProperties()

        // Xử lý các sự kiện (DOM event)
        this.handleEvents();

        //Tải thông tin bài hát vào UI khi chạy ứng dụng
        this.loadCurrentSong();
        // Render song 
        this.render();

        ///hiền thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)

    }

}
app.start()
class YouTubeManager {
    constructor() {
        this.player = null;
        this.currentVideoId = null;
        this.isPlayerReady = false;
        this.isAPIReady = false;
        
        // Set up API ready callback
        window.onYouTubeIframeAPIReady = () => {
            this.isAPIReady = true;
            console.log('YouTube API is ready');
        };
    }

    // Wait for API to be ready
    waitForAPI() {
        return new Promise((resolve) => {
            if (this.isAPIReady) {
                resolve();
                return;
            }
            
            const checkAPI = () => {
                if (window.YT && window.YT.Player) {
                    this.isAPIReady = true;
                    resolve();
                } else {
                    setTimeout(checkAPI, 100);
                }
            };
            checkAPI();
        });
    }

    // Extract video ID from YouTube URL
    extractVideoId(url) {
        // Handle various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (let pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1].length === 11) {
                return match[1];
            }
        }
        return null;
    }

    // Initialize YouTube player
    async initPlayer(videoId, containerId) {
        await this.waitForAPI();
        
        return new Promise((resolve, reject) => {
            try {
                this.currentVideoId = videoId;
                this.isPlayerReady = false;
                
                // Destroy existing player if it exists
                if (this.player) {
                    this.player.destroy();
                }
                
                this.player = new YT.Player(containerId, {
                    height: '100%',
                    width: '100%',
                    videoId: videoId,
                    playerVars: {
                        'playsinline': 1,
                        'rel': 0,
                        'modestbranding': 1,
                        'controls': 1,
                        'showinfo': 0
                    },
                    events: {
                        'onReady': (event) => {
                            this.isPlayerReady = true;
                            console.log('Player is ready');
                            resolve(event);
                        },
                        'onError': (event) => {
                            console.error('Player error:', event.data);
                            reject(new Error(`YouTube player error: ${event.data}`));
                        },
                        'onStateChange': (event) => {
                            console.log('Player state changed:', event.data);
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Get current video time in seconds
    getCurrentTime() {
        if (this.player && this.isPlayerReady) {
            try {
                return Math.floor(this.player.getCurrentTime());
            } catch (error) {
                console.error('Error getting current time:', error);
                return 0;
            }
        }
        return 0;
    }

    // Seek to specific time
    seekTo(seconds) {
        if (this.player && this.isPlayerReady) {
            try {
                this.player.seekTo(seconds, true);
            } catch (error) {
                console.error('Error seeking to time:', error);
            }
        }
    }

    // Format seconds to MM:SS or HH:MM:SS
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Parse time string back to seconds
    parseTimeToSeconds(timeString) {
        const parts = timeString.split(':').map(part => parseInt(part, 10));
        if (parts.length === 2) {
            return parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return 0;
    }

    // Get video info
    getVideoInfo() {
        if (this.player && this.isPlayerReady) {
            try {
                const videoData = this.player.getVideoData();
                return {
                    title: videoData.title || 'Unknown Title',
                    duration: this.player.getDuration() || 0,
                    videoId: this.currentVideoId
                };
            } catch (error) {
                console.error('Error getting video info:', error);
                return {
                    title: 'Unknown Title',
                    duration: 0,
                    videoId: this.currentVideoId
                };
            }
        }
        return null;
    }
}

// Create global instance
const youtubeManager = new YouTubeManager();

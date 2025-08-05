class NoteTakingApp {
    constructor() {
        this.currentVideoId = null;
        this.editingNoteId = null;
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        this.initializeEventListeners();
        this.initializeDarkMode();
    }

    initializeEventListeners() {
        // Load video button
        document.getElementById('loadVideo').addEventListener('click', () => this.loadVideo());
        
        // Enter key on URL input
        document.getElementById('youtubeUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadVideo();
        });

        // Save note button
        document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
        
        // Add timestamp button
        document.getElementById('addTimestamp').addEventListener('click', () => this.addTimestamp());
        
        // Export notes button
        document.getElementById('exportNotes').addEventListener('click', () => this.exportNotes());
        
        // Clear all notes button
        document.getElementById('clearAllNotes').addEventListener('click', () => this.clearAllNotes());
        
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());
        
        // Modal event listeners
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeEditModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEditedNote());
        
        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeEditModal();
        });

        // Enter key handlers for note inputs
        document.getElementById('noteTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('noteContent').focus();
        });
        
        document.getElementById('noteContent').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.saveNote();
        });
    }

    initializeDarkMode() {
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
            document.getElementById('darkModeToggle').querySelector('span').textContent = '☀️';
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', this.isDarkMode);
        
        const toggleButton = document.getElementById('darkModeToggle').querySelector('span');
        toggleButton.textContent = this.isDarkMode ? '☀️' : '🌙';
    }

    updateLoadingStatus(message) {
        document.getElementById('loadingStatus').textContent = message;
    }

    async loadVideo() {
        const urlInput = document.getElementById('youtubeUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            this.showNotification('Please enter a YouTube URL', 'error');
            return;
        }

        const videoId = youtubeManager.extractVideoId(url);
        if (!videoId) {
            this.showNotification('Invalid YouTube URL. Please check the format.', 'error');
            return;
        }

        const loadButton = document.getElementById('loadVideo');
        loadButton.disabled = true;
        loadButton.textContent = 'Loading...';
        this.updateLoadingStatus('Initializing YouTube player...');

        try {
            // Wait for API and initialize player
            await youtubeManager.initPlayer(videoId, 'player');
            this.currentVideoId = videoId;
            
            this.updateLoadingStatus('Player loaded successfully!');
            
            // Show video and notes container
            document.getElementById('videoNotesContainer').classList.remove('hidden');
            
            // Wait a bit for video data to load, then update info
            setTimeout(() => {
                this.updateVideoInfo();
            }, 2000);
            
            // Load existing notes
            this.loadNotes();
            
            this.showNotification('Video loaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error loading video:', error);
            this.updateLoadingStatus('Error loading video. Please try again.');
            this.showNotification('Error loading video. Please check the URL and try again.', 'error');
        } finally {
            loadButton.disabled = false;
            loadButton.textContent = 'Load Video';
        }
    }

    updateVideoInfo() {
        const videoInfo = youtubeManager.getVideoInfo();
        const videoInfoElement = document.getElementById('videoInfo');
        
        if (videoInfo) {
            videoInfoElement.innerHTML = `
                <div class="space-y-1">
                    <div class="font-medium">${this.escapeHtml(videoInfo.title)}</div>
                    <div class="text-xs opacity-75">
                        Duration: ${youtubeManager.formatTime(videoInfo.duration)} | 
                        Video ID: ${videoInfo.videoId}
                    </div>
                </div>
            `;
        } else {
            videoInfoElement.innerHTML = '<div class="text-red-500">Failed to load video information</div>';
        }
    }

    addTimestamp() {
        if (!youtubeManager.isPlayerReady) {
            this.showNotification('Video player not ready yet. Please wait.', 'error');
            return;
        }

        const currentTime = youtubeManager.getCurrentTime();
        const formattedTime = youtubeManager.formatTime(currentTime);
        const noteContent = document.getElementById('noteContent');
        
        const timestampText = `[${formattedTime}] `;
        
        // Insert timestamp at cursor position
        const startPos = noteContent.selectionStart;
        const endPos = noteContent.selectionEnd;
        const currentValue = noteContent.value;
        
        noteContent.value = currentValue.substring(0, startPos) + timestampText + currentValue.substring(endPos);
        noteContent.selectionStart = noteContent.selectionEnd = startPos + timestampText.length;
        noteContent.focus();
        
        this.showNotification(`Timestamp ${formattedTime} added!`, 'success');
    }

    saveNote() {
        if (!this.currentVideoId) {
            this.showNotification('No video loaded', 'error');
            return;
        }

        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();

        if (!title || !content) {
            this.showNotification('Please enter both title and content', 'error');
            return;
        }

        const note = {
            title,
            content,
            timestamp: this.extractTimestamp(content)
        };

        if (storageManager.addNote(this.currentVideoId, note)) {
            // Clear form
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            
            // Reload notes
            this.loadNotes();
            
            this.showNotification('Note saved successfully!', 'success');
        } else {
            this.showNotification('Error saving note', 'error');
        }
    }

    extractTimestamp(content) {
        const timestampRegex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/;
        const match = content.match(timestampRegex);
        return match ? match[1] : null;
    }

    loadNotes() {
        if (!this.currentVideoId) return;

        const notes = storageManager.getNotesForVideo(this.currentVideoId);
        const notesList = document.getElementById('notesList');
        
        if (notes.length === 0) {
            notesList.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No notes yet. Add your first note!</p>';
            return;
        }

        notesList.innerHTML = notes.map(note => `
            <div class="note-item bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800 dark:text-white flex-1 mr-2">${this.escapeHtml(note.title)}</h4>
                    <div class="flex space-x-1 flex-shrink-0">
                        ${note.timestamp ? `
                            <button onclick="app.seekToTimestamp('${note.timestamp}')" 
                                    class="timestamp-btn px-2 py-1 text-xs text-white rounded hover:opacity-80 transition-opacity"
                                    title="Jump to ${note.timestamp}">
                                ${note.timestamp}
                            </button>
                        ` : ''}
                        <button onclick="app.editNote('${note.id}')" 
                                class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                                title="Edit note">
                            ✏️
                        </button>
                        <button onclick="app.deleteNote('${note.id}')" 
                                class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                                title="Delete note">
                            🗑️
                        </button>
                    </div>
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">${this.escapeHtml(note.content)}</p>
                <div class="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    Created: ${new Date(note.createdAt).toLocaleString()}
                    ${note.updatedAt ? `<br>Updated: ${new Date(note.updatedAt).toLocaleString()}` : ''}
                </div>
            </div>
        `).join('');
    }

    seekToTimestamp(timestamp) {
        if (!youtubeManager.isPlayerReady) {
            this.showNotification('Player not ready', 'error');
            return;
        }
        
        const seconds = youtubeManager.parseTimeToSeconds(timestamp);
        youtubeManager.seekTo(seconds);
        this.showNotification(`Jumped to ${timestamp}`, 'success');
    }

    editNote(noteId) {
        const notes = storageManager.getNotesForVideo(this.currentVideoId);
        const note = notes.find(n => n.id === noteId);
        
        if (!note) return;

        this.editingNoteId = noteId;
        document.getElementById('editNoteTitle').value = note.title;
        document.getElementById('editNoteContent').value = note.content;
        document.getElementById('editModal').classList.remove('hidden');
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('editNoteTitle').focus();
        }, 100);
    }

    closeEditModal() {
        this.editingNoteId = null;
        document.getElementById('editModal').classList.add('hidden');
    }

    saveEditedNote() {
        if (!this.editingNoteId) return;

        const title = document.getElementById('editNoteTitle').value.trim();
        const content = document.getElementById('editNoteContent').value.trim();

        if (!title || !content) {
            this.showNotification('Please enter both title and content', 'error');
            return;
        }

        const updatedNote = {
            title,
            content,
            timestamp: this.extractTimestamp(content)
        };

        if (storageManager.updateNote(this.currentVideoId, this.editingNoteId, updatedNote)) {
            this.loadNotes();
            this.closeEditModal();
            this.showNotification('Note updated successfully!', 'success');
        } else {
            this.showNotification('Error updating note', 'error');
        }
    }

    deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        if (storageManager.deleteNote(this.currentVideoId, noteId)) {
            this.loadNotes();
            this.showNotification('Note deleted successfully!', 'success');
        } else {
            this.showNotification('Error deleting note', 'error');
        }
    }

    clearAllNotes() {
        if (!confirm('Are you sure you want to delete all notes for this video?')) return;

        if (storageManager.clearNotesForVideo(this.currentVideoId)) {
            this.loadNotes();
            this.showNotification('All notes cleared!', 'success');
        } else {
            this.showNotification('Error clearing notes', 'error');
        }
    }

    exportNotes() {
        if (!this.currentVideoId) {
            this.showNotification('No video loaded', 'error');
            return;
        }

        const notes = storageManager.getNotesForVideo(this.currentVideoId);
        if (notes.length === 0) {
            this.showNotification('No notes to export', 'error');
            return;
        }

        const videoInfo = youtubeManager.getVideoInfo();
        const videoTitle = videoInfo ? videoInfo.title : 'Unknown Video';
        const exportText = storageManager.exportNotesToText(this.currentVideoId, videoTitle);

        try {
            // Create and download file
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `youtube-notes-${this.currentVideoId}-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showNotification('Notes exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification('Error exporting notes', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full max-w-sm`;
        
        // Set colors based on type
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        notification.className += ` ${colors[type] || colors.info}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 4000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NoteTakingApp();
    console.log('App initialized');
});

// Global function for YouTube API callback
function onYouTubeIframeAPIReady() {
    console.log('YouTube API callback triggered');
}

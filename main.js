// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化追蹤器
    const youtubeTracker = new YouTubeTracker();
    const twitchTracker = new TwitchTracker();
    
    // 立即更新數據
    youtubeTracker.update();
    twitchTracker.update();
    
    // 設定定期更新（每小時更新一次）
    setInterval(() => {
        youtubeTracker.update();
        twitchTracker.update();
    }, 60 * 60 * 1000);

    // 手機版選單按鈕功能
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // 點擊選單項目後自動關閉選單（在手機版）
    const menuItems = document.querySelectorAll('nav a');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });

    // 錯誤處理
    window.addEventListener('error', function(event) {
        const statsElements = document.querySelectorAll('#youtube-subscribers, #twitch-followers');
        statsElements.forEach(el => {
            if (el.textContent === '載入中...') {
                el.textContent = '資料載入失敗';
            }
        });
    });

    // 平滑滾動到錨點
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 週表顯示處理
    const scheduleContainer = document.querySelector('.stream-schedule');
    if (scheduleContainer) {
        const checkScheduleImage = () => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = 'schedule.png?' + new Date().getTime(); // 加入時間戳防止快取
            });
        };

        const updateScheduleDisplay = async () => {
            try {
                const settings = JSON.parse(localStorage.getItem('streamSettings') || '{}');
                const hasImage = await checkScheduleImage();

                if (settings.suddenStream) {
                    scheduleContainer.textContent = '全突發！';
                } else if (!hasImage) {
                    scheduleContainer.textContent = '暫無週表';
                } else {
                    scheduleContainer.innerHTML = '<img src="schedule.png" alt="週表" class="schedule-image">';
                }
            } catch (error) {
                console.error('更新週表顯示時發生錯誤:', error);
                scheduleContainer.textContent = '週表載入失敗';
            }
        };

        // 初始更新週表
        updateScheduleDisplay();

        // 監聽 localStorage 變更
        window.addEventListener('storage', (e) => {
            if (e.key === 'streamSettings') {
                updateScheduleDisplay();
            }
        });
    }
});

// 在視窗調整大小時處理選單狀態
window.addEventListener('resize', debounce(() => {
    const navMenu = document.querySelector('nav ul');
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
    }
}, 250));

// 載入狀態處理
function updateLoadingState(elementId, isLoading) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isLoading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }
}
// admin.js
document.addEventListener('DOMContentLoaded', function() {
    const suddenStreamCheckbox = document.getElementById('sudden-stream');
    const saveButton = document.getElementById('save-settings');
    const schedulePreview = document.getElementById('schedule-preview');

    // 從 localStorage 讀取設定
    const loadSettings = () => {
        const settings = JSON.parse(localStorage.getItem('streamSettings') || '{}');
        suddenStreamCheckbox.checked = settings.suddenStream || false;
        updatePreview();
    };

    // 儲存設定到 localStorage
    const saveSettings = () => {
        const settings = {
            suddenStream: suddenStreamCheckbox.checked
        };
        localStorage.setItem('streamSettings', JSON.stringify(settings));
        updatePreview();
    };

    // 檢查是否有週表圖片
    const checkScheduleImage = () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = 'schedule.png';
        });
    };

    // 更新預覽
    const updatePreview = async () => {
        const hasImage = await checkScheduleImage();
        const isSuddenStream = suddenStreamCheckbox.checked;

        if (isSuddenStream) {
            schedulePreview.textContent = '全突發！';
        } else if (!hasImage) {
            schedulePreview.textContent = '暫無週表';
        } else {
            schedulePreview.innerHTML = '<img src="schedule.png" alt="週表" class="schedule-image">';
        }
    };

    // 事件監聽器
    saveButton.addEventListener('click', saveSettings);
    suddenStreamCheckbox.addEventListener('change', () => {
        updatePreview();
    });

    // 初始化
    loadSettings();
});
// script.js

// تكوين Supabase
const SUPABASE_URL = 'https://hzznfexratskutwppdol.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6em5mZXhyYXRza3V0d3BwZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzY4NzAsImV4cCI6MjA3MzAxMjg3MH0.Ui3semM9P8-p8GMEgiVXPcdtFEJ6GncIcUY0coyZClE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// المتغيرات العامة
let appVersion = {
    version: "1.0.0",
    update_date: "2024-01-01",
    file_size: "45 MB",
    download_url: "https://example.com/app.apk" // استبدل برابط APK الفعلي
};

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function () {
    loadAppInfo();
    setupEventListeners();
    checkSubscriptionStatus();
});

// تحميل معلومات التطبيق من قاعدة البيانات
async function loadAppInfo() {
    try {
        // جلب آخر إصدار
        const { data: versionData, error: versionError } = await supabase
            .from('app_versions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (!versionError && versionData.length > 0) {
            appVersion = versionData[0];
            document.getElementById('versionNumber').textContent = appVersion.version;
            document.getElementById('updateDate').textContent = appVersion.update_date;
            document.getElementById('fileSize').textContent = appVersion.file_size;
        }

        // جلب عدد التحميلات
        // جلب عدد التحميلات للإصدار الحالي
        const { data: countData, error: downloadError } = await supabase
            .from('download_counts')
            .select('count')
            .eq('version', appVersion.version)
            .single();

        if (!downloadError && countData) {
            document.getElementById('downloadCount').textContent = countData.count;
        } else {
            document.getElementById('downloadCount').textContent = '0';
        }

    } catch (error) {
        console.error('خطأ في تحميل معلومات التطبيق:', error);
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.getElementById('subscribeBtn').addEventListener('click', openSubscriptionModal);
    document.getElementById('confirmBtn').addEventListener('click', confirmSubscription);
    document.getElementById('cancelBtn').addEventListener('click', closeSubscriptionModal);
    document.getElementById('downloadBtn').addEventListener('click', downloadApp);
}

function openSubscriptionModal() {
    document.getElementById('confirmationModal').classList.add('active');

    const channelId = "UCY1cREXhxupNmNPHbX6ESMg";
    const youtubeAppUrl = "vnd.youtube://channel/" + channelId;
    const youtubeWebUrl = "https://www.youtube.com/channel/" + channelId + "?sub_confirmation=1";

    // نجرب نفتح التطبيق
    const now = Date.now();
    window.location.href = youtubeAppUrl;

    // بعد 1.5 ثانية لو التطبيق ما فتحش → نفتح الرابط العادي
    setTimeout(() => {
        if (Date.now() - now < 2000) {
            window.location.href = youtubeWebUrl;
        }
    }, 1500);

    // تعطيل زر التأكيد مؤقتاً
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = "انتظر...";

    // تفعيل الزر بعد 20 ثانية
    setTimeout(() => {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "✅ أنا اشتركت";
    }, 20000);
}




// إغلاق نافذة الاشتراك
function closeSubscriptionModal() {
    document.getElementById('confirmationModal').classList.remove('active');
}

// تأكيد الاشتراك
function confirmSubscription() {
    localStorage.setItem('youtube_subscribed', 'true');
    localStorage.setItem('subscription_date', new Date().toISOString());
    closeSubscriptionModal();
    activateDownload();
    showSuccessMessage('تم تأكيد الاشتراك بنجاح! يمكنك الآن تحميل التطبيق.');
}

// التحقق من حالة الاشتراك
function checkSubscriptionStatus() {
    if (localStorage.getItem('youtube_subscribed') === 'true') {
        activateDownload();
    }
}

// تفعيل زر التحميل
function activateDownload() {
    document.getElementById('subscriptionStatus').style.display = 'flex';
    document.getElementById('subscribeBtn').style.display = 'none';
    document.getElementById('step2').style.display = 'flex';
    document.getElementById('step2').classList.add('active');
}

// تنزيل التطبيق
// تنزيل التطبيق
async function downloadApp() {
    try {
        const version = appVersion.version;

        // جلب العداد الحالي للإصدار
        const { data: existing, error: fetchError } = await supabase
            .from('download_counts')
            .select('count')
            .eq('version', version)
            .single();

        let newCount = 1;

        if (!fetchError && existing) {
            // العداد موجود → نزيده
            newCount = existing.count + 1;
            const { error: updateError } = await supabase
                .from('download_counts')
                .update({ count: newCount })
                .eq('version', version);

            if (updateError) throw updateError;
        } else {
            // العداد غير موجود → نُدخله لأول مرة
            const { error: insertError } = await supabase
                .from('download_counts')
                .insert({ version, count: 1 });

            if (insertError) throw insertError;
        }

        // تحديث العرض
        document.getElementById('downloadCount').textContent = newCount;

        // بدء التحميل
        startDirectDownload();
    } catch (error) {
        console.error('خطأ في تحديث عدد التنزيلات:', error);
        alert('حدث خطأ أثناء تسجيل التنزيل. يرجى المحاولة لاحقًا.');
    }
}
// بدء التحميل المباشر
function startDirectDownload() {
    const link = document.createElement('a');
    link.href = appVersion.download_url;
    link.download = `دليل_الصيد_الليبي_${appVersion.version}.apk`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessMessage('بدأ تحميل التطبيق! إذا لم يبدأ التحميل تحقق من نافذة التنزيلات.');
}

// رسالة نجاح
function showSuccessMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'success-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 1001;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
}

// CSS للأنيميشن
const style = document.createElement('style');
style.textContent = `
    .success-message { animation: slideDown 0.3s ease; }
    @keyframes slideDown {
        from { transform: translate(-50%, -100%); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
    }
`;
document.head.appendChild(style);

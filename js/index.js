// تهيئة Supabase
document.addEventListener('DOMContentLoaded', function () {
    // تهيئة Supabase
    if (typeof supabase !== 'undefined') {
        window.supabaseClient = supabase.createClient(
            'https://hzznfexratskutwppdol.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6em5mZXhyYXRza3V0d3BwZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzY4NzAsImV4cCI6MjA3MzAxMjg3MH0.Ui3semM9P8-p8GMEgiVXPcdtFEJ6GncIcUY0coyZClE'
        );
        console.log('✅ Supabase initialized successfully');

        // جلب إحصائيات التطبيق
        fetchAppStats();
    } else {
        console.error('❌ Supabase not loaded');
    }

    // تبديل الوضع الليلي
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function () {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });

    // زر تحميل التطبيق
    const downloadBtn = document.getElementById('download-btn');
    downloadBtn.addEventListener('click', function () {
        // يمكن إضافة منطق لتحميل التطبيق
        alert('سيتم توجيهك لتحميل التطبيق من المتجر المناسب');
    });
});

// دالة لجلب إحصائيات التطبيق من قاعدة البيانات
async function fetchAppStats() {
    try {
        // جلب عدد المستخدمين
        const { data: users, error: usersError } = await window.supabaseClient
            .from('users')
            .select('id', { count: 'exact' });

        if (!usersError && users) {
            document.getElementById('users-count').textContent = users.length + '+';
        }

        // جلب عدد أماكن الصيد
        const { data: spots, error: spotsError } = await window.supabaseClient
            .from('fishing_spots')
            .select('id', { count: 'exact' });

        if (!spotsError && spots) {
            document.getElementById('spots-count').textContent = spots.length + '+';
        }

        // جلب عدد أنواع الأسماك
        const { data: fish, error: fishError } = await window.supabaseClient
            .from('fish_species')
            .select('id', { count: 'exact' });

        if (!fishError && fish) {
            document.getElementById('fish-count').textContent = fish.length + '+';
        }

    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
    }
}
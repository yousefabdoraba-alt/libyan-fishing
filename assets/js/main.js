// assets/js/main.js

// ---------- CONFIG ----------
const SUPABASE_URL = 'https://hzznfexratskutwppdol.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6em5mZXhyYXRza3V0d3BwZG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzY4NzAsImV4cCI6MjA3MzAxMjg3MH0.Ui3semM9P8-p8GMEgiVXPcdtFEJ6GncIcUY0coyZClE';

// إعدادات ImgBB
const IMGBB_CONFIG = {
    apiKey: '1a68fd76573436c433842cd3c059b44e',
    maxSize: 32 * 1024 * 1024, // 32MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// ---------- Init Supabase safely ----------
let supabaseClient = null;

function initializeSupabase() {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase initialized');
            return true;
        } catch (err) {
            console.error('❌ Supabase init error:', err);
            return false;
        }
    } else {
        console.warn('⚠️ Supabase library not loaded.');
        return false;
    }
}

// تهيئة Supabase فوراً
initializeSupabase();

// ---------- DOM helpers ----------
function safeText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// ---------- Fetch app stats (uses supabase if available) ----------
async function fetchAppStats() {
    try {
        if (!supabaseClient) {
            // No supabase -> keep placeholders or set mock values
            console.warn('Supabase client not available — using fallback stats.');
            safeText('users-count', '5,000+');
            safeText('spots-count', '120+');
            safeText('fish-count', '50+');
            return;
        }

        // users count
        const usersRes = await supabaseClient.from('users').select('id', { count: 'exact', head: false });
        if (!usersRes.error) {
            // prefer count if available, else length
            const count = (usersRes.count != null) ? usersRes.count : (Array.isArray(usersRes.data) ? usersRes.data.length : '?');
            safeText('users-count', (count !== '?' ? count + '+' : '0+'));
        }

        // fishing_spots count
        const spotsRes = await supabaseClient.from('fishing_spots').select('id', { count: 'exact', head: false });
        if (!spotsRes.error) {
            const count = (spotsRes.count != null) ? spotsRes.count : (Array.isArray(spotsRes.data) ? spotsRes.data.length : '?');
            safeText('spots-count', (count !== '?' ? count + '+' : '0+'));
        }

        // fish species count
        const fishRes = await supabaseClient.from('fish_species').select('id', { count: 'exact', head: false });
        if (!fishRes.error) {
            const count = (fishRes.count != null) ? fishRes.count : (Array.isArray(fishRes.data) ? fishRes.data.length : '?');
            safeText('fish-count', (count !== '?' ? count + '+' : '0+'));
        }

    } catch (err) {
        console.error('❌ Error fetching stats:', err);
    }
}

// ---------- إدارة حالة المستخدم ----------
function checkUserStatus() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loggedInSection = document.getElementById('user-logged-in');
    const loggedOutSection = document.getElementById('user-logged-out');

    // التحقق من وجود العناصر أولاً
    if (!loggedInSection || !loggedOutSection) {
        console.warn('⚠️ User modal sections not found in DOM');
        return;
    }

    if (user) {
        // المستخدم مسجل الدخول
        const displayName = document.getElementById('user-display-name');
        const displayEmail = document.getElementById('user-display-email');

        if (displayName) displayName.textContent = user.name;
        if (displayEmail) displayEmail.textContent = user.email;

        // تحديث الصورة الشخصية
        updateUserAvatar(user.avatar_url);

        // تحديث واجهة المستخدم بناءً على نوع الحساب
        updateUserInterface(user);

        loggedInSection.style.display = 'block';
        loggedOutSection.style.display = 'none';
    } else {
        // المستخدم غير مسجل
        loggedInSection.style.display = 'none';
        loggedOutSection.style.display = 'block';
    }
}

// دالة تحديث الصورة الشخصية
function updateUserAvatar(avatarUrl) {
    const avatarImg = document.getElementById('user-avatar-img');
    const avatarIcon = document.getElementById('user-avatar-icon');

    // التحقق من وجود العناصر أولاً
    if (!avatarImg || !avatarIcon) {
        console.warn('⚠️ Avatar elements not found in DOM');
        return;
    }

    if (avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
        avatarIcon.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarIcon.style.display = 'block';
    }
}

// دالة تحديث واجهة المستخدم بناءً على نوع الحساب ووجود المتجر
async function updateUserInterface(user) {
    const createStoreBtn = document.getElementById('create-store-btn');
    const storeSettingsBtn = document.getElementById('store-settings-btn');
    const userType = document.getElementById('user-display-type');
    const storeStatus = document.getElementById('user-store-status');

    // التحقق من وجود العناصر أولاً
    if (!createStoreBtn || !storeSettingsBtn || !userType || !storeStatus) {
        console.warn('⚠️ User interface elements not found in DOM');
        return;
    }

    // إخفاء جميع الأزرار أولاً
    createStoreBtn.style.display = 'none';
    storeSettingsBtn.style.display = 'none';
    userType.style.display = 'none';
    storeStatus.style.display = 'none';

    if (user.is_store_owner && (user.store_status === 'approved' || user.is_approved)) {
        // حساب متجر موافق عليه
        userType.textContent = '👑 صاحب متجر';
        userType.style.display = 'block';
        storeStatus.textContent = 'موافق عليه';
        storeStatus.className = 'store-status status-approved';
        storeStatus.style.display = 'block';

        // ⭐ الإضافة: التحقق من وجود متجر في localStorage أولاً
        const userStore = JSON.parse(localStorage.getItem('user_store') || 'null');

        if (userStore) {
            console.log('🏪 Store found in localStorage, showing edit button');
            // لديه متجر مسبقاً - عرض زر تعديل البيانات
            storeSettingsBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل بيانات المتجر';
            storeSettingsBtn.style.display = 'flex';
            createStoreBtn.style.display = 'none';
            return; // لا حاجة للتحقق من قاعدة البيانات
        }

        // فقط إذا كان supabaseClient متاحاً ولم يكن هناك متجر في localStorage، تحقق من وجود متجر
        if (supabaseClient) {
            const { store, error } = await checkUserStore(user.id);

            if (error) {
                console.error('❌ Error checking user store:', error);
                return;
            }

            console.log('🏪 Store data from database:', store);

            if (store) {
                // لديه متجر مسبقاً - عرض زر تعديل البيانات
                storeSettingsBtn.innerHTML = '<i class="fas fa-edit"></i> تعديل بيانات المتجر';
                storeSettingsBtn.style.display = 'flex';
                createStoreBtn.style.display = 'none';

                // حفظ بيانات المتجر في localStorage مع التأكد من image_url
                const storeWithImage = {
                    ...store,
                    image_url: store.image_url || null
                };
                localStorage.setItem('user_store', JSON.stringify(storeWithImage));
                console.log('💾 Saved store to localStorage:', storeWithImage);

            } else {
                // لا يوجد متجر - عرض زر إنشاء متجر
                createStoreBtn.innerHTML = '<i class="fas fa-store"></i> إنشاء متجر';
                createStoreBtn.style.display = 'flex';
                storeSettingsBtn.style.display = 'none';

                // مسح أي بيانات متجر قديمة
                localStorage.removeItem('user_store');
                console.log('🗑️ No store found, cleared localStorage');
            }
        } else {
            // إذا لم يكن supabaseClient متاحاً، افترض أنه لا يوجد متجر
            createStoreBtn.innerHTML = '<i class="fas fa-store"></i> إنشاء متجر';
            createStoreBtn.style.display = 'flex';
            storeSettingsBtn.style.display = 'none';
        }

    } else if (user.is_store_owner) {
        // حساب متجر لكن غير موافق عليه
        userType.textContent = '👑 صاحب متجر';
        userType.style.display = 'block';

        if (user.store_status === 'pending') {
            storeStatus.textContent = 'قيد المراجعة';
            storeStatus.className = 'store-status status-pending';
        } else {
            storeStatus.textContent = 'مرفوض';
            storeStatus.className = 'store-status status-rejected';
        }
        storeStatus.style.display = 'block';

        createStoreBtn.style.display = 'none';
        storeSettingsBtn.style.display = 'none';

    } else {
        // حساب مستخدم عادي
        userType.textContent = '👤 مستخدم عادي';
        userType.style.display = 'block';
        createStoreBtn.style.display = 'none';
        storeSettingsBtn.style.display = 'none';
    }
}
// زر تحديث البيانات
const refreshDataBtn = document.getElementById('refresh-data-btn');
if (refreshDataBtn) {
    refreshDataBtn.addEventListener('click', async function () {
        const originalHTML = this.innerHTML;
        this.innerHTML = '<div class="loading"></div> جاري التحديث...';
        this.disabled = true;

        await refreshUserData();

        setTimeout(() => {
            this.innerHTML = originalHTML;
            this.disabled = false;
            showTempMessage('✅ تم تحديث البيانات بنجاح');
        }, 1000);
    });
}

// دالة لعرض رسالة مؤقتة
function showTempMessage(message) {
    // يمكنك إضافة رسالة مؤقتة في واجهة المستخدم
    console.log(message);
    // أو عرض alert بسيط
    alert(message);
}
// دالة رفع الصورة لـ ImgBB
async function uploadImageToImgBB(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_CONFIG.apiKey}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.error.message || 'فشل في رفع الصورة');
        }
    } catch (error) {
        console.error('❌ Error uploading image:', error);
        throw error;
    }
}

// دالة التحقق من وجود متجر للمستخدم
async function checkUserStore(userId) {
    // التحقق من وجود supabaseClient أولاً
    if (!supabaseClient) {
        console.warn('⚠️ Supabase client not available - skipping store check');
        return { store: null, error: null };
    }

    try {
        const { data: store, error } = await supabaseClient
            .from('stores')
            .select('*')
            .eq('owner_id', userId)
            .maybeSingle();

        if (error) {
            console.error('❌ Error checking user store:', error);
            return { store: null, error };
        }

        return { store, error: null };
    } catch (error) {
        console.error('❌ Error checking user store:', error);
        return { store: null, error };
    }
}

// دالة لتحديث بيانات المستخدم والمتجر من قاعدة البيانات
async function refreshUserData() {
    // التحقق من وجود supabaseClient أولاً
    if (!supabaseClient) {
        console.warn('⚠️ Supabase client not available - skipping data refresh');
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!currentUser || !currentUser.id) return;

        const { data: userData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error) throw error;

        if (userData) {
            // تحديث localStorage بآخر بيانات المستخدم
            localStorage.setItem('user', JSON.stringify(userData));

            // إذا كان صاحب متجر موافق عليه، جلب بيانات المتجر أيضاً
            if (userData.is_store_owner && (userData.store_status === 'approved' || userData.is_approved)) {
                const { data: storeData, error: storeError } = await supabaseClient
                    .from('stores')
                    .select('*')
                    .eq('owner_id', userData.id)
                    .maybeSingle();

                if (!storeError && storeData) {
                    localStorage.setItem('user_store', JSON.stringify(storeData));
                } else {
                    localStorage.removeItem('user_store');
                }
            }

            // تحديث الواجهة
            checkUserStatus();
        }
    } catch (error) {
        console.error('❌ Error refreshing user data:', error);
    }
}

// دالة لتحميل المكونات
async function loadComponent(componentId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(componentId).innerHTML = html;
        console.log(`✅ ${componentId} loaded successfully`);
        return true;
    } catch (error) {
        console.error(`❌ Error loading ${componentId}:`, error);
        return false;
    }
}

// دالة لتحميل قسم الاتصال
async function loadContactSection(containerId = 'contact-section') {
    await loadComponent(containerId, './components/contact-section.html');
}

// تهيئة جميع المكونات
async function initializeComponents() {
    const headerLoaded = await loadComponent('header-container', './components/header.html');
    const footerLoaded = await loadComponent('footer-container', './components/footer.html');

    if (headerLoaded && footerLoaded) {
        initializeHeaderFunctions();
        initializeUserFunctions();

        // ⭐ الإضافة الجديدة: التحقق من تحديث البيانات
        checkForDataRefresh();
        startAutoRefresh();
    }

    if (document.getElementById('contact-section')) {
        await loadContactSection();
    }

    // جلب الإحصائيات بعد تحميل المكونات
    fetchAppStats();
}

// تهيئة وظائف المستخدم
function initializeUserFunctions() {
    const userIcon = document.getElementById('user-icon');
    const userModal = document.getElementById('user-modal');
    const userModalClose = document.getElementById('user-modal-close');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const manageAccountBtn = document.getElementById('manage-account');
    const createStoreBtn = document.getElementById('create-store-btn');
    const storeSettingsBtn = document.getElementById('store-settings-btn');
    const avatarEditBtn = document.getElementById('avatar-edit-btn');
    const avatarUpload = document.getElementById('avatar-upload');

    // التحقق من وجود العناصر
    if (!userModal) {
        console.warn('⚠️ User modal not found in DOM');
        return;
    }

    // فتح نافذة المستخدم
    window.openUserModal = async function () {
        await refreshUserData(); // تحديث البيانات أولاً
        checkUserStatus();
        if (userModal) {
            userModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    // إغلاق نافذة المستخدم
    function closeUserModal() {
        if (userModal) {
            userModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // فتح نافذة المستخدم عند الضغط على أيقونة المستخدم
    if (userIcon) {
        userIcon.addEventListener('click', window.openUserModal);
    }

    // إغلاق نافذة المستخدم
    if (userModalClose) {
        userModalClose.addEventListener('click', closeUserModal);
    }

    // إغلاق النافذة عند النقر خارجها
    if (userModal) {
        userModal.addEventListener('click', function (e) {
            if (e.target === userModal) {
                closeUserModal();
            }
        });
    }

    // زر تسجيل الدخول
    if (loginBtn) {
        loginBtn.addEventListener('click', function () {
            window.location.href = '../login.html';
        });
    }

    // زر إنشاء حساب
    if (signupBtn) {
        signupBtn.addEventListener('click', function () {
            window.location.href = '../login.html?signup=true';
        });
    }

    // زر تسجيل الخروج
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('user');
            localStorage.removeItem('user_store');
            checkUserStatus();
            closeUserModal();
            // إظهار رسالة نجاح
            alert('تم تسجيل الخروج بنجاح');
        });
    }

    // زر إدارة الحساب
    if (manageAccountBtn) {
        manageAccountBtn.addEventListener('click', function () {
            alert('هذه الميزة قيد التطوير حالياً');
        });
    }

    // زر إنشاء متجر
    if (createStoreBtn) {
        createStoreBtn.addEventListener('click', function () {
            window.location.href = '../store-setup.html';
        });
    }

    // زر إعدادات المتجر
    if (storeSettingsBtn) {
        storeSettingsBtn.addEventListener('click', function () {
            window.location.href = '../store-setup.html';
        });
    }

    // زر تغيير الصورة الشخصية
    if (avatarEditBtn && avatarUpload) {
        avatarEditBtn.addEventListener('click', function () {
            avatarUpload.click();
        });

        avatarUpload.addEventListener('change', async function (e) {
            const file = e.target.files[0];
            if (!file) return;

            // التحقق من نوع الملف
            if (!IMGBB_CONFIG.allowedTypes.includes(file.type)) {
                alert('❌ نوع الملف غير مدعوم. يرجى اختيار صورة (JPEG, PNG, GIF, WebP)');
                return;
            }

            // التحقق من حجم الملف
            if (file.size > IMGBB_CONFIG.maxSize) {
                alert('❌ حجم الملف كبير جداً. الحد الأقصى 32MB');
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');

                // رفع الصورة لـ ImgBB
                const imageUrl = await uploadImageToImgBB(file);

                // تحديث الصورة في الواجهة
                updateUserAvatar(imageUrl);

                // إذا كان supabaseClient متاحاً، تحديث في قاعدة البيانات
                if (supabaseClient) {
                    const { error } = await supabaseClient
                        .from('users')
                        .update({ avatar_url: imageUrl })
                        .eq('id', user.id);

                    if (error) throw error;
                }

                // تحديث بيانات المستخدم في localStorage
                user.avatar_url = imageUrl;
                localStorage.setItem('user', JSON.stringify(user));

                alert('✅ تم تحديث الصورة الشخصية بنجاح');

            } catch (error) {
                console.error('❌ Error updating avatar:', error);
                alert('❌ فشل في تحديث الصورة: ' + error.message);
            }
        });
    }

    // التحقق من حالة المستخدم عند التهيئة
    checkUserStatus();
}

// تهيئة وظائف الهيدر
function initializeHeaderFunctions() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebarMenu = document.getElementById('sidebar-menu');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const themeToggle = document.getElementById('theme-toggle');

    // تبديل الوضع الليلي
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggle.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });

        // استعادة الوضع من التخزين المحلي
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const icon = themeToggle.querySelector('i');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // إدارة القائمة الجانبية
    if (hamburgerBtn && sidebarMenu) {
        hamburgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('open');
            sidebarMenu.classList.toggle('active');
            if (sidebarMenu.classList.contains('active')) {
                sidebarMenu.setAttribute('aria-hidden', 'false');
            } else {
                sidebarMenu.setAttribute('aria-hidden', 'true');
            }
        });
    }

    if (closeSidebarBtn && sidebarMenu && hamburgerBtn) {
        closeSidebarBtn.addEventListener('click', function () {
            sidebarMenu.classList.remove('active');
            hamburgerBtn.classList.remove('open');
            sidebarMenu.setAttribute('aria-hidden', 'true');
        });
    }

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener('click', function (event) {
        const target = event.target;
        if (!sidebarMenu || !hamburgerBtn) return;
        if (sidebarMenu.classList.contains('active')) {
            if (!sidebarMenu.contains(target) && !hamburgerBtn.contains(target)) {
                sidebarMenu.classList.remove('active');
                hamburgerBtn.classList.remove('open');
                sidebarMenu.setAttribute('aria-hidden', 'true');
            }
        }
    });

    // منع إغلاق القائمة عند النقر على الروابط
    document.querySelectorAll('.sidebar-menu .nav-menu a').forEach(a => {
        a.addEventListener('click', () => {
            if (sidebarMenu) sidebarMenu.classList.remove('active');
            if (hamburgerBtn) hamburgerBtn.classList.remove('open');
        });
    });

    setupDropdownMenus();
}

// دالة لإعداد القوائم الفرعية
function setupDropdownMenus() {
    // القوائم الفرعية في الجانبية
    const sidebarDropdowns = document.querySelectorAll('.sidebar-dropdown');

    sidebarDropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                dropdown.classList.toggle('active');

                // إغلاق القوائم الأخرى
                sidebarDropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
            });
        }
    });

    // إغلاق القوائم الفرعية عند النقر خارجها
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.opacity = '0';
                    menu.style.visibility = 'hidden';
                    menu.style.transform = 'translateY(-10px)';
                }
            });
        }
    });

    // إبقاء القائمة مفتوحة عند التمرير فوقها
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseenter', function () {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.opacity = '1';
                menu.style.visibility = 'visible';
                menu.style.transform = 'translateY(0)';
            }
        });

        dropdown.addEventListener('mouseleave', function () {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(-10px)';
            }
        });
    });
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function () {
    initializeComponents();
});

// دالة مساعدة للتحقق من تسجيل الدخول
function isUserLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user !== null;
}

// دالة مساعدة للحصول على بيانات المستخدم
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
}

// دالة مساعدة للتحقق من صلاحيات المتجر
function hasStoreAccess() {
    const user = getCurrentUser();
    return user && user.is_store_owner && (user.store_status === 'approved' || user.is_approved);
}

// دالة مساعدة للتحقق من وجود متجر
function hasStore() {
    const store = JSON.parse(localStorage.getItem('user_store') || 'null');
    return store !== null;
}
// استماع لحدث تحديث المتجر من الصفحات الأخرى
window.addEventListener('message', function (event) {
    if (event.data.type === 'STORE_UPDATED') {
        console.log('🔄 Store update received, refreshing user data...');
        refreshUserData();
    }
});
// تحديث حالة المستخدم عند التركيز على الصفحة
window.addEventListener('focus', function () {
    if (isUserLoggedIn()) {
        console.log('🔄 Page focused, refreshing user data...');
        refreshUserData();
    }
});

// تحديث حالة المستخدم عند ظهور الصفحة
document.addEventListener('visibilitychange', function () {
    if (!document.hidden && isUserLoggedIn()) {
        console.log('🔄 Page visible, refreshing user data...');
        refreshUserData();
    }
});
// التحقق من الحاجة لتحديث البيانات عند تحميل الصفحة
function checkForDataRefresh() {
    const shouldRefresh = localStorage.getItem('shouldRefreshUserData');
    if (shouldRefresh === 'true') {
        console.log('🔄 Refreshing user data on page load...');
        refreshUserData();
        localStorage.removeItem('shouldRefreshUserData');
    }
}
// تحديث حالة المستخدم كل 30 ثانية للبقاء محدثاً
function startAutoRefresh() {
    setInterval(() => {
        if (isUserLoggedIn()) {
            refreshUserData();
        }
    }, 30000); // 30 ثانية
}
// جعل الدوال متاحة globally للصفحات الأخرى
window.supabaseClient = supabaseClient;
// window.isValidImageUrl = isValidImageUrl;
window.uploadImageToImgBB = uploadImageToImgBB;
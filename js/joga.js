// ==========================================================================
// 1. БУРГЕР-МЕНЮ И СИНХРОНИЗАЦИЯ СКРОЛЛА К СЕКЦИЯМ
// ==========================================================================
const burgerToggle = document.getElementById('burgerToggle');
const navMenu = document.getElementById('navMenu');

// Открытие/закрытие бургер-меню на смартфонах
if (burgerToggle && navMenu) {
    burgerToggle.addEventListener('click', () => {
        navMenu.classList.toggle('mobile-open');
    });
}

// Плавный скролл с умным расчетом высоты липкой шапки
const navLinks = document.querySelectorAll('.nav-link, .footer-links-list a, .btn-secondary');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        
        if (targetId && targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                e.preventDefault();
                
                // Автоматически закрываем шторку мобильного меню при клике на ссылку
                if (navMenu) navMenu.classList.remove('mobile-open');
                
                // Переключаем активный класс на ссылках (только для главного меню)
                if (link.classList.contains('nav-link')) {
                    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
                    link.classList.add('active');
                }
                
                // Вычисляем высоту шапки, чтобы она не перекрывала заголовок секции
                const headerElement = document.querySelector('.yoga-header');
                const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                
                window.scrollTo({
                    top: targetSection.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
            }
        }
    });
});
// ==========================================================================
// 4. РАЗДЕЛЬНАЯ ЛОГИКА: ПОЛНЫЙ ЭКРАН ДЛЯ АСАН И МОДАЛьное ДЛЯ РЕЦЕПТОВ
// ==========================================================================
const catalogSection = document.getElementById('cardsGrid'); 
const articleSection = document.getElementById('articleSection'); 
const fullArticleBody = document.getElementById('fullArticleBody'); 

// --- ЛОГИКА 4.1: Открытие асаны на полный экран ---
function showArticlePage(templateId) {
    const cleanId = templateId.replace('#', '');
    const template = document.getElementById(cleanId);
    
    if (template && catalogSection && articleSection && fullArticleBody) {
        fullArticleBody.innerHTML = '';
        fullArticleBody.appendChild(template.content.cloneNode(true));
        
        // Полностью скрываем каталог и показываем экран статьи
        catalogSection.style.display = 'none';
        articleSection.style.display = 'block';
        
        // Скроллим страницу плавно наверх
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        console.warn(`Контент с id="${cleanId}" не найден в HTML-шаблонах.`);
    }
}

// Функция возврата обратно к каталогу асан
function showCatalogPage() {
    if (catalogSection && articleSection) {
        articleSection.style.display = 'none';
        catalogSection.style.display = '';
        
        // Очищаем хэш в строке браузера для красоты
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}

// --- ЛОГИКА 4.2: Открытие рецепта в модальном окне ---
function openRecipeModal(templateId) {
    const cleanId = templateId.replace('#', '');
    const template = document.getElementById(cleanId);
    
    const recipeModal = document.getElementById('recipeModal');
    const recipeModalBody = document.getElementById('recipeModalBody');
    
    if (template && recipeModal && recipeModalBody) {
        recipeModalBody.innerHTML = '';
        recipeModalBody.appendChild(template.content.cloneNode(true));
        
        // Показываем модальное окно рецептов
        recipeModal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden'; // Блокируем скролл сайта
    } else {
        console.warn(`Ошибка: Не найден шаблон "${cleanId}" или элементы рецепта в HTML.`);
    }
}
// --- ЛОГИКА 4.3: Навешиваем клики на ссылки каталога, рецептов и кнопку Назад ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. ОТКРЫТИЕ СТАТЬИ ИЗ КАТАЛОГА АСАН
    // Ищем клики по ссылкам "Читать статью" внутри всего каталога
    const catalogGrid = document.getElementById('cardsGrid');
    if (catalogGrid) {
        catalogGrid.addEventListener('click', (e) => {
            const link = e.target.closest('.card-link');
            if (link) {
                const targetId = link.getAttribute('href');
                
                // Если ссылка ведет на статью асаны, запускаем вашу функцию showArticlePage
                if (targetId && targetId.startsWith('#article-')) {
                    e.preventDefault(); // Отменяем стандартный скачок страницы
                    showArticlePage(targetId);
                }
            }
        });
    }

    // 2. КНОПКА НАЗАД (Возврат к каталогу)
    // Находим вашу кнопку по её ID и вешаем на неё вызов вашей функции showCatalogPage
    const backBtn = document.getElementById('backToCatalogBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showCatalogPage();
        });
    }

    // 3. ОТКРЫТИЕ РЕЦЕПТА В МОДАЛЬНОМ ОКНЕ
    // Ищем клики по ссылкам "Посмотреть рецепт" внутри карусели рецептов
    const recipesTrack = document.getElementById('recipesTrack');
    if (recipesTrack) {
        recipesTrack.addEventListener('click', (e) => {
            const link = e.target.closest('.card-link');
            if (link) {
                const targetId = link.getAttribute('href');
                
                // Если ссылка ведет на рецепт, запускаем вашу функцию openRecipeModal
                if (targetId && targetId.startsWith('#recipe-')) {
                    e.preventDefault();
                    openRecipeModal(targetId);
                }
            }
        });
    }
});
// 3. АДАПТИВНАЯ КАРУСЕЛЬ РЕЦЕПТОВ (БЕЗ БАГА С ПЕРЕПРЫГИВАНИЕМ)
// ==========================================================================
const track = document.getElementById('recipesTrack');
const prevBtn = document.getElementById('prevRecipe');
const nextBtn = document.getElementById('nextRecipe');

if (track && prevBtn && nextBtn) {
    const container = track.parentElement;
    
    // Включаем плавную нативную прокрутку в контейнере
    container.style.scrollBehavior = 'smooth';
    container.style.overflowX = 'hidden';

    // Текущий индекс первой видимой карточки
    let currentIndex = 0;

    // Вычисление шага прокрутки с учетом зазора из CSS
    const getScrollStep = () => {
        const card = track.querySelector('.recipe-card');
        if (!card) return 0;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 20; 
        return card.getBoundingClientRect().width + gap;
    };

    // Общая функция прокрутки по индексам карточек
    const scrollToCard = (index) => {
        const cards = track.querySelectorAll('.recipe-card');
        if (cards.length === 0) return;

        // Обще количество карточек
        const totalCards = cards.length;
        
        // Перемотка по кругу (зацикливание)
        if (index >= totalCards) {
            currentIndex = 0; // Возврат в начало
        } else if (index < 0) {
            currentIndex = totalCards - 1; // Переход в самый конец (к последней карточке)
        } else {
            currentIndex = index;
        }

        const step = getScrollStep();
        const targetScroll = currentIndex * step;

        container.scrollTo({ left: targetScroll });
    };

    // Кнопки навигации (меняем индекс на +1 или -1)
    nextBtn.addEventListener('click', () => scrollToCard(currentIndex + 1));
    prevBtn.addEventListener('click', () => scrollToCard(currentIndex - 1));

    // Синхронизация индекса при ручном скролле, свайпах или изменении экрана
    let resizeTimeout;
    const syncCurrentIndex = () => {
        const step = getScrollStep();
        if (step > 0) {
            // Округляем, чтобы узнать, какая карточка сейчас ближе всего к левому краю
            currentIndex = Math.round(container.scrollLeft / step);
        }
    };

    // Слушаем окончание прокрутки, чтобы обновить индекс
    container.addEventListener('scroll', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(syncCurrentIndex, 100);
    }, { passive: true });

    window.addEventListener('resize', () => {
        currentIndex = 0;
        container.scrollTo({ left: 0 });
    });

    // --- ПОДДЕРЖКА СВАЙПОВ ДЛЯ ТЕЛЕФОНОВ ---
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches.screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches.screenX;
        const swipeDistance = touchStartX - touchEndX;

        // Если свайпнули более чем на 50px
        if (Math.abs(swipeDistance) > 50) {
            if (swipeDistance > 0) {
                scrollToCard(currentIndex + 1); // Свайп влево -> вперед
            } else {
                scrollToCard(currentIndex - 1); // Свайп вправо -> назад
            }
        }
    }, { passive: true });

    // --- ПОДДЕРЖКА КОЛЕСИКА МЫШИ ---
    container.addEventListener('wheel', (e) => {
        if (e.deltaX !== 0) return; // Игнорируем горизонтальный скролл мыши
        e.preventDefault();
        
        if (e.deltaY > 0) {
            scrollToCard(currentIndex + 1);
        } else {
            scrollToCard(currentIndex - 1);
        }
    }, { passive: false });
}

// ==========================================================================
// 2. ЛОГИКА ФИЛЬТРАЦИИ КАТАЛОГА АСАН И ЖИВОЙ ПОИСК
// ==========================================================================
const tagButtons = document.querySelectorAll('.tag-btn');
const cards = document.querySelectorAll('.yoga-card');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
let currentFilter = 'all';

// Функция фильтрации карточек
function filterCards() {
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const titleText = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const descText = card.querySelector('.card-desc')?.textContent.toLowerCase() || '';
        
        const matchesFilter = (currentFilter === 'all' || cardCategory === currentFilter);
        const matchesSearch = searchText === '' || (titleText.includes(searchText) || descText.includes(searchText));
        
        // Используем пустую строку '', чтобы возвращать исходные грид/флекс стили из CSS
        card.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
}

// Переключение кнопок-тегов
tagButtons.forEach(button => {
    button.addEventListener('click', () => {
        tagButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        filterCards();
    });
});

// Безопасное навешивание обработчиков событий поиска
if (searchInput) searchInput.addEventListener('input', filterCards);
if (searchBtn) searchBtn.addEventListener('click', filterCards);

// ==========================================================================
// 5. ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ КЛИКОВ ПОСЛЕ ЗАГРУЗКИ СТРАНИЦЫ
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const backToCatalogBtn = document.getElementById('backToCatalogBtn'); 
    const recipeModal = document.getElementById('recipeModal');
    const closeRecipeModal = document.getElementById('closeRecipeModal');
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.getElementById('closeBookingModal');

    // 1. Единый обработчик для всех ссылок с классом card-link
    document.querySelectorAll('.card-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href'); // Получаем хэш (например, #recipe-smoothie или #article-eka)
            
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                e.stopPropagation();

                // Автоматически распределяем по типу ID
                if (targetId.startsWith('#recipe-')) {
                    openRecipeModal(targetId); // Если ведет на рецепт — открываем модалку
                } else {
                    showArticlePage(targetId); // Во всех остальных случаях (асаны) — во весь экран
                }
            }
        });
    });

    // 2. Кнопка «Назад» на полном экране статьи
    if (backToCatalogBtn) {
        backToCatalogBtn.addEventListener('click', showCatalogPage);
    }

    // 3. Крестик закрытия модалки рецептов
    if (closeRecipeModal) {
        closeRecipeModal.addEventListener('click', () => {
            if (recipeModal) {
                recipeModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // 4. Открытие формы записи (навешиваем на ваши CTA кнопки)
    document.querySelectorAll('.hero-cta, .header-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (bookingModal) {
                bookingModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 5. Крестик закрытия формы записи
    if (closeBookingModal) {
        closeBookingModal.addEventListener('click', () => {
            if (bookingModal) {
                bookingModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    // 6. Глобальный клик по серому фону для закрытия модалок (Запись и Рецепты)
    window.addEventListener('click', (e) => {
        if (recipeModal && e.target === recipeModal) {
            recipeModal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (bookingModal && e.target === bookingModal) {
            bookingModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});

// 7. Логика обработки и отправки формы записи
window.handleBookingSubmit = function(event) {
    event.preventDefault(); 
    
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const type = document.getElementById('yogaType').value;
    const bookingModal = document.getElementById('bookingModal');
    
    alert(`Спасибо, ${name}! Ваша заявка на "${type}" успешно принята. Наш администратор свяжется с вами по телефону ${phone} для подтверждения.`);
    
    document.getElementById('bookingForm').reset();
    if (bookingModal) {
        bookingModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}
const openBtn = document.getElementById('openLoginBtn');
const closeBtn = document.getElementById('closeLoginBtn');
const modal = document.getElementById('loginModal');
const form = document.getElementById('loginForm');

// Открыть окно
openBtn.addEventListener('click', () => {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
});

// Закрыть окно по крестику
closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.style.overflow = '';
});

// Закрыть окно по клику вне формы
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Закрыть окно по клавише Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
});
// 6. АККОРДЕОН ДЛЯ FAQ (ГОРЯЧИЕ ВОПРОСЫ)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const currentItem = question.parentElement;
            const currentAnswer = currentItem.querySelector('.faq-answer');
            const isActive = currentItem.classList.contains('active');

            // 1. Закрываем все остальные открытые вкладки (эффект аккордеона)
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== currentItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                }
            });

            // 2. Переключаем состояние текущей вкладки
            if (isActive) {
                currentItem.classList.remove('active');
                currentAnswer.style.maxHeight = null;
            } else {
                currentItem.classList.add('active');
                // Динамически рассчитываем высоту контента для анимации max-height
                currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
            }
        });
    });
});
const scrollTopBtn = document.querySelector('.scroll-to-top-btn');

// ПРИНУДИТЕЛЬНО ПРЯЧЕМ ЕЁ НА СТАРТЕ (добавляем эту строчку):
if (scrollTopBtn) scrollTopBtn.style.opacity = '0';

// Следим за скроллом страницы
window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollTopBtn.classList.add('show');
        scrollTopBtn.style.opacity = '1'; // Показываем при скролле
    } else {
        scrollTopBtn.classList.remove('show');
        scrollTopBtn.style.opacity = '0'; // Прячем в самом верху
    }
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Отменяет мгновенный резкий прыжок браузера
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth', // Включает красивую плавную прокрутку
                block: 'start'
            });
        }
    });
});




/**
 * WDSL (풍수해시스템연구실) 메인 스크립트
 * - JSON 데이터 동적 로드 및 바인딩
 * - 모바일 네비게이션 제어
 * - 스크롤 인터랙션 및 네비게이션 활성화 동기화
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. 초기화 및 이벤트 리스너 등록
    initNavigation();
    loadAllData();
    initVisitorCounter();
});

/**
 * 네비게이션 관련 스크롤 및 모바일 드로어 이벤트 처리
 */
function initNavigation() {
    const header = document.getElementById('global-header');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileClose = document.getElementById('mobile-menu-close');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const desktopLinks = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');

    // 1) 스크롤에 따른 헤더 슬림화 (scrolled 클래스 토글)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // 2) 스크롤 위치에 따라 활성화된 섹션 표시
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        desktopLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // 3) 모바일 메뉴 열기/닫기
    const openDrawer = () => {
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    };

    const closeDrawer = () => {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    mobileToggle.addEventListener('click', openDrawer);
    mobileClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // 모바일 드로어 내부 링크 클릭 시 자동 닫힘
    const mobileLinks = document.querySelectorAll('.mobile-nav-item, .mobile-dropdown-subitem');
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // 서브메뉴가 있는 메인 아이템을 모바일에서 클릭했을 때 토글 동작 지원
            const parentDropdown = link.closest('.mobile-nav-item-dropdown');
            if (parentDropdown && link.classList.contains('mobile-nav-item')) {
                // 서브메뉴가 접혀있을 땐 토글 처리
                if (!parentDropdown.classList.contains('active')) {
                    document.querySelectorAll('.mobile-nav-item-dropdown').forEach(d => d.classList.remove('active'));
                    parentDropdown.classList.add('active');
                }
            }
            closeDrawer();
        });
    });
}

/**
 * 모든 JSON 데이터 로드
 */
async function loadAllData() {
    try {
        await Promise.all([
            loadMembers(),
            loadPublications(),
            loadNews(),
            loadTeaching()
        ]);
        // 동적 렌더링 후 생성된 Lucide 아이콘 활성화
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
    }
}

/**
 * 구성원 데이터 로드 및 렌더링
 */
async function loadMembers() {
    const professorContainer = document.getElementById('professor-container');
    const studentContainer = document.getElementById('student-container');
    const alumniContainer = document.getElementById('alumni-container');

    try {
        const response = await fetch('data/members.json?v=' + Date.now());
        const members = await response.json();

        let profHtml = '';
        let studentHtml = '';
        let alumniHtml = '';

        members.forEach(member => {
            if (member.role === 'professor') {
                const profileImg = member.image || 'images/logo.png';
                
                // 학력 정보 리스트 HTML 구성
                let educationHtml = '';
                if (member.educations && member.educations.length > 0) {
                    const educationItems = member.educations.map(edu => `<li style="margin-bottom: 6px;">- ${edu}</li>`).join('');
                    educationHtml = `
                        <div class="professor-education" style="margin-bottom: 28px;">
                            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); border-left: 3px solid var(--primary); padding-left: 10px;">학력</h4>
                            <ul class="education-list" style="padding-left: 8px; color: var(--text-primary); font-size: 1.05rem; line-height: 1.8; list-style: none;">
                                ${educationItems}
                            </ul>
                        </div>
                    `;
                }

                // 경력 정보 리스트 HTML 구성
                let careerHtml = '';
                if (member.careers && member.careers.length > 0) {
                    const careerItems = member.careers.map(career => `<li style="margin-bottom: 6px;">- ${career}</li>`).join('');
                    careerHtml = `
                        <div class="professor-career" style="margin-bottom: 28px;">
                            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); border-left: 3px solid var(--primary); padding-left: 10px;">주요 경력</h4>
                            <ul class="career-list" style="padding-left: 8px; color: var(--text-primary); font-size: 1.05rem; line-height: 1.8; list-style: none;">
                                ${careerItems}
                            </ul>
                        </div>
                    `;
                }

                // 수상 정보 리스트 HTML 구성
                let awardHtml = '';
                if (member.awards && member.awards.length > 0) {
                    const awardItems = member.awards.map(award => `<li style="margin-bottom: 6px;">- ${award}</li>`).join('');
                    awardHtml = `
                        <div class="professor-award" style="margin-bottom: 28px;">
                            <h4 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; margin-bottom: 12px; color: var(--text-primary); border-left: 3px solid var(--primary); padding-left: 10px;">수상</h4>
                            <ul class="award-list" style="padding-left: 8px; color: var(--text-primary); font-size: 1.05rem; line-height: 1.8; list-style: none;">
                                ${awardItems}
                            </ul>
                        </div>
                    `;
                }

                const profPositionHtml = member.positionKo ? `<span class="position">${member.positionKo}</span>` : '';
                const profEmailHtml = member.email ? `<div class="meta-item"><i data-lucide="mail"></i><span>${member.email}</span></div>` : '';
                const profOfficeHtml = member.office ? `<div class="meta-item"><i data-lucide="building"></i><span>${member.office}</span></div>` : '';
                const profMetaHtml = (profEmailHtml || profOfficeHtml) ? `<div class="professor-meta" style="margin-bottom: 24px;">${profEmailHtml}${profOfficeHtml}</div>` : '';
                const profEngNameHtml = member.nameEn ? `<span class="eng-name">${member.nameEn}</span>` : '';

                profHtml = `
                    <div class="professor-card glass" id="member-prof-${member.id}">
                        <div class="professor-info">
                            <div class="professor-name-group">
                                <h3>${member.nameKo || ''}</h3>
                                ${profEngNameHtml}
                            </div>
                            ${profPositionHtml}
                            ${profMetaHtml}
                            ${educationHtml}
                            ${careerHtml}
                            ${awardHtml}
                        </div>
                    </div>
                `;
            } else if (member.role === 'alumni') {
                const certText = member['자격'] ? ` (${member['자격']})` : '';
                const alumniCompany = member.company ? `
                    <div class="company">
                        <i data-lucide="briefcase" style="width: 16px; height: 16px;"></i>
                        <span>${member.company}${certText}</span>
                    </div>
                ` : '<div class="company"></div>';

                alumniHtml += `
                    <div class="alumni-card glass" id="member-alumni-${member.id}">
                        <h4>${member.nameKo || ''}</h4>
                        ${alumniCompany}
                    </div>
                `;
            } else {
                const researchInterests = member.researchInterests || [];
                const tags = researchInterests.map(interest => `<span class="tag">${interest}</span>`).join('');
                const profileImg = member.image || 'images/logo.png';
                
                const companyHtml = member.company ? `
                    <div class="company">
                        <i data-lucide="briefcase" style="width: 14px; height: 14px;"></i>
                        <span>${member.company}</span>
                    </div>
                ` : '<div class="company"></div>';

                const emailHtml = member.email ? `
                    <div class="email">${member.email}</div>
                ` : '<div class="email"></div>';

                const studentEngNameHtml = member.nameEn ? `<div class="eng-name">${member.nameEn}</div>` : '';
                const studentPositionHtml = member.positionKo ? `<div class="position">${member.positionKo}</div>` : '';

                studentHtml += `
                    <div class="member-card glass" id="member-student-${member.id}">
                        <h4>${member.nameKo || ''}</h4>
                        ${studentEngNameHtml}
                        ${studentPositionHtml}
                        ${emailHtml}
                    </div>
                `;
            }
        });

        professorContainer.innerHTML = profHtml || '<p>교수 정보가 없습니다.</p>';
        studentContainer.innerHTML = studentHtml || '<p>연구원 정보가 없습니다.</p>';
        alumniContainer.innerHTML = alumniHtml || '<p>졸업생 정보가 없습니다.</p>';

    } catch (error) {
        professorContainer.innerHTML = '<p class="error-msg">멤버 데이터를 가져오는 데 실패했습니다.</p>';
        studentContainer.innerHTML = '<p class="error-msg">멤버 데이터를 가져오는 데 실패했습니다.</p>';
        alumniContainer.innerHTML = '<p class="error-msg">멤버 데이터를 가져오는 데 실패했습니다.</p>';
        throw error;
    }
}

/**
 * 연구 실적 데이터 로드 및 렌더링 (저역서, 국제학술지, 국내학술지 카테고리별 분리)
 */
async function loadPublications() {
    const booksContainer = document.getElementById('pub-books-container');
    const intJournalContainer = document.getElementById('pub-int-container');
    const domJournalContainer = document.getElementById('pub-dom-container');
    const projectListContainer = document.getElementById('project-list-container');

    try {
        // 논문 데이터와 프로젝트 데이터를 함께 로드
        const [pubResponse, projResponse] = await Promise.all([
            fetch('data/publications.json?v=' + Date.now()),
            fetch('data/projects.json?v=' + Date.now())
        ]);
        
        const publications = await pubResponse.json();
        const projects = await projResponse.json();

        // 1. 카테고리별 분리 렌더링
        renderPublicationGroup(publications, 'book', booksContainer);
        renderPublicationGroup(publications, 'int-journal', intJournalContainer);
        renderPublicationGroup(publications, 'dom-journal', domJournalContainer);

        // 2. 프로젝트 목록 렌더링
        renderProjectList(projects, projectListContainer);

    } catch (error) {
        if (booksContainer) booksContainer.innerHTML = '<p class="error-msg">실적 데이터를 가져오는 데 실패했습니다.</p>';
        if (intJournalContainer) intJournalContainer.innerHTML = '<p class="error-msg">실적 데이터를 가져오는 데 실패했습니다.</p>';
        if (domJournalContainer) domJournalContainer.innerHTML = '<p class="error-msg">실적 데이터를 가져오는 데 실패했습니다.</p>';
        if (projectListContainer) projectListContainer.innerHTML = '<p class="error-msg">프로젝트 데이터를 가져오는 데 실패했습니다.</p>';
        throw error;
    }
}

function renderPublicationGroup(publications, type, container) {
    if (!container) return;
    
    const items = publications.filter(pub => pub.type === type);
    const sortedItems = [...items].sort((a, b) => (b.year - a.year) || (a.id - b.id));

    if (sortedItems.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 연구 성과가 없습니다.</p>';
        return;
    }

    const titleHeader = type === 'book' ? '출판명' : '제목 및 저자';
    const publisherHeader = type === 'book' ? '출판사' : '학술지명';

    const rows = sortedItems.map((pub, idx) => {
        let linkHtml = '';
        if (pub.doi) {
            linkHtml = `
                <a href="${pub.doi}" target="_blank" class="pub-link" style="margin-left: 8px; display: inline-flex; align-items: center;">
                    <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
                </a>
            `;
        }

        const journalOrPublisher = pub.journal || pub.publisher || '';
        const authorsHtml = (type !== 'book' && pub.authors) ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${pub.authors}</div>` : '';

        return `
            <tr>
                <td style="text-align: center; font-weight: 600; color: var(--text-muted);">${idx + 1}</td>
                <td class="project-title">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.98rem; line-height: 1.5;">${pub.title}${linkHtml}</div>
                    ${authorsHtml}
                </td>
                <td style="font-size: 0.9rem; color: var(--text-secondary);">${journalOrPublisher}</td>
                <td style="text-align: center; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);">${pub.year}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="project-table-container" style="margin-top: 16px;">
            <table class="project-table">
                <thead>
                    <tr>
                        <th style="width: 60px; text-align: center;">No.</th>
                        <th>${titleHeader}</th>
                        <th style="width: 220px;">${publisherHeader}</th>
                        <th style="width: 100px; text-align: center;">연도</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function renderProjectList(projects, container) {
    if (!container) return;
    container.innerHTML = generateProjectTableHtml(projects);
    
    // 동적 생성된 아이콘 렌더링
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/**
 * 연구 과제 리스트를 HTML 표(Table) 구조로 생성
 */
function generateProjectTableHtml(projects) {
    if (!projects || projects.length === 0) {
        return '<p class="no-data">진행 중이거나 완료된 연구 과제가 없습니다.</p>';
    }

    const rows = projects.map(proj => {
        const contentHtml = proj.content ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${proj.content}</div>
        ` : '';

        return `
            <tr>
                <td>${proj.id}</td>
                <td class="project-title">
                    ${proj.title}
                    ${contentHtml}
                </td>
                <td>${proj.period}</td>
                <td>${proj.agency}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="project-table-container">
            <table class="project-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">No.</th>
                        <th>연구과제명</th>
                        <th style="width: 180px;">연구기간</th>
                        <th style="width: 180px;">지원기관</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * 소식 및 공지사항 데이터 로드 및 렌더링
 */
async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;

    try {
        const response = await fetch('data/news.json?v=' + Date.now());
        const newsList = await response.json();

        if (newsList.length === 0) {
            newsContainer.innerHTML = '<p class="no-data">등록된 소식이 없습니다.</p>';
            return;
        }

        // 최신 소식순(Date 내림차순) 정렬
        const sortedNews = [...newsList].sort((a, b) => new Date(b.date) - new Date(a.date));

        const html = sortedNews.map(news => {
            const catClass = news.category.toLowerCase() === 'notice' ? 'notice' : 'achievement';
            const catText = news.category === 'Notice' ? '공지사항' : '연구성과';

            return `
                <div class="news-card glass" id="news-${news.id}">
                    <div class="news-meta">
                        <span class="news-category ${catClass}">${catText}</span>
                        <span class="news-date">${news.date}</span>
                    </div>
                    <h4>${news.title}</h4>
                    <p>${news.content}</p>
                </div>
            `;
        }).join('');

        newsContainer.innerHTML = html;

    } catch (error) {
        newsContainer.innerHTML = '<p class="error-msg">소식 데이터를 가져오는 데 실패했습니다.</p>';
        throw error;
    }
}

/**
 * 강의 정보 데이터 로드 및 렌더링 (학부 및 대학원 중제목 분리)
 */
async function loadTeaching() {
    const undergradContainer = document.getElementById('teaching-undergrad-container');
    const gradContainer = document.getElementById('teaching-grad-container');

    if (!undergradContainer && !gradContainer) return;

    try {
        const response = await fetch('data/teaching.json?v=' + Date.now());
        const teachingList = await response.json();

        const undergradData = teachingList.find(item => item.category.includes('Undergraduate'));
        const gradData = teachingList.find(item => item.category.includes('Graduate'));

        renderTeachingItems(undergradData ? undergradData.courses : [], undergradContainer);
        renderTeachingItems(gradData ? gradData.courses : [], gradContainer);

    } catch (error) {
        if (undergradContainer) undergradContainer.innerHTML = '<p class="error-msg">강의 데이터를 가져오는 데 실패했습니다.</p>';
        if (gradContainer) gradContainer.innerHTML = '<p class="error-msg">강의 데이터를 가져오는 데 실패했습니다.</p>';
    }
}

function renderTeachingItems(courses, container) {
    if (!container) return;
    if (!courses || courses.length === 0) {
        container.innerHTML = '<p class="no-data">등록된 강의 정보가 없습니다.</p>';
        return;
    }

    container.innerHTML = `
        <div class="teaching-list">
            ${courses.map(course => {
                const parts = course.split(',');
                const eng = parts[0] ? parts[0].trim() : course;
                const kor = parts[1] ? parts[1].trim() : '';
                return `
                    <div class="teaching-card glass">
                        <div class="teaching-title-eng">${eng}</div>
                        ${kor ? `<div class="teaching-title-kor">${kor}</div>` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * 전 세계 모든 방문자 실시간 통합 집계 카운터 (CounterAPI 연동)
 */
async function initVisitorCounter() {
    const todayElem = document.getElementById('today-count');
    if (!todayElem) return;

    // 오늘 날짜 고유 키 구하기 (YYYYMMDD)
    const now = new Date();
    const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const namespace = 'sku_wdsl_lab_official';
    const key = `today_visit_${todayStr}`;

    // 세션당 1회만 카운트 증가 (중복 새로고침 무한 증가 방지)
    const hasVisitedSession = sessionStorage.getItem('wdsl_global_visited_session');
    const action = hasVisitedSession ? 'get' : 'up';

    try {
        // 글로벌 실시간 통합 카운터 API 호출
        const apiUrl = `https://api.counterapi.dev/v1/${namespace}/${key}/${action}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && typeof data.count === 'number') {
            if (!hasVisitedSession) {
                sessionStorage.setItem('wdsl_global_visited_session', 'true');
            }
            animateCount(todayElem, data.count);
            localStorage.setItem('wdsl_today_cached_count', data.count);
            return;
        }
    } catch (err) {
        console.warn('통합 카운터 API 연동 대기/백업 모드 전환:', err);
    }

    // 네트워크 예외 시 폴백(Fallback) 안전 카운터 작동
    let todayVisits = parseInt(localStorage.getItem('wdsl_today_cached_count') || '1', 10);
    if (!hasVisitedSession) {
        todayVisits += 1;
        localStorage.setItem('wdsl_today_cached_count', todayVisits);
        sessionStorage.setItem('wdsl_global_visited_session', 'true');
    }
    animateCount(todayElem, todayVisits);
}

function animateCount(elem, target) {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeProgress * target);
        
        elem.textContent = currentCount.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            elem.textContent = target.toLocaleString();
        }
    }

    requestAnimationFrame(update);
}

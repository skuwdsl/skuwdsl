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
    const mobileLinks = document.querySelectorAll('.mobile-nav-item');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
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
            loadNews()
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
        const response = await fetch('data/members.json');
        const members = await response.json();

        let profHtml = '';
        let studentHtml = '';
        let alumniHtml = '';

        members.forEach(member => {
            if (member.role === 'professor') {
                const profileImg = member.image || 'images/logo.png';
                
                // 경력 정보 리스트 HTML 구성
                let careerHtml = '';
                if (member.careers && member.careers.length > 0) {
                    const careerItems = member.careers.map(career => `<li>- ${career}</li>`).join('');
                    careerHtml = `
                        <div class="professor-career" style="margin-bottom: 24px;">
                            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; margin-bottom: 8px;">주요 경력</h4>
                            <ul class="career-list" style="padding-left: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; list-style: none;">
                                ${careerItems}
                            </ul>
                        </div>
                    `;
                }

                profHtml = `
                    <div class="professor-card glass" id="member-prof-${member.id}">
                        <img src="${profileImg}" alt="${member.nameKo}" class="professor-image" onerror="this.src='images/default_avatar.png'">
                        <div class="professor-info">
                            <h3>${member.nameKo}</h3>
                            <div class="eng-name">${member.nameEn}</div>
                            <span class="position">${member.positionKo}</span>
                            <div class="professor-meta">
                                <div class="meta-item">
                                    <i data-lucide="mail"></i>
                                    <span>${member.email}</span>
                                </div>
                                <div class="meta-item">
                                    <i data-lucide="building"></i>
                                    <span>${member.office}</span>
                                </div>
                            </div>
                            ${careerHtml}
                        </div>
                    </div>
                `;
            } else if (member.role === 'alumni') {
                // 졸업생 정보는 사진/관심분야 없이 간략하게 텍스트 위주로 렌더링
                alumniHtml += `
                    <div class="alumni-card glass" id="member-alumni-${member.id}">
                        <h4>${member.nameKo}</h4>
                        <div class="eng-name">${member.nameEn}</div>
                        <div class="position">${member.positionKo}</div>
                        <div class="company">
                            <i data-lucide="briefcase" style="width: 16px; height: 16px;"></i>
                            <span>${member.company}</span>
                        </div>
                    </div>
                `;
            } else {
                const researchInterests = member.researchInterests || [];
                const tags = researchInterests.map(interest => `<span class="tag">${interest}</span>`).join('');
                const profileImg = member.image || 'images/logo.png';
                
                let companyHtml = '';
                if (member.company) {
                    companyHtml = `
                        <div class="company">
                            <i data-lucide="briefcase" style="width: 14px; height: 14px;"></i>
                            <span>${member.company}</span>
                        </div>
                    `;
                }

                studentHtml += `
                    <div class="member-card glass" id="member-student-${member.id}">
                        <img src="${profileImg}" alt="${member.nameKo}" class="member-avatar" onerror="this.src='images/default_avatar.png'">
                        <h4>${member.nameKo}</h4>
                        <div class="eng-name">${member.nameEn}</div>
                        <div class="position">${member.positionKo}</div>
                        ${companyHtml}
                        <div class="email">${member.email}</div>
                        <!-- <div class="interests">
                            ${tags}
                        </div> -->
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
 * 연구 실적 데이터 로드 및 렌더링 (필터 기능 포함)
 */
let allPublications = []; // 필터링을 위해 전역 변수로 관리
let allProjects = []; // 프로젝트 필터링을 위해 전역 변수로 관리

async function loadPublications() {
    const pubListContainer = document.getElementById('pub-list-container');
    const filterButtons = document.querySelectorAll('.filter-btn');

    try {
        // 논문 데이터와 프로젝트 데이터를 함께 로드
        const [pubResponse, projResponse] = await Promise.all([
            fetch('data/publications.json'),
            fetch('data/projects.json')
        ]);
        
        allPublications = await pubResponse.json();
        allProjects = await projResponse.json();

        // 초기 로드 시 전체 데이터 렌더링
        renderPublications('all');

        // 필터 버튼 클릭 이벤트 바인딩
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filterValue = e.target.getAttribute('data-filter');
                renderPublications(filterValue);
            });
        });

        // 드롭다운 하위 메뉴 아이템 클릭 이벤트 바인딩
        const dropdownItems = [
            { id: 'dropdown-pub-all', filter: 'all' },
            { id: 'dropdown-pub-publications', filter: 'publications' },
            { id: 'dropdown-pub-project', filter: 'project' }
        ];

        dropdownItems.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.addEventListener('click', () => {
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-filter') === item.filter) {
                            btn.classList.add('active');
                        }
                    });
                    renderPublications(item.filter);
                });
            }
        });

    } catch (error) {
        pubListContainer.innerHTML = '<p class="error-msg">실적 및 프로젝트 데이터를 가져오는 데 실패했습니다.</p>';
        throw error;
    }
}

function renderPublications(filter) {
    const pubListContainer = document.getElementById('pub-list-container');
    
    // 1. 프로젝트 필터인 경우 테이블 형식으로 렌더링
    if (filter === 'project') {
        pubListContainer.innerHTML = generateProjectTableHtml(allProjects);
        if (window.lucide) {
            window.lucide.createIcons();
        }
        return;
    }

    // 2. 논문 실적 정렬 및 필터링
    const sortedPubs = [...allPublications].sort((a, b) => a.id - b.id);
    const filteredPubs = (filter === 'all' || filter === 'publications')
        ? sortedPubs 
        : sortedPubs.filter(pub => pub.type === filter);

    let pubHtml = '';
    if (filteredPubs.length === 0) {
        pubHtml = '<p class="no-data">해당 카테고리의 연구 성과가 없습니다.</p>';
    } else {
        pubHtml = filteredPubs.map(pub => {
            let badgeClass = 'conference';
            let badgeText = 'Conference';
            if (pub.type === 'journal') {
                badgeClass = 'journal';
                badgeText = 'Journal';
            } else if (pub.type === 'book') {
                badgeClass = 'book';
                badgeText = 'Book';
            }
            
            let linkHtml = '';
            if (pub.doi) {
                linkHtml = `
                    <a href="${pub.doi}" target="_blank" class="pub-link">
                        Publisher Site <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
                    </a>
                `;
            }

            const journalOrPublisher = pub.journal || pub.publisher || '';

            return `
                <div class="pub-item glass" id="pub-${pub.id}">
                    <span class="pub-badge ${badgeClass}">${badgeText} (${pub.year})</span>
                    <div class="pub-details">
                        <h4 class="pub-title">${pub.title}</h4>
                        <div class="pub-authors">${pub.authors}</div>
                        <div class="pub-journal">${journalOrPublisher}</div>
                        ${linkHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    // 3. '전체(All)' 필터일 경우 하단에 프로젝트 테이블 및 상단에 Publications 타이틀도 함께 렌더링
    if (filter === 'all') {
        const publicationsHeaderHtml = `<h3 class="group-title" style="margin-top: 0; margin-bottom: 24px;">Publications</h3>`;
        const projectSectionHtml = `
            <h3 class="group-title" style="margin-top: 60px; margin-bottom: 24px;">Research Projects</h3>
            ${generateProjectTableHtml(allProjects)}
        `;
        pubListContainer.innerHTML = publicationsHeaderHtml + pubHtml + projectSectionHtml;
    } else {
        pubListContainer.innerHTML = pubHtml;
    }
    
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
        const roleClass = proj.role === '연구책임' ? 'lead' : 'member';
        return `
            <tr>
                <td>${proj.id}</td>
                <td class="project-title">
                    ${proj.title}
                    <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">${proj.content}</div>
                </td>
                <td>${proj.period}</td>
                <td>${proj.agency}</td>
                <td><span class="project-role-badge ${roleClass}">${proj.role}</span></td>
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
                        <th style="width: 120px;">역할</th>
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
        const response = await fetch('data/news.json');
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

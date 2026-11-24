import { createEl } from '../shared/dom.ts';

interface Stat {
  value: string;
  label: string;
}

interface Member {
  initials: string;
  name: string;
  role: string;
  contributions: string[];
  github: string;
}

const STATS: Stat[] = [
  { value: '12', label: 'товаров' },
  { value: '2', label: 'категории' },
  { value: '100%', label: 'для астрономов' },
];

const TEAM: Member[] = [
  {
    initials: 'ИБ',
    name: 'Ирина Б.',
    role: 'Каркас и каталог',
    contributions: ['Роутер', 'Страница «О нас»', 'Дизайн'],
    github: 'https://github.com/irinabukley-f4',
  },
  {
    initials: 'АП',
    name: 'Александра П.',
    role: 'Фильтры и корзина',
    contributions: ['Поиск/фильтры', 'Корзина и промо', 'localStorage'],
    github: 'https://github.com/al-lumiere',
  },
];

export function renderAbout(): HTMLElement {
  return createEl(
    'div',
    { class: 'about' },
    renderHero(),
    renderAboutSection(),
    renderTeamSection(),
  );
}

function renderHero(): HTMLElement {
  const stars = Array.from({ length: 18 }, (_, i) =>
    createEl('span', {
      class: 'hero__star',
      'aria-hidden': 'true',
      'data-i': i,
    }),
  );

  return createEl(
    'section',
    { class: 'hero', 'aria-labelledby': 'hero-title' },
    createEl('div', { class: 'hero__stars', 'aria-hidden': 'true' }, ...stars),
    createEl(
      'div',
      { class: 'hero__inner' },
      createEl('h1', { class: 'hero__title', id: 'hero-title' }, 'Исследуй космос — начни с Земли'),
      createEl(
        'p',
        { class: 'hero__subtitle' },
        'Телескопы, оптика и мерч для тех, кто смотрит вверх',
      ),
      createEl('a', { class: 'btn btn--primary', href: '#/catalog' }, 'Перейти в каталог'),
    ),
  );
}

function renderAboutSection(): HTMLElement {
  return createEl(
    'section',
    { class: 'about-section', 'aria-labelledby': 'about-shop-title' },
    createEl('h2', { class: 'section__title', id: 'about-shop-title' }, 'О магазине'),
    createEl(
      'p',
      { class: 'section__text' },
      '«КосмоМаркет» — небольшой магазин оптики и космического мерча. Мы продаём телескопы, бинокли, окуляры и мелочи для наблюдений — для тех, кто только впервые поднял взгляд к небу, и для тех, кто выезжает за город с большим Dobson.',
    ),
    createEl(
      'p',
      { class: 'section__text' },
      'Мы выбрали только две категории — оптику и мерч — потому что в космосе важнее глубина, чем ширина ассортимента. Всё в каталоге мы сами хотели бы взять с собой на наблюдения.',
    ),
    createEl(
      'ul',
      { class: 'stats' },
      ...STATS.map(({ value, label }) =>
        createEl(
          'li',
          { class: 'stat' },
          createEl('span', { class: 'stat__value' }, value),
          createEl('span', { class: 'stat__label' }, label),
        ),
      ),
    ),
  );
}

function renderTeamSection(): HTMLElement {
  return createEl(
    'section',
    { class: 'about-section', 'aria-labelledby': 'team-title' },
    createEl('h2', { class: 'section__title', id: 'team-title' }, 'Команда'),
    createEl('ul', { class: 'team' }, ...TEAM.map((member) => renderMember(member))),
  );
}

function renderMember(member: Member): HTMLElement {
  return createEl(
    'li',
    { class: 'team__card' },
    createEl('span', { class: 'team__avatar', 'aria-hidden': 'true' }, member.initials),
    createEl('h3', { class: 'team__name' }, member.name),
    createEl('p', { class: 'team__role' }, member.role),
    createEl(
      'ul',
      { class: 'team__list' },
      ...member.contributions.map((item) => createEl('li', { class: 'team__item' }, item)),
    ),
    createEl(
      'a',
      {
        class: 'team__link',
        href: member.github,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      'GitHub',
    ),
  );
}

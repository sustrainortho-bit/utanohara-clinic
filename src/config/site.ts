// クリニックの基本情報・ナビゲーション。現行サイト（2026-09-20時点）の内容を流用している。
// 診療時間や担当医が変わったら、まずこのファイルを更新する（全ページのヘッダー・フッター・構造化データに反映される）。

export const clinic = {
  name: 'うたのはら整形外科クリニック',
  tagline: 'スポーツ＆リハビリテーション',
  shortDescription: '東広島市西条寺家の整形外科・リハビリテーション科・スポーツ整形外科',
  postalCode: '739-0041',
  region: '広島県',
  locality: '東広島市',
  street: '西条町寺家5284-1',
  address: '広島県東広島市西条町寺家5284-1',
  tel: '082-493-8130',
  telRehab: '082-493-8800',
  geo: { latitude: 34.4360036, longitude: 132.7270348 },
  closedDays: '日曜・祝日',
  receptionHours: '午前8:30～12:30、午後14:30～18:30、土曜午後14:00〜17:00',
  clinicHours: '午前9:00～13:00、午後15:00～19:00、土曜午後14:30〜17:30',
  ubieUrl: 'https://ubie.app/medical_institution/introduction?hospital_user_key=288df477-591c-4187-bc90-2e000623ac43',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('うたのはら整形外科クリニック 東広島市西条町寺家5284-1'),
} as const;

export const days = ['月', '火', '水', '木', '金', '土', '日・祝'] as const;

/** 診療時間表（●診療 ▲土曜午後は時間が異なる ×休診） */
export const hoursTable = {
  am: ['●', '●', '●', '●', '●', '●', '×'],
  pm: ['●', '●', '●', '●', '●', '▲', '×'],
} as const;

/** 診療担当表（1セル＝改行区切りの行の配列。現行サイトの表記をそのまま流用） */
export const scheduleTable = {
  am: [
    ['歌野原'],
    ['岡田／歌野原'],
    ['歌野原'],
    ['歌野原'],
    ['岡田', '1・３・5週：黒瀬', '2・4週：歌野原'],
    ['1・３・5週：岡田／歌野原', '2・4週：歌野原'],
  ],
  pm: [
    ['歌野原'],
    ['岡田／歌野原'],
    ['歌野原'],
    ['岡田'],
    ['歌野原／岡田'],
    ['1・３・5週：岡田／（歌野原）', '2・4週：歌野原'],
  ],
} as const;

export const doctors = [
  {
    id: 'utanohara',
    name: '歌野原 慎一',
    kana: 'うたのはら しんいち',
    role: '院長',
    qualifications: [
      '医学博士（平成17年 昭和大学医学部大学院卒業）',
      '日本整形外科学会認定 整形外科専門医',
      '日本整形外科学会認定 運動器リハビリテーション医',
      '日本整形外科学会認定 脊椎脊髄病医',
      '日本体育協会公認 スポーツドクター',
      '昭和大学整形外科 兼任講師',
    ],
  },
  {
    id: 'okada',
    name: '岡田 康平',
    kana: 'おかだ こうへい',
    role: '副院長',
    qualifications: [
      '日本整形外科学会認定 整形外科専門医',
      '日本整形外科学会認定 運動器リハビリテーション認定医',
      '日本整形外科学会認定 スポーツ医',
      '日本骨粗鬆症学会認定医',
    ],
  },
] as const;

export type NavItem = { label: string; href: string; en?: string; children?: NavItem[]; draft?: boolean };

export type Service = {
  label: string;
  navLabel?: string;
  href: string;
  summary: string;
  /** 一覧カード用の写真（img()のキー）。無い場合は写真なしのカードにする */
  image?: string;
  /** 専門外来のラベルを付ける */
  badge?: string;
  /** 担当医の確認前（未監修）。本番ビルドでは出さない */
  draft?: boolean;
};

/** 診療内容の一覧（トップのカード・診療内容ページ・ナビの元データ） */
export const services: Service[] = [
  { label: '整形外科一般', href: '/service/seikeigeka.html', image: 'home/service_img_01.jpg',
    summary: '外傷などの一般整形外科はもちろん、腰痛・肩こり・膝痛などに関する治療にも積極的に取り組んでいます。' },
  { label: 'リハビリテーション科', href: '/service/rehabilitation.html', image: 'home/service_img_02.jpg',
    summary: '専門の知識と経験をもった理学療法士が、運動療法や物理療法を組み合わせ、様々なご要望にあわせたリハビリを行います。' },
  { label: 'スポーツ整形外科', href: '/service/sports-seitaigeka.html', image: 'home/service_img_03.jpg',
    summary: 'スポーツや部活動で負った怪我の治療をはじめ、怪我からの早期回復や今後の予防に重点を置いた治療を行います。' },
  { label: '膝の再生療法', navLabel: '膝の再生療法（ACP PRP療法）', href: '/service/acp-prp.html', image: 'home/service_img_06.jpg',
    summary: '変形性膝関節症の新たな治療選択肢としてACP PRP療法をおこなっています。患者様の血液を利用した再生医療で、日帰り・短時間での治療提供が可能です。' },
  { label: '骨粗鬆症治療', href: '/service/kotsusoshosho.html', image: 'home/service_img_04.jpg',
    summary: '骨粗鬆症の予防と治療を行っています。骨粗鬆症の病態と危険性についての説明を行うとともに、検査結果に基づいた専門的なアドバイスをさせていただきます。' },
  { label: '産前・産後のリハビリ', navLabel: '産前・産後のリハビリテーション', href: '/service/course.html', image: 'home/service_img_05.jpg',
    summary: '産前産後に生じる女性の身体的不調に対して、個々の症状に応じたリハビリテーションを行います。女性理学療法士在籍、お子様とご一緒の来院もOKです。' },
  { label: '凍結肩（マニピュレーション）', navLabel: '専門外来：凍結肩（マニピュレーション）', href: '/service/frozen-shoulder.html',
    badge: '専門外来', draft: true,
    summary: '肩の痛みと動きの制限が続く「凍結肩（五十肩）」の専門外来です。病期に合わせた治療と、マニピュレーションについてご案内します。' },
  { label: '乳児股関節検診（二次検診）', navLabel: '専門外来：乳児股関節検診（エコー二次検診）', href: '/service/infant-hip-us.html',
    badge: '専門外来', draft: true,
    summary: '乳児健診で股関節の精査をすすめられたお子さまに、超音波（エコー）検査を用いた二次検診についてご案内します。' },
];

export const serviceMenu: NavItem[] = services.map((s) => ({ label: s.navLabel ?? s.label, href: s.href, draft: s.draft }));

export const mainNav: NavItem[] = [
  {
    label: 'お知らせ・活動報告',
    en: 'Topics',
    href: '/news/',
    children: [
      { label: 'お知らせ', href: '/news/' },
      { label: '休診案内', href: '/news2/' },
      { label: '採用情報', href: '/news3/' },
      { label: 'スタッフ活動報告', href: '/report/' },
    ],
  },
  {
    label: 'クリニックについて',
    en: 'About',
    href: '/about/',
    children: [
      { label: '理念・院長あいさつ', href: '/about/' },
      { label: '医師のご紹介', href: '/doctors/' },
    ],
  },
  { label: '診療内容', en: 'Service', href: '/service/', children: serviceMenu },
  { label: '疾患解説', en: 'Disease', href: '/disease/', draft: false },
  { label: '設備のご紹介', en: 'Equipment', href: '/equipment/' },
  { label: 'アクセス', en: 'Access', href: '/access/' },
];

export const footerNav: NavItem[] = [
  { label: 'TOP', href: '/' },
  { label: 'お知らせ', href: '/news/' },
  { label: '休診案内', href: '/news2/' },
  { label: '採用情報', href: '/news3/' },
  { label: 'スタッフ活動報告', href: '/report/' },
  { label: 'クリニックについて', href: '/about/' },
  { label: '医師のご紹介', href: '/doctors/' },
  ...serviceMenu,
  { label: '疾患解説', href: '/disease/' },
  { label: '設備のご紹介', href: '/equipment/' },
  { label: 'アクセス', href: '/access/' },
  { label: 'プライバシーポリシー', href: '/privacy/' },
  { label: 'サイトポリシー・医療広告に関する事項', href: '/site-policy/' },
];

/** 公開状況のフラグ（内容が揃ったら true にする） */
export const features = {
  /** 疾患解説ページ（一覧・各疾患）を公開してナビに出すか */
  diseases: false,
};

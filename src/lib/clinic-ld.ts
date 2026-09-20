import { clinic } from '../config/site';
import { SITE_NAME, absUrl } from './site';
import { img } from './images';

/** クリニックの構造化データ（JSON-LD: MedicalClinic）。診療時間は現行サイトの表記に合わせる */
export function clinicJsonLd() {
  const logo = img('common/logo.svg');
  const photo = img('home/slider_01.jpg');
  const spec = (days: string[], opens: string, closes: string) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: days,
    opens,
    closes,
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': absUrl('/#clinic'),
    name: SITE_NAME,
    url: absUrl('/'),
    description: `${clinic.locality}の整形外科・リハビリテーション科・スポーツ整形外科。`,
    medicalSpecialty: ['Orthopedic'],
    telephone: `+81-${clinic.tel.replace(/^0/, '')}`,
    image: new URL(photo.src, import.meta.env.SITE).href,
    logo: new URL(logo.src, import.meta.env.SITE).href,
    address: {
      '@type': 'PostalAddress',
      postalCode: clinic.postalCode,
      addressRegion: clinic.region,
      addressLocality: clinic.locality,
      streetAddress: clinic.street,
      addressCountry: 'JP',
    },
    geo: { '@type': 'GeoCoordinates', latitude: clinic.geo.latitude, longitude: clinic.geo.longitude },
    openingHoursSpecification: [
      spec(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], '09:00', '13:00'),
      spec(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '15:00', '19:00'),
      spec(['Saturday'], '14:30', '17:30'),
    ],
    hasMap: clinic.mapUrl,
  };
}

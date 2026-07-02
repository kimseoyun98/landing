const LOGOS = [
  { name: 'Hecto Financial', logo: '💳 Hecto Financial' },
  { name: '키움증권', logo: '📈 키움증권' },
  { name: 'NICE', logo: '🛡️ NICE' },
  { name: 'Alipay+', logo: '🔵 Alipay+' },
  { name: 'Google Pay', logo: '🟢 Google Pay' },
  { name: 'Kakao Pay', logo: '🟡 Kakao Pay' },
  { name: 'Toss', logo: '🔵 Toss' },
  { name: 'Visa', logo: '💳 Visa' },
  { name: 'Mastercard', logo: '💳 Mastercard' },
];

const TRACK_ITEMS = [...LOGOS, ...LOGOS, ...LOGOS];

export function PartnersLogoSection() {
  return (
    <div className="p3-partners-logo-section">
      <div className="p3-partners-logo-section__wrapper">
        <div className="p3-partners-logo-section__track">
          {TRACK_ITEMS.map((item, idx) => (
            <div key={idx} className="p3-partners-logo-section__item">
              <span className="p3-partners-logo-section__logo-text">{item.logo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { ImageResponse } from 'next/og';

export const alt  = 'Montana Data Company — Enterprise Data Protection & Cyber Resilience';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          flexDirection:   'column',
          justifyContent:  'flex-end',
          backgroundColor: '#0A0A0A',
          padding:         '72px 80px',
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {/* Background grid dots */}
        <div
          style={{
            position:        'absolute',
            inset:           0,
            backgroundImage: 'radial-gradient(circle, #ffffff18 1px, transparent 1px)',
            backgroundSize:  '40px 40px',
          }}
        />

        {/* Top-center magenta glow */}
        <div
          style={{
            position:     'absolute',
            top:          '-20%',
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        '70%',
            height:       '60%',
            background:   'radial-gradient(ellipse, #DD297D22 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Bottom-right orange glow */}
        <div
          style={{
            position:     'absolute',
            bottom:       '-10%',
            right:        '-5%',
            width:        '40%',
            height:       '50%',
            background:   'radial-gradient(ellipse, #F86C4918 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Left accent bar */}
        <div
          style={{
            position:     'absolute',
            left:         0,
            top:          0,
            bottom:       0,
            width:        '4px',
            background:   'linear-gradient(180deg, #DD297D 0%, #F24567 50%, #F86C49 100%)',
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          {/* Badge */}
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width:        '8px',
                height:       '8px',
                borderRadius: '50%',
                background:   '#F24567',
                boxShadow:    '0 0 12px #F24567',
              }}
            />
            <span
              style={{
                color:         '#BFBFBF',
                fontSize:      '14px',
                fontWeight:    700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}
            >
              montanadc.com
            </span>
          </div>

          {/* Company name */}
          <div
            style={{
              fontSize:   '58px',
              fontWeight: 800,
              color:      '#FFFFFF',
              lineHeight: 1.05,
              letterSpacing: '-1px',
            }}
          >
            Montana Data Company
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize:   '24px',
              color:      '#BFBFBF',
              fontWeight: 400,
              marginTop:  '4px',
            }}
          >
            Enterprise Data Protection &amp; Cyber Resilience
          </div>

          {/* Pill tags */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            {['Cloud Backup', 'Ransomware Protection', 'POPIA Compliance', 'IBM Partner'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding:      '6px 16px',
                  border:       '1px solid #ffffff20',
                  borderRadius: '2px',
                  color:        '#BFBFBF',
                  fontSize:     '13px',
                  fontWeight:   500,
                  background:   '#ffffff08',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

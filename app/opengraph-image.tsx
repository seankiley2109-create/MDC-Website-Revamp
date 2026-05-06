import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Montana Data Company — Enterprise Cloud Backup & Data Protection';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #150d20 50%, #0a0a0f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '700',
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: '1.1',
            }}
          >
            Montana Data Company
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#9090b0',
              maxWidth: '820px',
              lineHeight: '1.4',
            }}
          >
            Enterprise Cloud Backup &amp; Data Protection
          </div>
          <div
            style={{
              marginTop: '16px',
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #c4006a, #ff5c00)',
              borderRadius: '10px',
              fontSize: '20px',
              color: '#ffffff',
              fontWeight: '600',
            }}
          >
            montanadc.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

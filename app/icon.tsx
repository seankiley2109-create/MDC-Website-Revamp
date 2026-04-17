import { ImageResponse } from 'next/og';

export const size        = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width:           '100%',
          height:          '100%',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: '#0A0A0A',
          borderRadius:    '4px',
        }}
      >
        {/* Pink-to-orange gradient "M" */}
        <div
          style={{
            fontSize:      '20px',
            fontWeight:    800,
            background:    'linear-gradient(135deg, #DD297D 0%, #F24567 60%, #F86C49 100%)',
            backgroundClip: 'text',
            color:         'transparent',
            letterSpacing: '-1px',
          }}
        >
          M
        </div>
      </div>
    ),
    { ...size },
  );
}

import Head from 'next/head';

const SUPABASE_BASE =
  'https://isbegleeqyrcphttrwoq.supabase.co/storage/v1/object/public/renders';

export default function RenderPage({ id, videoUrl, pageUrl }) {
  return (
    <>
      <Head>
        <title>{`Render ${id} | Plixi`}</title>
        <link rel="canonical" href={pageUrl} />

        <meta property="og:type" content="video.other" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content="Plixi Render" />
        <meta property="og:description" content="Autoplay render preview." />
        <meta property="og:video" content={videoUrl} />
        <meta property="og:video:secure_url" content={videoUrl} />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1280" />
        <meta property="og:video:height" content="720" />
        <meta property="og:video:autoplay" content="true" />
        <meta property="og:video:loop" content="true" />
        <meta property="og:video:muted" content="true" />
        <meta property="og:video:plays_inline" content="true" />

        <meta name="twitter:card" content="player" />
        <meta name="twitter:site" content="@plixi" />
        <meta name="twitter:title" content="Plixi Render" />
        <meta name="twitter:description" content="Autoplay render preview." />
        <meta name="twitter:player" content={videoUrl} />
        <meta name="twitter:player:stream" content={videoUrl} />
        <meta name="twitter:player:stream:content_type" content="video/mp4" />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
      </Head>

      <main
        style={{
          margin: 0,
          padding: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          controls
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </main>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const rawId = params?.id || '';
  const encodedId = encodeURIComponent(rawId);
  const videoUrl = `${SUPABASE_BASE}/${encodedId}.mp4`;
  const pageUrl = `https://plixi.bot/render/${encodedId}`;

  return {
    props: {
      id: rawId,
      videoUrl,
      pageUrl,
    },
  };
}

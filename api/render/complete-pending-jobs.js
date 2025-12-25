// Stage 1 render stub: marks pending render_jobs as completed with a placeholder URL.
// This is temporary scaffolding; no real rendering work happens here yet.
import { query } from '../_db.js';

const PLACEHOLDER_VIDEO_URL = 'https://www.w3schools.com/html/mov_bbb.mp4';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { rows } = await query(
      `
        update render_jobs
        set status = 'completed',
            video_url = $1,
            updated_at = now()
        where status = 'pending'
        returning id;
      `,
      [PLACEHOLDER_VIDEO_URL],
    );

    res.status(200).json({
      completedCount: rows.length,
      completedJobIds: rows.map(({ id }) => id),
      placeholderUrl: PLACEHOLDER_VIDEO_URL,
      note: 'Stage 1 stub. Safe to re-run; only pending jobs are updated.',
    });
  } catch (error) {
    console.error('Failed to complete pending render jobs', error);
    res.status(500).json({ error: 'Failed to complete pending render jobs' });
  }
}

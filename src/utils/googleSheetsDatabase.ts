import { Candidate, EvaluationRecord } from '../types';

const DATABASE_SPREADSHEET_NAME = 'Mock Placement Drive Database';
const SPREADSHEET_ID_KEY = 'placement_google_sheet_database_id';

const EVAL_HEADERS = [
  'Sr No',
  'Timestamp',
  'Student Name',
  'Roll Number',
  'Degree',
  'Target Role',
  'Round Type',
  'Total Score (/50)',
  'Verdict',
  'Interviewer Name',
  'Custom Feedback',
  'AI Automated Feedback',
  'Combined Remarks',
];

const CANDIDATE_HEADERS = [
  'Roll Number',
  'Candidate Name',
  'Degree',
  'Target Role',
  'AMCAT Score',
  'Status',
];

/**
 * Searches user's Google Drive for existing database spreadsheet or creates a new one.
 */
export async function getOrCreateDatabaseSpreadsheet(accessToken: string): Promise<string> {
  const savedId = localStorage.getItem(SPREADSHEET_ID_KEY);
  if (savedId) {
    try {
      // Validate that spreadsheet exists and user has access
      const checkRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${savedId}?fields=spreadsheetId,properties.title`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (checkRes.ok) {
        return savedId;
      }
    } catch (e) {
      console.warn('Saved spreadsheet id invalid, creating or locating another:', e);
    }
  }

  // 1. Search Google Drive for existing spreadsheet
  try {
    const query = encodeURIComponent(
      `name = '${DATABASE_SPREADSHEET_NAME}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
    );
    const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (driveRes.ok) {
      const data = await driveRes.json();
      if (data.files && data.files.length > 0) {
        const id = data.files[0].id;
        localStorage.setItem(SPREADSHEET_ID_KEY, id);
        return id;
      }
    }
  } catch (err) {
    console.warn('Drive search failed, proceeding to create new spreadsheet:', err);
  }

  // 2. Create new Google Spreadsheet with proper tables
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: DATABASE_SPREADSHEET_NAME,
      },
      sheets: [
        {
          properties: {
            title: 'Evaluations',
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: 'Candidates',
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create Google Sheet database: ${errorText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  localStorage.setItem(SPREADSHEET_ID_KEY, spreadsheetId);

  // 3. Initialize Header rows
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Evaluations!A1:M1',
            values: [EVAL_HEADERS],
          },
          {
            range: 'Candidates!A1:F1',
            values: [CANDIDATE_HEADERS],
          },
        ],
      }),
    }
  );

  return spreadsheetId;
}

/**
 * Appends an evaluation record to the Google Sheets database
 */
export async function appendEvaluationToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  record: EvaluationRecord
): Promise<boolean> {
  const rowValues = [
    record.srNo,
    record.timestamp,
    record.studentName,
    record.rollNo,
    record.degree,
    record.targetRole,
    record.evaluationType,
    record.totalScore,
    record.automatedReview.verdict,
    record.interviewerName,
    record.customFeedback || '',
    record.aiFeedback || record.automatedReview.feedbackText,
    record.interviewerRemarks,
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Evaluations!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );

  return res.ok;
}

/**
 * Syncs all evaluations & candidates to Google Sheets
 */
export async function syncAllToGoogleSheet(
  accessToken: string,
  spreadsheetId: string,
  evaluations: EvaluationRecord[],
  candidates: Candidate[]
): Promise<boolean> {
  const evalRows = evaluations.map((rec) => [
    rec.srNo,
    rec.timestamp,
    rec.studentName,
    rec.rollNo,
    rec.degree,
    rec.targetRole,
    rec.evaluationType,
    rec.totalScore,
    rec.automatedReview.verdict,
    rec.interviewerName,
    rec.customFeedback || '',
    rec.aiFeedback || rec.automatedReview.feedbackText,
    rec.interviewerRemarks,
  ]);

  const candidateRows = candidates.map((cand) => [
    cand.rollNo,
    cand.name,
    cand.degree,
    cand.targetRole,
    cand.amcatScore,
    cand.status,
  ]);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: 'Evaluations!A1:M',
            values: [EVAL_HEADERS, ...evalRows],
          },
          {
            range: 'Candidates!A1:F',
            values: [CANDIDATE_HEADERS, ...candidateRows],
          },
        ],
      }),
    }
  );

  return res.ok;
}

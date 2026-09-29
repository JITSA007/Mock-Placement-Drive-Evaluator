import * as XLSX from 'xlsx';
import { Candidate, Degree, EvaluationRecord, TargetRole } from '../types';

/**
 * Generates and downloads an Excel file of evaluation records
 * structured identically to the Google Sheets / PDF rubric format.
 */
export function exportEvaluationsToExcel(evaluations: EvaluationRecord[], filename = 'Mock_Placement_Drive_Evaluations.xlsx') {
  // Map records to clean spreadsheet columns matching PDF layout
  const rows = evaluations.map((record) => {
    return {
      'Sr No': record.srNo,
      'Timestamp': record.timestamp,
      'Student Name': record.studentName,
      'Roll Number': record.rollNo,
      'Degree': record.degree,
      'Target Role': record.targetRole,
      'Round Type': record.evaluationType === 'GD' ? 'Group Discussion (50M)' : 'Personal Interview (50M)',
      'Total Marks (/50)': record.totalScore,
      'Score %': `${((record.totalScore / 50) * 100).toFixed(0)}%`,
      'Verdict': record.automatedReview.verdict,
      'Interviewer Name': record.interviewerName,
      'Interviewer Phone': record.interviewerPhone,
      'Interviewer Remarks': record.interviewerRemarks,
      'Automated Review Summary': record.automatedReview.summary,
      // Criterion-wise scores
      ...Object.entries(record.scores).reduce((acc, [crit, val]) => {
        acc[`Score: ${crit}`] = val;
        return acc;
      }, {} as Record<string, number>),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Placement Evaluations');

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

/**
 * Exports records as a simple CSV file
 */
export function exportEvaluationsToCSV(evaluations: EvaluationRecord[], filename = 'Mock_Placement_Drive_Evaluations.csv') {
  const rows = evaluations.map((record) => ({
    'Sr No': record.srNo,
    'Timestamp': record.timestamp,
    'Student Name': record.studentName,
    'Roll Number': record.rollNo,
    'Degree': record.degree,
    'Target Role': record.targetRole,
    'Round Type': record.evaluationType,
    'Total Score': record.totalScore,
    'Verdict': record.automatedReview.verdict,
    'Interviewer Name': record.interviewerName,
    'Interviewer Phone': record.interviewerPhone,
    'Remarks': record.interviewerRemarks.replace(/,/g, ';'),
    'Automated Review': record.automatedReview.feedbackText.replace(/,/g, ';'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

/**
 * Creates and downloads a pre-populated Sample Candidates Excel file template
 * for interviewers and placement coordinators.
 */
export function downloadSampleCandidateExcel(filename = 'Sample_Candidates_List.xlsx') {
  const sampleCandidates = [
    {
      'Roll Number': '21BTECH001',
      'Full Name': 'Siddharth Sengupta',
      'Email': 'siddharth.s@campus.edu',
      'Phone': '+91 98111 22334',
      'Degree': 'B.Tech',
      'Target Role': 'Full Stack Developer',
      'AMCAT Score': 810,
    },
    {
      'Roll Number': '21MCA014',
      'Full Name': 'Divya Krishnan',
      'Email': 'divya.k@campus.edu',
      'Phone': '+91 97444 55667',
      'Degree': 'MCA',
      'Target Role': 'Data Analyst',
      'AMCAT Score': 765,
    },
    {
      'Roll Number': '21BCA032',
      'Full Name': 'Manish Chawla',
      'Email': 'manish.c@campus.edu',
      'Phone': '+91 99222 33445',
      'Degree': 'BCA',
      'Target Role': 'Tech Sales',
      'AMCAT Score': 720,
    },
    {
      'Roll Number': '21BTECH077',
      'Full Name': 'Rhea Mathur',
      'Email': 'rhea.m@campus.edu',
      'Phone': '+91 98777 88990',
      'Degree': 'B.Tech',
      'Target Role': 'Full Stack Developer',
      'AMCAT Score': 845,
    },
    {
      'Roll Number': '21MCA041',
      'Full Name': 'Harshvardhan Joshi',
      'Email': 'harsh.j@campus.edu',
      'Phone': '+91 96333 44556',
      'Degree': 'MCA',
      'Target Role': 'Data Analyst',
      'AMCAT Score': 790,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleCandidates);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates Template');

  XLSX.writeFile(workbook, filename);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into Candidate objects
 */
export async function parseCandidatesExcelFile(file: File): Promise<Candidate[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const parsedCandidates: Candidate[] = jsonRows
          .filter((row) => row['Full Name'] || row['Name'] || row['Student Name'] || row['candidate_name'])
          .map((row, index) => {
            const name = (row['Full Name'] || row['Name'] || row['Student Name'] || row['candidate_name'] || '').toString().trim();
            const rollNo = (row['Roll Number'] || row['Roll No'] || row['ID'] || row['Roll'] || `CAND-${Date.now().toString().slice(-4)}-${index + 1}`).toString().trim();
            const email = (row['Email'] || row['Email ID'] || `${rollNo.toLowerCase()}@campus.edu`).toString().trim();
            const phone = (row['Phone'] || row['Mobile'] || row['Contact'] || '').toString().trim();
            
            // Normalize degree
            const rawDegree = (row['Degree'] || row['Course'] || row['Branch'] || 'B.Tech').toString().toUpperCase();
            let degree: Degree = 'B.Tech';
            if (rawDegree.includes('MCA')) degree = 'MCA';
            else if (rawDegree.includes('BCA')) degree = 'BCA';

            // Normalize target role
            const rawRole = (row['Target Role'] || row['Role'] || row['Position'] || 'General').toString();
            let targetRole: TargetRole = 'General';
            if (/stack|full|frontend|backend|developer|software/i.test(rawRole)) targetRole = 'Full Stack Developer';
            else if (/data|analyst|analytics|bi|sql/i.test(rawRole)) targetRole = 'Data Analyst';
            else if (/sales|tech sales|bde|business/i.test(rawRole)) targetRole = 'Tech Sales';

            const amcatScore = parseInt(row['AMCAT Score'] || row['AMCAT'] || row['Aptitude'] || '700', 10) || 700;

            return {
              id: `uploaded-${Date.now()}-${index}`,
              rollNo,
              name,
              email,
              phone: phone || undefined,
              degree,
              targetRole,
              amcatScore,
              status: 'Pending',
            };
          });

        resolve(parsedCandidates);
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        reject(new Error('Invalid spreadsheet format. Please upload a valid .xlsx or .csv file.'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

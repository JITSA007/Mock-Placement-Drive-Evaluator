import { AutomatedReview, EvaluationType, TargetRole } from '../types';

interface GenerateReviewParams {
  studentName: string;
  evaluationType: EvaluationType;
  role: TargetRole;
  scores: Record<string, number>;
  totalScore: number;
}

export function generateAutomatedReview({
  studentName,
  evaluationType,
  role,
  scores,
  totalScore,
}: GenerateReviewParams): AutomatedReview {
  const percentage = (totalScore / 50) * 100;

  // Identify high-scoring and low-scoring criteria
  const entries = Object.entries(scores);
  const highScoring = entries
    .filter(([_, score]) => score >= 8)
    .map(([criterion]) => criterion);
  const lowScoring = entries
    .filter(([_, score]) => score <= 6)
    .map(([criterion]) => criterion);
  const midScoring = entries
    .filter(([_, score]) => score === 7)
    .map(([criterion]) => criterion);

  // Verdict calculation
  let verdict: AutomatedReview['verdict'] = 'Needs Improvement';
  if (percentage >= 82) {
    verdict = 'Strong Shortlist';
  } else if (percentage >= 66) {
    verdict = 'Recommended';
  } else if (percentage >= 50) {
    verdict = 'Borderline';
  }

  // Strengths determination
  const strengths: string[] = [];
  if (highScoring.length > 0) {
    highScoring.forEach(crit => {
      switch (crit) {
        case 'Communication Skills':
          strengths.push('Fluent articulation, clear voice modulation, and active listening.');
          break;
        case 'Content Knowledge':
          strengths.push('Rich factual context with logical arguments and industry awareness.');
          break;
        case 'Leadership / Initiative':
          strengths.push('Steered discussion constructively and encouraged collaborative participation.');
          break;
        case 'Teamwork / Behavior':
          strengths.push('High emotional quotient, polite disagreement, and team-first orientation.');
          break;
        case 'Body Language':
          strengths.push('Confident posture, continuous eye contact, and composed non-verbal cues.');
          break;
        case 'Professionalism':
          strengths.push('Impeccable corporate etiquette, formal presence, and punctual readiness.');
          break;
        case 'Confidence & Energy':
          strengths.push('Enthusiastic demeanour, high positive drive, and resilience under scrutiny.');
          break;
        case 'Mobility':
          strengths.push('Flexible and enthusiastic towards on-site relocation / hybrid travel mandates.');
          break;
        case 'Domain Knowledge':
          strengths.push(`Solid grasp of foundational technologies and core concepts for ${role}.`);
          break;
        default:
          strengths.push(`Demonstrated superior performance in ${crit}.`);
      }
    });
  } else {
    strengths.push('Receptive attitude and sincere willingness to engage in the evaluation process.');
  }

  // Growth areas determination
  const growthAreas: string[] = [];
  if (lowScoring.length > 0) {
    lowScoring.forEach(crit => {
      switch (crit) {
        case 'Communication Skills':
          growthAreas.push('Practice structuring answers using STAR / PREP frameworks to reduce hesitation.');
          break;
        case 'Content Knowledge':
          growthAreas.push('Deepen reading on current market trends, software architectures, and commercial use-cases.');
          break;
        case 'Leadership / Initiative':
          growthAreas.push('Take proactive steps to open discussions or synthesize diverse team viewpoints.');
          break;
        case 'Teamwork / Behavior':
          growthAreas.push('Work on yielding speaking time and acknowledging peers before countering.');
          break;
        case 'Body Language':
          growthAreas.push('Maintain steady eye contact and avoid nervous fidgeting during high-pressure queries.');
          break;
        case 'Professionalism':
          growthAreas.push('Refine formal greetings, standard corporate cadence, and resume documentation.');
          break;
        case 'Confidence & Energy':
          growthAreas.push('Boost self-assurance through mock interview drills and positive visualization.');
          break;
        case 'Mobility':
          growthAreas.push('Clarify personal logistics and expectations regarding relocation readiness.');
          break;
        case 'Domain Knowledge':
          growthAreas.push(`Review core technical questions (APIs, SQL queries, or SaaS selling fundamentals) for ${role}.`);
          break;
        default:
          growthAreas.push(`Needs more practice in ${crit}.`);
      }
    });
  } else if (midScoring.length > 0) {
    growthAreas.push(`Refine ${midScoring.join(' and ')} to elevate performance from good to standout.`);
  } else {
    growthAreas.push('Continue maintaining high standards; explore advanced architectural/leadership challenges.');
  }

  // Role fit note
  let roleFitNote = '';
  switch (role) {
    case 'Full Stack Developer':
      roleFitNote = percentage >= 70
        ? 'Well-suited for Nexora Digital Technologies engineering sprints; shows sound aptitude for frontend & backend integrations.'
        : 'Requires supplementary revisions in core SQL queries and React component lifecycle patterns before live deployments.';
      break;
    case 'Data Analyst':
      roleFitNote = percentage >= 70
        ? 'Strong potential for InsightEdge Analytics client reporting; demonstrates disciplined analytical reasoning and data handling.'
        : 'Needs focused practice with multi-table SQL queries, Pivot table calculations, and executive BI dashboarding.';
      break;
    case 'Tech Sales':
      roleFitNote = percentage >= 70
        ? 'High commercial aptitude for CloudVantage Solutions; exhibits consultative empathy, customer presence, and objection resilience.'
        : 'Needs more practice with structured 90-second value pitching and B2B SaaS objection handling techniques.';
      break;
    default:
      roleFitNote = percentage >= 70
        ? 'Promising general placement candidate demonstrating solid corporate workplace readiness.'
        : 'Recommend further practice in simulated campus drive sessions to build interview endurance.';
  }

  // Summary & Feedback generation
  let summary = '';
  let feedbackText = '';

  const roundName = evaluationType === 'GD' ? 'Group Discussion' : 'Personal Interview';

  if (verdict === 'Strong Shortlist') {
    summary = `${studentName} delivered an outstanding ${roundName} performance (${totalScore}/50, ${percentage.toFixed(0)}%), displaying executive presence and robust readiness.`;
    feedbackText = `${studentName} was a standout participant in the ${roundName} round for the ${role} profile. Notable strengths include ${highScoring.slice(0, 2).join(' and ')}, characterized by composed delivery and thorough conceptual depth. Minor polish on advanced edge-cases will make the candidate an immediate asset. Strongly recommended for the next selection tier.`;
  } else if (verdict === 'Recommended') {
    summary = `${studentName} demonstrated a solid, dependable ${roundName} performance (${totalScore}/50, ${percentage.toFixed(0)}%) with good foundational competence.`;
    feedbackText = `${studentName} gave a commendable performance in the ${roundName} round. Exhibited strong promise in ${highScoring[0] || 'core interaction'}, communicating with clarity and respectful decorum. Focusing on ${lowScoring[0] || 'substantiating points with deeper industry examples'} will further amplify overall impact. Recommended for progression.`;
  } else if (verdict === 'Borderline') {
    summary = `${studentName} achieved a borderline score (${totalScore}/50, ${percentage.toFixed(0)}%); has potential but requires targeted coaching before client rounds.`;
    feedbackText = `${studentName} showed sincere effort during the ${roundName} round, but demonstrated inconsistency across key evaluation criteria. While the candidate displayed positive intent, development is necessary in ${lowScoring.slice(0, 2).join(' and ')}. Recommend a focused review or re-evaluation after targeted practice.`;
  } else {
    summary = `${studentName} scored ${totalScore}/50 (${percentage.toFixed(0)}%) and requires foundational upskilling before placement readiness.`;
    feedbackText = `During the ${roundName} round, ${studentName} struggled to meet the expected benchmarks, particularly in ${lowScoring.slice(0, 2).join(' and ') || 'core criteria'}. The candidate is advised to participate in remedial mock drives and practice structured answering before attending final company interviews.`;
  }

  return {
    verdict,
    summary,
    strengths,
    growthAreas,
    roleFitNote,
    feedbackText,
  };
}

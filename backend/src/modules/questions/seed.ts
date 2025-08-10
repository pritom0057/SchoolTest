import { Question } from './question.model.js'
import { Competency } from '../competencies/competency.model.js'

export const COMPETENCIES: string[] = [
    'Computer Basics',
    'Operating Systems',
    'File Management',
    'Web Browsing',
    'Online Safety',
    'Email & Communication',
    'Word Processing',
    'Spreadsheets',
    'Presentations',
    'Databases',
    'Collaboration Tools',
    'Cloud Services',
    'Cybersecurity Basics',
    'Privacy & Data Protection',
    'Digital Citizenship',
    'Search & Information Literacy',
    'Social Media',
    'Coding Fundamentals',
    'Networking Basics',
    'Hardware & Peripherals',
    'Troubleshooting',
    'Accessibility & Inclusive Design',
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export async function seedQuestionsIfEmpty() {
    const count = await Question.estimatedDocumentCount();
    if (count > 0) return;
    const docs: any[] = [];
    let idx = 0;
    for (const level of LEVELS) {
        for (const comp of COMPETENCIES) {
            const base = `${comp} - ${level}`;
            const correctIndex = idx % 3; // 0..2
            const options = [
                { key: '0', text: `Basic concept related to ${base}` },
                { key: '1', text: `Intermediate concept related to ${base}` },
                { key: '2', text: `Advanced concept related to ${base}` },
                { key: '3', text: `Irrelevant concept unrelated to ${base}` },
            ];
            // Mark the correct option clearly in text for testing
            if (options[correctIndex]) {
                options[correctIndex].text = `${options[correctIndex].text} (correct)`;
            }
            docs.push({
                competency: comp,
                level,
                text: `In the context of ${base}, which option is most appropriate?`,
                options,
                correctKey: String(correctIndex),
                active: true,
            });
            idx++;
        }
    }
    await Question.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} questions`);
}

export async function seedCompetenciesIfEmpty() {
    const count = await Competency.estimatedDocumentCount();
    if (count > 0) return;
    const docs = COMPETENCIES.map(name => ({ name, active: true }));
    await Competency.insertMany(docs as any);
    console.log(`✅ Seeded ${docs.length} competencies`);
}

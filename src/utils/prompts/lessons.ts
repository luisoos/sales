export type leadTemperature = 'warm' | 'mixed' | 'cold' | 'hostile';

export type Lesson = {
    id: number;
    slug: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    levelLabel: string;
    title: string;
    personaName: string;
    personaRole: string;
    companyDescription: string;
    leadTemperature: leadTemperature;
    summary: string;
    primaryPainPoints: string[];
    goal: string;
};

export const lessons: Lesson[] = [
    {
        id: 1,
        slug: 'beginner',
        levelLabel: 'Beginner',
        title: 'Warm lead with budget concerns (Marketing automation demo)',
        personaName: 'Sarah Thompson',
        personaRole: 'Marketing Manager',
        companyDescription: 'Fifty-person software company, Q4 budget planning',
        leadTemperature: 'warm',
        summary:
            'Sarah requested a demo after downloading a whitepaper and is interested but mentioned budget concerns. You need to qualify needs and book a technical demo.',
        primaryPainPoints: [
            'Manual lead scoring processes',
            'Limited reporting that makes ROI hard to show to leadership',
        ],
        goal: 'Qualify specific needs and schedule a technical demonstration tailored to requirements',
    },
    {
        id: 2,
        slug: 'intermediate',
        levelLabel: 'Intermediate',
        title: 'Skeptical referral with past vendor disappointment (Manufacturing ops)',
        personaName: 'Michael Chen',
        personaRole: 'Operations Director',
        companyDescription: 'Five hundred-employee manufacturing company',
        leadTemperature: 'mixed',
        summary:
            'Michael was referred but has not replied to emails and is skeptical due to a negative ERP experience. Overcome resistance and uncover aligned business needs.',
        primaryPainPoints: [
            'Inventory management inefficiencies',
            'Production scheduling challenges affecting delivery commitments',
        ],
        goal: 'Overcome initial resistance and identify genuine business needs that align with your solution',
    },
    {
        id: 3,
        slug: 'advanced',
        levelLabel: 'Advanced',
        title: 'Analytical procurement leader comparing vendors (Retail enterprise)',
        personaName: 'Jennifer Rodriguez',
        personaRole: 'Chief Procurement Officer',
        companyDescription:
            'Fortune 500 retail chain evaluating multiple solutions',
        leadTemperature: 'cold',
        summary:
            'Jennifer is cost-focused, on a tight timeline, and evaluating three competitors. Differentiate and secure her commitment to proceed.',
        primaryPainPoints: [
            'Supply chain visibility challenges',
            'Vendor performance management across regions and categories',
        ],
        goal: 'Differentiate clearly and secure commitment to move forward',
    },
    {
        id: 4,
        slug: 'expert',
        levelLabel: 'Expert',
        title: 'Hostile CFO driving cost reduction and consolidation (Global logistics)',
        personaName: 'David Patel',
        personaRole: 'Chief Financial Officer',
        companyDescription:
            'Global logistics enterprise under budget freeze with strict compliance',
        leadTemperature: 'hostile',
        summary:
            'David demands steep discounts with penalties and threatens to choose a competitor bundle. Defend value and reframe to executive business impact.',
        primaryPainPoints: [
            'Fragmented data systems',
            'Rising operating costs across regions',
            'Missed SLAs impacting satisfaction and retention',
        ],
        goal: 'Secure agreement for a limited executive trial with clear success criteria',
    },
];

export function getLessonBySlug(slug: Lesson['slug']): Lesson | undefined {
    return lessons.find((l) => l.slug === slug);
}

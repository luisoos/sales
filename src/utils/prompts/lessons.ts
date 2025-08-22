export type leadTemperature = 'warm' | 'mixed' | 'cold' | 'hostile';

export type Character = {
    id: number;
    name: string;
    role: string;
    avatarUrl: string;
};

export type Lesson = {
    id: number;
    slug: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    levelLabel: string;
    title: string;
    character: Character;
    companyDescription: string;
    leadTemperature: leadTemperature;
    summary: string;
    primaryPainPoints: string[];
    goal: string;
};

export const characters: Character[] = [
    {
        id: 1,
        name: 'Sarah Thompson',
        role: 'Marketing Manager',
        avatarUrl: 'https://i.pravatar.cc/80?img=1',
    } as Character,
    {
        id: 2,
        name: 'Michael Chen',
        role: 'Operations Director',
        avatarUrl: 'https://i.pravatar.cc/80?img=2',
    } as Character,
    {
        id: 3,
        name: 'Jennifer Rodriguez',
        role: 'Chief Procurement Officer',
        avatarUrl: 'https://i.pravatar.cc/80?img=3',
    } as Character,
    {
        id: 4,
        name: 'David Patel',
        role: 'Chief Financial Officer',
        avatarUrl: 'https://i.pravatar.cc/80?img=4',
    } as Character,
    {
        id: 5,
        name: 'Amina Yusuf',
        role: 'Product Lead',
        avatarUrl: 'https://i.pravatar.cc/80?img=5',
    } as Character,
    {
        id: 6,
        name: 'Lucas Müller',
        role: 'IT Manager',
        avatarUrl: 'https://i.pravatar.cc/80?img=6',
    } as Character,
    {
        id: 7,
        name: 'Priya Singh',
        role: 'Sales Director',
        avatarUrl: 'https://i.pravatar.cc/80?img=7',
    } as Character,
    {
        id: 8,
        name: 'Ethan Brown',
        role: 'Data Analyst',
        avatarUrl: 'https://i.pravatar.cc/80?img=8',
    } as Character,
    {
        id: 9,
        name: 'Maria Garcia',
        role: 'HR Business Partner',
        avatarUrl: 'https://i.pravatar.cc/80?img=9',
    } as Character,
    {
        id: 10,
        name: 'Tom Williams',
        role: 'Operations VP',
        avatarUrl: 'https://i.pravatar.cc/80?img=10',
    } as Character,
];

export const lessons: Lesson[] = [
    {
        id: 1,
        slug: 'beginner',
        levelLabel: 'Beginner',
        title: 'Warm lead with budget concerns (Marketing automation demo)',
        character: characters[0]!,
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
        character: characters[1]!,
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
        character: characters[2]!,
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
        character: characters[3]!,
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

export function getLessonById(id: Lesson['id']): Lesson | undefined {
    return lessons.find((l) => l.id === id);
}

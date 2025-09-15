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

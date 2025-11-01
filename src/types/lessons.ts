export type leadTemperature = 'warm' | 'mixed' | 'cold' | 'hostile';

export type Character = {
    id: number;
    name: string;
    role: string;
    avatarUrl: string;
    voice: string;
};

export type Product = {
    id: number;
    title: string;
    description: string;
    category: string;
    features: string[];
};

export type Lesson = {
    id: number;
    product: Product;
    levelLabel: string;
    title: string;
    character: Character;
    companyDescription: string;
    leadTemperature: leadTemperature;
    summary: string;
    primaryPainPoints: string[];
    goal: string;
};

'use client';

import Call from '~/components/call';
import Link from 'next/link';
import { lessons } from '~/utils/prompts/lessons';

export default function Page() {
    return (
        <>
            <h1>All Lections</h1>
            <ul>
                {lessons.map((lesson) => (
                    <li key={lesson.id}>
                        <Link href={`/dashboard/calls/${lesson.slug}`}>
                            {lesson.levelLabel}: {lesson.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}

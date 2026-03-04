import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "University Events & Deadlines",
    description: "Stay updated with the latest academic events, deadlines, and schedules at the University of Lahore. Manage your personal academic calendar with Lucid Aura.",
    keywords: ["UOL Events", "University of Lahore Events", "Academic Calendar UOL", "Student Deadlines", "UOL Exam Dates"],
};

export default function EventsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "UOL GPA Calculator | Calculate SGPA & CGPA",
    description: "Fast and accurate GPA calculator for University of Lahore (UOL) students. Calculate your SGPA and CGPA based on UOL's grading system.",
    keywords: ["UOL GPA Calculator", "University of Lahore GPA", "SGPA Calculator", "CGPA Calculator", "UOL Grading System", "Calculate GPA UOL"],
};

export default function GPALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

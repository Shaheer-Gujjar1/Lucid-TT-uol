'use client';

import GPACalculator from '@/components/GPA/GPACalculator';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';

export default function GPAPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-10">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 max-w-5xl">
                <GPACalculator />
                <div className="animate-fade-in-up">
                    <Footer />
                </div>
            </main>
        </div>
    );
}

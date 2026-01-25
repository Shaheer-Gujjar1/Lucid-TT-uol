# What is Lucid Timetable?

**Lucid Timetable** is the ultimate academic schedule management tool tailored for the University of Lahore (UOL). It combines aesthetic excellence with powerful data processing to deliver a seamless experience for students and faculty.

---

## 🚀 Core Features

### 1. Advanced Timetable Viewer
The heart of the application is the dynamic timetable viewer, offering multiple ways to visualize your schedule.

#### **A. Views**
-   **Day View**: A focused, vertical list of classes for a specific day.
    -   **Real-Time Status**: Automatically highlights the *currently active* class with a pulsing "NOW" badge.
    -   **Auto-Refresh**: Updates every minute to ensure the current status is accurate.
    -   **Free Slot Detection**: Explicitly shows "FREE" blocks when no classes are scheduled, with distinct green styling.
-   **Week View**: A responsive grid layout showing the entire week's schedule at a glance.
    -   **Adaptive Grid**: Automatically adjusts from 1 to 3 columns based on screen size.
    -   **Daily Summary**: Groups classes by day.

#### **B. Smart Cards (The Class Blocks)**
Each class slot is presented as a rich data card containing:
-   **Essential Info**: Course Title, Instructor Name, and Time Range.
-   **Location Intelligence**: Room Number and Class Section (e.g., "BSCS-5A").
-   **Type Recognition**: Visual distinction between **LECTURE** (Blue Theme) and **LAB** (Amber Theme).
-   **Clash Detection**: Automatically detects if two classes overlap and flags the slot with a red **"CLASH"** warning badge.
-   **Active State**: If a class is currently happening, the card transforms into a **Vibrant Gradient (Indigo-Purple)** with animated indicators.

#### **C. Operational Modes**
The application adapts to different user needs via the **Mode Switcher**:
1.  **🎓 Student Mode**: Optimized for finding specific class schedules.
2.  **👨‍🏫 Teacher Mode**: Allows filtering by Instructor Name to find faculty schedules.
3.  **🚪 Room Mode**: Enables checking room availability and schedule by Room Number.
4.  **📝 Exam Mode**: Switches the interface to the specialized **Exam Seating Plan** module.

---

### 2. Intelligent Exam Seating Plan 🧠
A strictly engineered module for processing complex Exam PDFs.

-   **PDF Parsing Engine**: Upload any Exam Seating Plan PDF (even multi-page).
-   **Layout Algorithms**:
    -   **Page Isolation**: Processes each page independently to prevent data mixing.
    -   **Fixed 3-Column Grid**: Rigidly structures the page to accurately map students to their columns.
    -   **Left-Align Correction**: Handles misaligned text common in generated PDFs.
-   **Smart Header parsing**:
    -   **Row/Course Detection**: Intelligently separates "Row 1 - BSCS" from "Row 1 - Data Structures" using heuristic text analysis.
    -   **Subject Mapping**: Associates the correct Course Name with every student, even if the header is visually distant.
-   **Student Finder**: Instantly search by **Student ID** or **Name** to retrieve:
    -   Seat Number
    -   Row Number (e.g., "Row 1")
    -   Room Name
    -   Course & Class

---

### 3. User Experience & Design 🎨
-   **Glassmorphism UI**: Uses translucent backdrops, blur effects, and smooth gradients for a premium feel.
-   **Micro-Interactions**: Hover effects, scaling cards, and subtle animations (fade-ins, bounces) make the app feel alive.
-   **Dark Mode**: Fully supported dark theme that automatically adapts to system preferences or user toggle.
-   **Loading States**: Custom skeletons and animated spinners (e.g., "Updating Schedule...") provide feedback during data fetches.

### 4. Event Management 📅
-   **Event Dashboard**: A dedicated section to view upcoming university events.
-   **Management Tools**: Interfaces for administrators to Create, Edit, and List academic or social events.

---

### 5. Datesheet Module 🗓️
A dedicated view for tracking mid-term and final exam schedules.
-   **Date-Grouped Layout**: Exams are automatically categorized by date, with sticky headers to keep the day in focus as you scroll.
-   **Smart Venue Parsing**: Automatically decodes venue strings (e.g., "101102" -> "101 | 102") to clearly show multiple rooms.
-   **Exam Cards**: Displays Program, Semester, Section, Time, and Venue in a consistent, readable format.
-   **Empty State**: Friendly "No Exams Found" prompt guides users when the schedule is not yet published.

---

## 🛠 Technology Stack

### Frontend Architecture
-   **Next.js 16.1.1 (App Router)**: The backbone, providing server-side rendering and routing.
-   **React 19**: Leveraging the latest React hooks (`useOptimistic`, `useActionState`) and Server Components.
-   **TypeScript**: Ensures type safety across the complex parsing logic and component props.

### Styling System
-   **Tailwind CSS 4**: The latest utility-first engine for zero-runtime styles.
-   **PostCSS**: For modern CSS transformations.
-   **Custom Design Tokens**: Variables for gradients, shadows, and glass effects defined in `globals.css`.

### Data Processing
-   **pdf2json**: The critical engine for parsing raw PDF buffers into JSON coordinates (X, Y, Text).
-   **Regular Expressions**: Heavily used for extracting Student IDs (`\d{6,}`), Room formats, and Course Codes.
-   **SheetJS (xlsx)**: Capability to handle Excel-based timetable data sources.

### Performance
-   **Turbopack**: Powering the dev server for instant HMR updates.
-   **Client-Side Caching**: React `useEffect` and `memo` are used strategically to prevent unnecessary re-renders of heavy slot cards.

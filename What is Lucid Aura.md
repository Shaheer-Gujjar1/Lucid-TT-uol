# What is Lucid Aura∞? | The Definitive, Immersive Guide (v6.6.16)

**Lucid Aura∞** is not just an application—it is the definitive academic intelligence ecosystem designed exclusively for the University of Lahore (UOL). From dynamic, real-time timetables to intelligent exam coordination and an advanced AI assistant, every pixel and function is engineered for a premium university experience.

---

## 📖 Table of Contents
1.  [Application Pages](#-application-pages)
2.  [Operational Modes](#-operational-modes)
3.  [Core Modules & Features](#-core-modules--features)
4.  [The AI Aura∞ Assistant](#-the-ai-aura-assistant-nlp-engine)
5.  [User Experience & Design](#-user-experience--design-system)
6.  [Technical Architecture](#-technical-architecture)

---

## 📄 Application Pages

Lucid Aura consists of three main navigable pages, each with a dedicated purpose.

### 1. Main Timetable Page (`/`)
The heart of the application. This is where users interact with the schedule in four distinct modes.
-   **Components**: `ModeToggle`, `FilterBar`, `ViewToggle`, `DayView`/`WeekView`, `ProcessSlotCard`, `TimetablePrintView`, `ExamView`.
-   **Modals**: `InfoModal`, `DatesheetDownloadModal`, `SeatingPlanDownloadModal`.

### 2. Events Page (`/events`)
A personal academic planner for managing assignments, quizzes, projects, and other life events.
-   **Components**: `EventForm`, `EventList`.
-   **Modals**: `ConfirmationModal`, `InfoModal`.
-   **Key Features**:
    -   **Time-Based Filters**: "Today", "All", "Overdue" toggle buttons.
    -   **Priority Filters**: "High", "Medium", "Low" toggle buttons (can combine with time filter).
    -   **Stats Cards**: Total, Done, and Pending event counts.
    -   **Notification Permission Prompt**: A button to enable browser notifications for alerts.
    -   **Irreversible Completion Warning**: A `ConfirmationModal` warns users before marking a task complete.

### 3. GPA Calculator Page (`/gpa`)
A high-fidelity academic performance tracker.
-   **Components**: `GPACalculator`, `SemesterCard`, `SubjectRow`, `GPAStats`.
-   **Modals**: `GPAReportDownloadModal`, `InfoModal`.
-   **Key Features**:
    -   **IndexedDB Persistence**: All GPA data is stored in `IndexedDB`, surviving browser refreshes.
    -   **Undo/Redo System**: Full support for `Ctrl+Z` (Undo) and `Ctrl+Y`/`Ctrl+Shift+Z` (Redo).
    -   **History Limit**: Undo history is capped at 50 steps to prevent memory bloat.
    -   **Previous History Input**: Users can enter their previous CGPA and credits.
    -   **Report Download**: The `GPAReportDownloadModal` generates a high-fidelity image report.

---

## 🎓 Operational Modes

The application adapts its interface and filtering based on the selected mode. The `ModeToggle` component features a **Sliding Pill** animation with a custom `cubic-bezier(0.23, 1, 0.32, 1)` curve for a "magnetic" feel.

### 1. 🎓 Student Mode
-   **Purpose**: View personal class schedules.
-   **Filters**: Program, Semester, Section, Day, Subject/Course (Optional).
-   **Preference Saving**: Users can save their profile (`lucid_student_prefs`) for instant loading on next visit.

### 2. 👨‍🏫 Teacher Mode
-   **Purpose**: Find the schedule of any instructor.
-   **Filters**: Teacher Name (text search with suggestions), Day.
-   **Data Source**: Auto-complete suggestions are pulled from `TEACHERS` constant.

### 3. 🏢 Room Mode
-   **Purpose**: Check the availability and schedule of any room on campus.
-   **Filters**: Room Number (text input), Day.

### 4. 📝 Exam Mode
-   **Purpose**: Access exam-related data.
-   **Sub-Views** (controlled by `examView` state):
    -   **Datesheet (`datesheet`)**: View the official exam schedule, grouped by date. Features a Date filter and Course Search.
    -   **Seating Plan (`seating`)**: Find seat assignments by Name or ID. Features Class and Course filters and a Search Input.
-   **Special Logic**: The `ExamView` component handles file selection, PDF parsing via `pdf2json`, and smart caching with a 30-minute validity window.

---

## 🔧 Core Modules & Features

### The Timetable Engine
-   **View Toggle**: Switch between `DayView` (vertical list) and `WeekView` (responsive grid).
-   **Real-Time "NOW" Indicator**: The `DayView` uses a 60-second `setInterval` state-tick to re-calculate which slot is currently active. Active slots get a pulsing "NOW" badge and a vibrant indigo-purple gradient.
-   **Clash Detection**: If a time slot has more than one course entry, the `ProcessSlotCard` displays a red "CLASH" badge.
-   **Free Slot Detection**: Empty time slots are rendered as explicit "FREE" blocks with a green-themed card.
-   **Type Recognition**: "LAB" sessions get an amber theme, while "LECTURE" sessions get a sky-blue theme.
-   **Collapsible FilterBar**: On mobile, the `FilterBar` collapses into a single toggle header to save screen real estate. Dropdowns are managed by `activeDropdown` state to prevent overlapping.
-   **Swipe Gestures**: Users can swipe left/right on the timetable to navigate between days (documented in InfoModal).

### The Background Sync Engine (`sync_service.ts`)
-   **24-Hour Sync Interval**: On load, if the local data is older than 24 hours, a fresh fetch is triggered from the server.
-   **Heartbeat Change Detection**: A lightweight `detectSheetChanges` function compares a hash from the Google Sheet to the local hash. If a change is detected, the UI indicates an update is available.
-   **Timeout Safety**: All fetches have a 10-second (sync) or 5-second (heartbeat) timeout via `AbortController`.

### The Notification Engine (`notification_service.ts`)
A multi-stage alert system for events, with priority given to Service Workers for mobile support.
-   **T-Minus 24h (dayBefore)**: "Upcoming" alert fired ~24 hours before an event.
-   **T-Minus 1h (hourBefore)**: "Reminder"/"Happening Now" alert fired 1 hour before or at the start of an event.
-   **T-Plus 12h (overdue)**: "Overdue" alert fired 12 hours after a non-completed event's start time.
-   **Deduplication**: A `NotificationLog` in `localStorage` prevents the same alert from firing twice.

### The Timetable Parser (`parser.ts`)
-   **Numerical Equivalence**: Heuristic logic treats "Numerical Analysis" and "Numerical Computing" as duplicates.
-   **Lab Duration Rules**: For CSIT departments, labs are forced to span 3 slots (4.5 hours).
-   **Biology Filtering**: A dedicated `isBiologyCourse` function filters out biology courses for non-biology programs.
-   **Duplicate Removal**: An 80% similarity threshold (using character matching) is used to prevent showing near-identical course entries.

---

## 🤖 The AI Aura∞ Assistant (NLP Engine)

Located in `lib/lucid-chat/`, the AI is a local-first, regex-powered NLP engine designed for instant response.

### Intelligence Layers
-   **Smart Disambiguation**: If a search term (e.g., "Ahmed") matches multiple database entries, Aura enters a "Clarification State" (`pendingContext: 'search_disambiguation'`).
-   **Contextual Short-Term Memory**: Multi-turn conversations are supported. If you search for a seat and then ask *"Where is it?"*, Aura retains the context.
-   **Universal Smart Escape**: Any active wizard or prompt can be aborted by typing a new high-confidence query.
-   **Fact Persistence**: Aura remembers your role and identity using a localized fact-memory system (`lucid_user_facts`).
-   **Interactive Event Wizard**: A state-machine (`pendingContext: 'waiting_for_event_...'`) guides users through creating events via conversation, with smart autofill if details are provided upfront.
-   **Stopword Logic**: Common words like "schedule", "timetable", "next", "upcoming", "which", "ongoing", "is", "in", "of" are stripped from queries to improve search accuracy.
-   **Room Search Priority**: Queries containing 3-digit numbers or keywords like "room", "hall", "lab" are prioritized as Room Mode searches.

---

## 🎨 User Experience & Design System

### Premium Visuals
-   **Glassmorphism Engine**: Uses translucent backgrounds (`bg-white/80`), `backdrop-blur`, and smooth gradients.
-   **Adaptive Blur**: On mobile, `backdrop-blur` is disabled for performance.
-   **The Sliding Pill**: The `ModeToggle` features a gliding pill indicator with a custom bezier curve.
-   **Staggered Animations**: Slot cards use `animationDelay` based on their index for a cascading "fade-in-up" effect.
-   **"Breathing" Infinity**: The `∞` symbol in the Navbar has a gradient animation.

### The Floating Action Button (FAB)
A **System FAB** is present on all three pages, providing unified access to common actions.
-   **Main Toggle**: A gradient chevron button that expands/collapses the menu.
-   **Menu Items**: Vary by page:
    -   **Main Page**: Online Status, AI Robot, Download, Info.
    -   **Events Page**: Online Status, AI Robot, Add Event (+), Info.
    -   **GPA Page**: Online Status, Download Report, Info.

### The Info Modal (4 Tabs)
Accessed via the FAB, this modal provides a comprehensive application guide.
-   **About Tab**: Version, Release Date, Developer Portfolio link.
-   **Features Tab**: Detailed descriptions of Student, Teacher, Room, Exam modes, Smart Gestures, and GPA Calculator.
-   **Aura AI Tab**: Usage tips and example commands for the AI assistant.
-   **Credits Tab**: Attribution and links.

---

## 🛠️ Technical Architecture

-   **Framework**: Next.js 16 (App Router) + React 19.
-   **Styling**: Tailwind CSS 4 (Utility-first).
-   **Fonts**: Outfit, Plus Jakarta Sans (Google Fonts).
-   **Data Processing**: `pdf2json`, `SheetJS (xlsx)`.
-   **Storage**: `localStorage` (Preferences, Events, Sync Metadata), `IndexedDB` (GPA State).
-   **State Management**: React `useState`, `useEffect`, and `useRef` for local state; localStorage for cross-session persistence.

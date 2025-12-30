
export interface AgendaEvent {
    id: string;
    title: string;
    type: string;
    course: string;
    date: string;
    time: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    completed: boolean;
    reminder: boolean;
}

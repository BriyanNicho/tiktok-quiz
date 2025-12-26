import { useState, useEffect, useCallback } from 'react';
import { sampleQuestions } from '../data/questions';
import { exportToCSV } from '../utils/csvParser';

const STORAGE_KEY = 'tiktok_quiz_questions';

export function useQuestionManager() {
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load questions from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setQuestions(parsed);
            } catch {
                setQuestions(sampleQuestions);
            }
        } else {
            setQuestions(sampleQuestions);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever questions change
    useEffect(() => {
        if (isLoaded && questions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
        }
    }, [questions, isLoaded]);

    // Add a new question
    const addQuestion = useCallback((questionData) => {
        const newQuestion = {
            ...questionData,
            id: questionData.id || Date.now()
        };
        setQuestions(prev => [...prev, newQuestion]);
        return newQuestion;
    }, []);

    // Update an existing question
    const updateQuestion = useCallback((id, updates) => {
        setQuestions(prev =>
            prev.map(q => q.id === id ? { ...q, ...updates } : q)
        );
    }, []);

    // Delete a question
    const deleteQuestion = useCallback((id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        // Adjust current index if needed
        setCurrentIndex(prev => Math.min(prev, questions.length - 2));
    }, [questions.length]);

    // Bulk import from CSV
    const importFromCsv = useCallback((newQuestions, replace = false) => {
        if (replace) {
            setQuestions(newQuestions);
            setCurrentIndex(0);
        } else {
            setQuestions(prev => [...prev, ...newQuestions]);
        }
        return newQuestions.length;
    }, []);

    // Export to CSV
    const exportToCsv = useCallback(() => {
        const csv = exportToCSV(questions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz_questions_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }, [questions]);

    // Reorder questions
    const reorderQuestions = useCallback((fromIndex, toIndex) => {
        setQuestions(prev => {
            const newList = [...prev];
            const [removed] = newList.splice(fromIndex, 1);
            newList.splice(toIndex, 0, removed);
            return newList;
        });
    }, []);

    // Reset to sample questions
    const resetToSample = useCallback(() => {
        setQuestions(sampleQuestions);
        setCurrentIndex(0);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Navigation
    const currentQuestion = questions[currentIndex] || null;

    const goToQuestion = useCallback((index) => {
        if (index >= 0 && index < questions.length) {
            setCurrentIndex(index);
        }
    }, [questions.length]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return true;
        }
        return false;
    }, [currentIndex, questions.length]);

    const prevQuestion = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            return true;
        }
        return false;
    }, [currentIndex]);

    return {
        // State
        questions,
        currentQuestion,
        currentIndex,
        totalQuestions: questions.length,
        isLoaded,

        // CRUD
        addQuestion,
        updateQuestion,
        deleteQuestion,

        // Import/Export
        importFromCsv,
        exportToCsv,

        // Utilities
        reorderQuestions,
        resetToSample,

        // Navigation
        goToQuestion,
        nextQuestion,
        prevQuestion
    };
}

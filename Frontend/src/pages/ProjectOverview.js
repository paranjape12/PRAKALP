import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar/Navbar';


function ProjectOverview() {

    const today = new Date();

    const daysOfWeek = [
        'Sun',
        'Mon',
        'Tue',
        'Wed',
        'Thu',
        'Fri',
        'Sat',
    ];

    const [dates, setDates] = useState([]);
    const [startDateIndex, setStartDateIndex] = useState(0);

    useEffect(() => {
        const newDates = [];
        let currentDate = new Date(today);
        const startIndex = startDateIndex; // Start index for the new dates array
        for (let i = 0; i < 7; i++) {
            const newDate = new Date(currentDate.setDate(currentDate.getDate() + startIndex + i)); // Adjusted date calculation
            newDates.push({
                date: newDate,
                dateString: newDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                day: daysOfWeek[newDate.getDay()],
                isSunday: newDate.getDay() === 0,
            });
            currentDate = new Date(today);
        }
        setDates(newDates);
    }, [startDateIndex]);

    const handleNextDayClick = () => {
        const nextIndex = startDateIndex + 7;
        setStartDateIndex(nextIndex);
    };

    const handlePreviousDayClick = () => {
        const previousIndex = startDateIndex - 7;
        setStartDateIndex(previousIndex);
    };


    return (
        <div>{dates.length > 0 && (
            <Navbar
                onPreviousDayClick={handlePreviousDayClick}
                onNextDayClick={handleNextDayClick}
                dates={dates}
            />
        )}</div>
    )
}

export default ProjectOverview
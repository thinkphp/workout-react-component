import { useState, useEffect } from 'react';
import './WorkoutCalendar.css'; // Import the CSS file

const WorkoutCalendar = () => {
  const [workouts, setWorkouts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({
    pushups: 0,
    pullups: 0,
    abs: 0,
    squats: 0
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const savedWorkouts = localStorage.getItem('workoutData');
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts).map(workout => ({
        ...workout,
        squats: workout.squats || 0
      })));
    }
  };

  const getWorkoutIntensity = (workout) => {
    if (!workout) return 'bg-green-light';
    const total = Object.values(workout)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);
    if (total > 150) return 'bg-green-dark';
    if (total > 75) return 'bg-green-medium';
    return 'bg-green-light';
  };

  const isCurrentDay = (day) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear();
  };

  const openModal = (date) => {
    setSelectedDate(date);
    const workout = workouts.find(w => w.date === date) || {
      pushups: 0,
      pullups: 0,
      abs: 0,
      squats: 0
    };
    setFormData(workout);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const saveWorkout = () => {
    const workout = {
      date: selectedDate,
      ...formData
    };

    const newWorkouts = workouts.map(w =>
      w.date === selectedDate ? workout : w
    );

    if (!workouts.some(w => w.date === selectedDate)) {
      newWorkouts.push(workout);
    }

    setWorkouts(newWorkouts);
    localStorage.setItem('workoutData', JSON.stringify(newWorkouts));
    closeModal();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const navigateMonth = (increment) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + increment);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const workout = workouts.find(w => w.date === date);

      days.push(
        <div
          key={date}
          onClick={() => openModal(date)}
          className={`day-cell ${isCurrentDay(day) ? 'day-cell-current-day' : getWorkoutIntensity(workout)}`}
        >
          <div className="text-lg">{day}</div>
          {workout && (
            <div className="text-xs">
              {Object.entries(workout)
                .filter(([key]) => key !== 'date')
                .map(([key, value]) => (
                  <div key={key} className="capitalize">
                    {key}: {value}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="workout-calendar">
      <div className="header-container">
        <button
          className="button button-prev"
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
        >
          &lt;
        </button>
        <h1 className="month-title">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h1>
        <button
          className="button button-next"
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

      <div className="calendar-grid">
        {renderCalendar()}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">Add Workout for {selectedDate}</div>
            <div>
              <input
                type="number"
                value={formData.pushups}
                onChange={(e) => setFormData({ ...formData, pushups: e.target.value })}
                className="input-field"
                placeholder="Push-ups"
              />
              <input
                type="number"
                value={formData.pullups}
                onChange={(e) => setFormData({ ...formData, pullups: e.target.value })}
                className="input-field"
                placeholder="Pull-ups"
              />
              <input
                type="number"
                value={formData.abs}
                onChange={(e) => setFormData({ ...formData, abs: e.target.value })}
                className="input-field"
                placeholder="Abs"
              />
              <input
                type="number"
                value={formData.squats}
                onChange={(e) => setFormData({ ...formData, squats: e.target.value })}
                className="input-field"
                placeholder="Squats"
              />
            </div>
            <div className="modal-buttons">
              <button onClick={saveWorkout} className="button">Save</button>
              <button onClick={closeModal} className="button">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast">
          <span>Workout saved successfully!</span>
          <button className="toast-close" onClick={() => setShowToast(false)}>×</button>
        </div>
      )}
    </div>
  );
};

export default WorkoutCalendar;
